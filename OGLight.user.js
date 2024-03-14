// ==UserScript==
// @name         OGLight
// @namespace    https://openuserjs.org/users/nullNaN
// @version      5.0.2
// @description  OGLight script for OGame
// @author       Oz
// @license      MIT
// @copyright    2019, Oz
// @match        https://*.ogame.gameforge.com/game/*
// @updateURL    https://openuserjs.org/meta/nullNaN/OGLight.meta.js
// @downloadURL  https://openuserjs.org/install/nullNaN/OGLight.user.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_getTab
// @grant        GM_saveTab
// @run-at       document-start
// ==/UserScript==
'use strict';

// redirect user if needed
const oglRedirection = localStorage.getItem('ogl-redirect');
if(oglRedirection?.indexOf('https') > -1)
{
    GM_addStyle(`
        body { background:#000 !important; }
        body * { display:none !important; }
    `);

    setTimeout(() => window.location.replace(oglRedirection));

    localStorage.setItem('ogl-redirect', false);
}

function goodbyeTipped()
{
    if(typeof Tipped !== 'undefined')
    {
        for(let [key] of Object.entries(Tipped))
        {
            Tipped[key] = function() { return false; }
        }
    }
    else requestAnimationFrame(() => goodbyeTipped());
}

goodbyeTipped();

if(unsafeWindow?.ogl) unsafeWindow.ogl = null;

// update body attributes as fast as possible
const updateOGLBody = () =>
{
    document.body.setAttribute('data-minipics', localStorage.getItem('ogl_minipics') || false);
    document.body.setAttribute('data-menulayout', localStorage.getItem('ogl_menulayout') || 0);
}

if(document.body)
{
    updateOGLBody();
}
else
{
    new MutationObserver(function()
    {
        if(document.body)
        {
            updateOGLBody();
            this.disconnect();
        }
    }).observe(document.documentElement, {childList: true});
}

if(typeof GM_getTab == typeof undefined)
{
    var GM_getTab = tab =>
    {
        const params = JSON.parse(GM_getValue('ogl_tab') || '{}');
        tab(params);
    }
}

if(typeof GM_saveTab == typeof undefined)
{
    var GM_saveTab = data =>
    {
        GM_setValue('ogl_tab', JSON.stringify(data ||  {}));
    }
}


let betaVersion = '-b11';
let oglVersion = '5.0.2';


class OGLight
{
    constructor(params)
    {
        // get the account ID in cookies
        const cookieAccounts = document.cookie.match(/prsess\_([0-9]+)=/g);
        const accountID = cookieAccounts[cookieAccounts.length-1].replace(/\D/g, '');

        //console.log(Util.hash('test'))

        // OGL database
        //this.DBName = `${this.server.lang}_${this.server.id}_${this.account.id}`;
        this.DBName = `${accountID}-${window.location.host.split('.')[0]}`;
        this.db = this.load();

        // fix beta old DB
        if(!GM_getValue(this.DBName) && GM_getValue(window.location.host))
        {
            GM_setValue(this.DBName, GM_getValue(window.location.host));
            GM_deleteValue(window.location.host);
            window.location.reload();
        }

        this.db.lastServerUpdate = this.db.lastServerUpdate || 0;
        this.db.lastEmpireUpdate = this.db.lastEmpireUpdate || 0;
        this.db.lastLFBonusUpdate = this.db.lastLFBonusUpdate || 0;

        this.db.udb = this.db.udb || {}; // players
        this.db.pdb = this.db.pdb || {}; // planets
        this.db.tdb = this.db.tdb || {}; // tagged positions
        this.db.myPlanets = this.db.myPlanets || {};

        this.db.dataFormat = this.db.dataFormat || 0;
        this.db.tags = Object.keys(this.db.tags || {}).length == 13 ? this.db.tags : { red:true, orange:true, yellow:true, lime:true, green:true, blue:true, dblue:true, violet:true, magenta:true, pink:true, brown:true, gray:true, none:false };
        this.db.lastPinTab = this.db.lastPinTab || 'miner';
        this.db.shipsCapacity = this.db.shipsCapacity || {};
        this.db.spytableSort = this.db.spytableSort || 'total';
        this.db.lastTaggedInput = this.db.lastTaggedInput || [];
        this.db.lastPinnedList = this.db.lastPinnedList || [];
        this.db.initialTime = this.db.initialTime || Date.now();
        this.db.fleetLimiter = this.db.fleetLimiter || { data:{}, jumpgateData:{}, shipActive:false, resourceActive:false, jumpgateActive:false };
        this.db.keepEnoughCapacityShip = this.db.keepEnoughCapacityShip || 200;
        this.db.keepEnoughCapacityShipJumpgate = this.db.keepEnoughCapacityShipJumpgate || 200;
        this.db.spyProbesCount = this.db.spyProbesCount || 6;
        this.db.configState = this.db.configState || { fleet:true, general:true, expeditions:true, stats:true, messages:true, data:true };

        this.db.options = this.db.options || {};
        this.db.options.defaultShip = this.db.options.defaultShip || 202;
        this.db.options.defaultMission = this.db.options.defaultMission || 3;
        this.db.options.resourceTreshold = this.db.options.resourceTreshold || 300000;
        this.db.options.ignoreConsumption = this.db.options.ignoreConsumption || false;
        this.db.options.ignoreExpeShipsLoss = this.db.options.ignoreExpeShipsLoss || false;
        this.db.options.useClientTime = this.db.options.useClientTime || false;
        this.db.options.displayMiniStats = typeof(this.db.options.displayMiniStats) !== "undefined" ? this.db.options.displayMiniStats : 'day';
        this.db.options.collectLinked = this.db.options.collectLinked || false;
        this.db.options.expeditionValue = this.db.options.expeditionValue || 0;
        this.db.options.expeditionBigShips = this.db.options.expeditionBigShips || [204, 205, 206, 207, 215];
        this.db.options.expeditionRandomSystem = this.db.options.expeditionRandomSystem || 0;
        this.db.options.expeditionRedirect = this.db.options.expeditionRedirect || false;
        this.db.options.expeditionShipRatio = Math.min(this.db.options.expeditionShipRatio, 100);
        this.db.options.displayPlanetTimers = this.db.options.displayPlanetTimers === false ? false : true;
        this.db.options.reduceLargeImages = this.db.options.reduceLargeImages || false;
        this.db.options.showMenuResources = this.db.options.showMenuResources || 0;
        this.db.options.autoCleanReports = this.db.options.autoCleanReports || false;
        this.db.options.tooltipDelay = this.db.options.tooltipDelay !== false ? Math.max(this.db.options.tooltipDelay, 100) : 400;
        this.db.options.spyIndicatorDelay = this.db.options.spyIndicatorDelay || 3600000; // 1h
        //this.db.options.lootFoodOnAttack = this.db.options.lootFoodOnAttack === false ? false : true;
        this.db.options.debugMode = this.db.options.debugMode || false;
        this.db.options.sim = this.db.options.sim || false;
        this.db.options.boardTab = this.db.options.boardTab === false ? false : true;
        this.db.options.msu = this.db.options.msu || '1:2:3';
        this.db.options.disablePlanetTooltips = this.db.options.disablePlanetTooltips || false;
        this.db.options.displaySpyTable = this.db.options.displaySpyTable === false ? false : true;

        this.db.options.keyboardActions = this.db.options.keyboardActions || {};
        this.db.options.keyboardActions.menu = this.db.options.keyboardActions.menu || '²';
        this.db.options.keyboardActions.previousPlanet = this.db.options.keyboardActions.previousPlanet || 'i';
        this.db.options.keyboardActions.nextPlanet = this.db.options.keyboardActions.nextPlanet || 'o';
        this.db.options.keyboardActions.nextPinnedPosition = this.db.options.keyboardActions.nextPinnedPosition || 'm';
        this.db.options.keyboardActions.fleetRepeat = this.db.options.keyboardActions.fleetRepeat || 'p';
        this.db.options.keyboardActions.fleetSelectAll = this.db.options.keyboardActions.fleetSelectAll || 'a';
        this.db.options.keyboardActions.fleetReverseAll = this.db.options.keyboardActions.fleetReverseAll || 'r';
        this.db.options.keyboardActions.expeditionSC = this.db.options.keyboardActions.expeditionSC || 's';
        this.db.options.keyboardActions.expeditionLC = this.db.options.keyboardActions.expeditionLC || 'l';
        this.db.options.keyboardActions.expeditionPF = this.db.options.keyboardActions.expeditionPF || 'f';
        this.db.options.keyboardActions.quickRaid = this.db.options.keyboardActions.quickRaid || 't';
        this.db.options.keyboardActions.fleetResourcesSplit = this.db.options.keyboardActions.fleetResourcesSplit || '2-9';
        this.db.options.keyboardActions.galaxyUp = this.db.options.keyboardActions.galaxyUp || (window.location.host.split(/[-.]/)[1] == 'fr' ? 'z' : 'w');
        this.db.options.keyboardActions.galaxyLeft = this.db.options.keyboardActions.galaxyLeft || (window.location.host.split(/[-.]/)[1] == 'fr' ? 'q' : 'a');
        this.db.options.keyboardActions.galaxyDown = this.db.options.keyboardActions.galaxyDown || 's';
        this.db.options.keyboardActions.galaxyRight = this.db.options.keyboardActions.galaxyRight || 'd';
        this.db.options.keyboardActions.galaxySpySystem = this.db.options.keyboardActions.galaxySpySystem || 'r';
        this.db.options.keyboardActions.backFirstFleet = this.db.options.keyboardActions.backFirstFleet || 'f';
        this.db.options.keyboardActions.backLastFleet = this.db.options.keyboardActions.backLastFleet || 'l';
        this.db.options.keyboardActions.discovery = this.db.options.keyboardActions.discovery || 'u';
        this.db.options.keyboardActions.showMenuResources = this.db.options.keyboardActions.showMenuResources || 'v';

        // init OGL when DOM is loaded
        if(document.readyState !== 'loading') // safari mac OS fix
        {
            this.init(params.cache);
        }
        else
        {
            document.onreadystatechange = () =>
            {
                if(document.readyState !== 'loading' && !this.isReady)
                {
                    this.isReady = true;
                    this.init(params.cache);
                } 
            };
        }
    }

    init(cache)
    {
        document.body.classList.add('oglight');

        if(this.db.options.showMenuResources)
        {
            CSSManager.miniMenu(this.db.options.showMenuResources);
        }

        if(this.db.options.reduceLargeImages)
        {
            CSSManager.miniImage(this.db.options.reduceLargeImages);
        }

        this.id = GM_getValue('ogl_id') || false;
        this.version = GM_info.script.version.indexOf('b') > -1 ? oglVersion+betaVersion : oglVersion;
        this.tooltipEvent = new Event('tooltip');

        this.mode = parseInt(new URLSearchParams(window.location.search).get('oglmode')) || 0; // 1:collect, 2:collectLinked, 3:todolist, 4:reportQuickRaid, 5:expedition
        this.page = new URL(window.location.href).searchParams.get('component') || new URL(window.location.href).searchParams.get('page');
        this.resourcesKeys = { metal:'metal', crystal:'crystal', deut:'deuterium', food:'food', population:'population', energy:'energy', darkmatter:'darkmatter' };
        this.shipsList = [202,203,204,205,206,207,208,209,210,211,213,214,215,218,219];
        this.fretShips = [202, 203, 209, 210, 219];
        this.ptreKey = localStorage.getItem('ogl-ptreTK') || false;
        this.planetType = document.querySelector('head meta[name="ogame-planet-type"]').getAttribute('content');
        this.flagsList = ['friend', 'rush', 'danger', 'skull', 'fridge', 'star', 'trade', 'money', 'ptre', 'none'];

        this.server = {};
        this.server.id = window.location.host.replace(/\D/g,'');
        this.server.name = document.querySelector('head meta[name="ogame-universe-name"]').getAttribute('content');
        this.server.lang = document.querySelector('head meta[name="ogame-language"]').getAttribute('content');
        this.server.economySpeed = parseInt(document.querySelector('head meta[name="ogame-universe-speed"]').getAttribute('content'));
        this.server.peacefulFleetSpeed = parseInt(document.querySelector('head meta[name="ogame-universe-speed-fleet-peaceful"]').getAttribute('content'));
        this.server.holdingFleetSpeed = parseInt(document.querySelector('head meta[name="ogame-universe-speed-fleet-holding"]').getAttribute('content'));
        this.server.warFleetSpeed = parseInt(document.querySelector('head meta[name="ogame-universe-speed-fleet-war"]').getAttribute('content'));

        if(this.server.id == 300 && this.server.lang == 'en') return; // graveyard

        this.account = {};
        this.account.id = document.querySelector('head meta[name="ogame-player-id"]').getAttribute('content');
        this.account.class = document.querySelector('#characterclass .sprite')?.classList.contains('miner') ? 1 : document.querySelector('#characterclass .sprite')?.classList.contains('warrior') ? 2 : 3;
        this.account.name = document.querySelector('head meta[name="ogame-player-name"]').getAttribute('content');
        this.account.rank = document.querySelector('#bar a[href*="searchRelId"]')?.parentNode.innerText.replace(/\D/g, '');
        this.account.lang = /oglocale=([a-z]+);/.exec(document.cookie)[1];

        this.db.serverData = this.db.serverData || {};
        this.db.serverData.serverTimeZoneOffsetInMinutes = unsafeWindow.serverTimeZoneOffsetInMinutes === 0 ? 0 : (unsafeWindow.serverTimeZoneOffsetInMinutes || this.db.serverData.serverTimeZoneOffsetInMinutes || 0);
        this.db.serverData.metal = unsafeWindow.loca?.LOCA_ALL_METAL || this.db.serverData.metal || 'Metal';
        this.db.serverData.crystal = unsafeWindow.loca?.LOCA_ALL_CRYSTAL || this.db.serverData.crystal || 'Crystal';
        this.db.serverData.deut = unsafeWindow.loca?.LOCA_ALL_DEUTERIUM || this.db.serverData.deut || 'Deut';
        this.db.serverData.food = unsafeWindow.loca?.LOCA_ALL_FOOD || this.db.serverData.food || 'Food';
        this.db.serverData.dm = unsafeWindow.LocalizationStrings?.darkMatter || this.db.serverData.dm || 'Darkmatter';
        this.db.serverData.energy = unsafeWindow.resourcesBar?.resources?.energy.tooltip.split('|')[0] || this.db.serverData.energy || 'Energy';
        this.db.serverData.conso = unsafeWindow.loca?.LOCA_FLEET_FUEL_CONSUMPTION || this.db.serverData.conso || 'Conso';
        this.db.serverData.noob = unsafeWindow.loca?.LOCA_GALAXY_PLAYER_STATUS_N || this.db.serverData.noob || 'n';
        this.db.serverData.vacation = unsafeWindow.loca?.LOCA_GALAXY_PLAYER_STATUS_U || this.db.serverData.vacation || 'v';
        this.db.serverData.population = 'Population';
        this.db.serverData.item = 'Item';
        this.db.serverData.topScore = this.db.serverData.topScore || 0;
        this.db.serverData.probeCargo = this.db.serverData.probeCargo || 0;
        this.db.serverData.debrisFactor = this.db.serverData.debrisFactor || 30;

        if(!this.db.serverData.probeCargo) this.fretShips = [202, 203, 209, 219];

        if(this.account.lang != this.db.userLang && this.page != 'fleetdispatch' && this.page != 'intro')
        {
            window.location.href = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch`;
            return;
        }
        else if (this.page != 'intro')
        {
            this.db.userLang = this.account.lang;
        }

        this.cache = cache || {};
        if(window.location.href.indexOf('&relogin=1') > -1) this.cache = {};

        this.updateJQuerySettings();

        if(this.page != 'empire')
        {
            // generate a new id
            if(!this.id || !this.id[0])
            {
                let uuid = [crypto.randomUUID(), 0];
                GM_setValue('ogl_id', uuid);
                this.id == uuid;
            }

            new PopupManager(this);

            this.checkDataFormat();

            new LangManager(this);
            new TimeManager(this);
            new FetchManager(this);
    
            this.getPlanetData();
            this.getServerData();
    
            new UIManager(this);
            new ShortcutManager(this);
            new TopbarManager(this);
            new FleetManager(this);
            new TooltipManager(this);
            new NotificationManager(this);
            new StatsManager(this);
            new GalaxyManager(this);
            new MessageManager(this);
            new MovementManager(this);
            new TechManager(this);
            new JumpgateManager(this);
            new EmpireManager(this);

            this.excludeFromObserver = ['OGameClock', 'resources_metal', 'resources_crystal', 'resources_deuterium', 'smallplanet',
            'resources_food', 'resources_population', 'resources_energy', 'resources_darkmatter', 'mmoNewsticker', 'mmoTickShow',
            'tempcounter', 'counter-eventlist', 'js_duration',
            'ogl_tooltip', 'ogl_tooltipTriangle', 'ogl_ready', 'ogl_addedElement'];

            Util.observe(document.body, { childList:true, subtree:true, attributes:true }, mutation =>
            {
                let isExcluded = Array.from(mutation.target.classList).some(r=> this.excludeFromObserver.includes(r)) || this.excludeFromObserver.includes(mutation.target.id) || this.excludeFromObserver.some(r => mutation.target.id.startsWith(r));

                if(!isExcluded)
                {
                    //if(mutation.target.id) console.log(mutation.target.id)

                    //if(mutation.target.classList.contains('ui-tabs-panel') && ogame.messages.getCurrentEarliestMessage() && mutation.addedNodes.length == 0) Util.runAsync(this._message.check, this._message);
                    //else if(mutation.target.getAttribute('id') == 'galaxyLoading' && !this._galaxy.isReady) Util.runAsync(this._galaxy.init, this._galaxy);
                    //else if(mutation.target.getAttribute('id') == 'technologydetails_content') Util.runAsync(this._tech.check, this._tech);
                    if(mutation.target.classList.contains('ui-dialog') && mutation.target.querySelector('.detail_msg')) Util.runAsync(this._message.checkDialog, this._message);
                    else if(mutation.target.getAttribute('id') == 'stat_list_content' && document.querySelector('#stat_list_content #ranks'))
                    {
                        Util.runAsync(this._ui.updateHighscore, this._ui);
                        Util.runAsync(this._ui.updateStatus, this._ui);
                    }
                    else if(mutation.target.id == 'right' && !document.querySelector('.ogl_topbar')) // occure when right planets list has been updated
                    {
                        this.getPlanetData(true);
                        this._topbar.load();
                        this._ui.load(true);
                        this._movement.load(true);
                        this._topbar.checkUpgrade();
                    }
                }
            }, this);

            let universeInfo = `<ul class="ogl_universeInfoTooltip">
                <li>Economy:<div>x${this.server.economySpeed}</div></li>
                <li>Debris:<div>${this.db.serverData.debrisFactor}%</div></li>
                <hr>
                <li>Peaceful fleets:<div>x${this.server.peacefulFleetSpeed}</div></li>
                <li>Holding fleets:<div>x${this.server.holdingFleetSpeed}</div></li>
                <li>War fleets:<div>x${this.server.warFleetSpeed}</div></li>
            </ul>`;

            (document.querySelector('#pageReloader') || document.querySelector('#logoLink')).classList.add('tooltipBottom');
            (document.querySelector('#pageReloader') || document.querySelector('#logoLink')).setAttribute('title', universeInfo);
            document.querySelector('#pageContent').appendChild(Util.addDom('div', { class:'ogl_universeName', child:`${this.server.name}.${this.server.lang}` }));

            this.checkPTRECompatibility();
        }
        else
        {
            this._fleet = new FleetManager(this);
            this._empire = new EmpireManager(this);
        }

        window.addEventListener('beforeunload', () =>
        {
            this.save();
            //unsafeWindow.ogl = null;
        });

        // save changes + allow tab sync (firefox can bug here)
        /*window.addEventListener('visibilitychange', () =>
        {
            if(document.visibilityState === 'hidden')
            {
                this.save();
            }
            else if(document.visibilityState === 'visible')
            {
                setTimeout(() => this.db = this.load(), 10);
            }
        });*/
    }

    load(data)
    {
        data = data || GM_getValue(this.DBName) || {};
        return typeof data === typeof '' ? JSON.parse(data) : data;
    }

    save(data, unload)
    {
        try
        {
            if(data && typeof data === 'object') this.db = data;
            GM_saveTab({ cache:this.cache }); // doublon for tmp fix
            GM_setValue(this.DBName, JSON.stringify(this.db));
        }
        catch(error)
        {
            this.readyToUnload = true;
        }

        //if(unload) unsafeWindow.ogl = null;
    }
    
    getServerData()
    {
        if(!this.db.serverData.topScore || Date.now() > this.db.lastServerUpdate + 3600000) // 1h
        {
            this._fetch.pending.push(
            {
                url:`https://${window.location.host}/api/serverData.xml`,
                callback:data =>
                {
                    let xml = new DOMParser().parseFromString(data, 'text/html');
                    this.db.serverData.topScore = parseInt(Number(xml.querySelector('topscore').innerText));
                    this.db.serverData.probeCargo = parseInt(xml.querySelector('probeCargo').innerText);
                    this.db.serverData.debrisFactor = parseFloat(xml.querySelector('debrisFactor').innerText) * 100;
                    this.db.serverData.researchSpeed = parseInt(xml.querySelector('researchDurationDivisor').innerText);
                    this.db.lastServerUpdate = Date.now();
                }
            });
        }
    }

    getPlanetData()
    {
        const currentID = document.querySelector('head meta[name="ogame-planet-id"]').getAttribute('content');

        this.currentPlanet = {};

        this.currentPlanet.dom = {};
        this.currentPlanet.dom.element = document.querySelector('.smallplanet .active');
        this.currentPlanet.dom.list = Array.from(document.querySelectorAll('.smallplanet'));
        this.currentPlanet.dom.activeIndex = Array.from(this.currentPlanet.dom.list).findIndex(e => e.querySelector('.active'));
        this.currentPlanet.dom.prevWithMoon = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex, true).find(e => e.querySelector('.moonlink'));
        this.currentPlanet.dom.nextWithMoon = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex+1).find(e => e.querySelector('.moonlink'));
        this.currentPlanet.dom.nextNextWithMoon = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex+1)[1];
        this.currentPlanet.dom.prev = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex, true)[0];
        this.currentPlanet.dom.next = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex+1)[0];
        this.currentPlanet.dom.nextNext = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex+1)[1];

        //document.querySelector('.lifeform-item-wrapper').innerText.match(/[+-]?\d+(\.\d+)?/g)

        if(!this.db.lastLFBonusUpdate || (Date.now() > this.db.lastLFBonusUpdate + 300000 && this.page != 'fleetdispatch')) // 5mn
        {
            setTimeout(() => this._fetch.fetchLFBonuses(), !this.currentPlanet.obj ? 0 : 20000);
        }

        if(!this.db.myPlanets[currentID] || (Date.now() > this.db.lastEmpireUpdate + 300000 && this.page != 'fleetdispatch')) // 5mn
        {
            setTimeout(() => this._fetch.fetchEmpire(), !this.currentPlanet.obj ? 0 : 20000);
        }

        this.db.myPlanets[currentID] = this.db.myPlanets[currentID] || {};
        this.currentPlanet.obj = this.db.myPlanets[currentID];
        this.currentPlanet.obj.type = document.querySelector('head meta[name="ogame-planet-type"]').getAttribute('content');
        this.currentPlanet.obj.metal = Math.floor(resourcesBar.resources.metal?.amount || 0);
        this.currentPlanet.obj.crystal = Math.floor(resourcesBar.resources.crystal?.amount || 0);
        this.currentPlanet.obj.deut = Math.floor(resourcesBar.resources.deuterium?.amount || 0);
        this.currentPlanet.obj.energy = Math.floor(resourcesBar.resources.energy?.amount || 0);
        this.currentPlanet.obj.food = Math.floor(resourcesBar.resources.food?.amount || 0);
        this.currentPlanet.obj.population = Math.floor(resourcesBar.resources.population?.amount || 0);
        this.currentPlanet.obj.lifeform = document.querySelector('#lifeform .lifeform-item-icon')?.className.replace(/\D/g, '');
        this.currentPlanet.obj.lastRefresh = this._time.serverTime;

        /*if(this.page == 'lfresearch')
        {
            this.currentPlanet.obj.activeLFTechs = [];

            document.querySelectorAll('.technology[data-technology]').forEach(e =>
            {
                let techID = e.getAttribute('data-technology');
                if(techID) this.currentPlanet.obj.activeLFTechs.push(techID);
            });
        }*/

        ['metal', 'crystal', 'deut'].forEach(resource =>
        {
            // update prod / sec
            let prod = resourcesBar.resources[resource.replace('deut', 'deuterium')].production;
            if(prod > 0) this.currentPlanet.obj[`prod${resource}`] = prod;

            // update top icon storage indicator
            const box = document.querySelector(`#${resource.replace('deut', 'deuterium')}_box`);
            if(this.currentPlanet.obj.type == 'moon' || box.querySelector('.ogl_resourceBoxStorage')) return;
            
            prod = prod * 3600;
            const storage = this.currentPlanet.obj[`${resource}Storage`];
            const timeLeft = prod > 0 ? Math.floor((storage - this.currentPlanet.obj[resource]) / prod) || 0 : Infinity;
            const day = Math.max(0, Math.floor(timeLeft / 24));
            const hour = Math.max(0, Math.floor(timeLeft % 24));

            let text = day > 365 ? `> 365${LocalizationStrings.timeunits.short.day}` : `${day}${LocalizationStrings.timeunits.short.day} ${hour}${LocalizationStrings.timeunits.short.hour}`;
            Util.addDom('div', { class:'ogl_resourceBoxStorage', child:text, parent:box });
        });

        document.querySelectorAll('.planetlink, .moonlink').forEach(planet =>
        {
            const urlParams = new URLSearchParams(planet.getAttribute('href'));
            const id = urlParams.get('cp').split('#')[0];

            this.db.myPlanets[id] = this.db.myPlanets[id] || {};

            ['metal', 'crystal', 'deut'].forEach(resourceName =>
            {
                let resource = this.db.myPlanets[id]?.[resourceName] || 0;
                let storage = this.db.myPlanets[id]?.[resourceName+'Storage'] || 0;
                let div = planet.querySelector('.ogl_available') || Util.addDom('span', { class:'ogl_available', parent:planet });

                Util.addDom('span', { class:'ogl_'+resourceName, parent:div, child:Util.formatToUnits(resource, 0) });

                const selector = planet.querySelector('.ogl_available .ogl_'+resourceName);
                selector.innerHTML = Util.formatToUnits(resource, 1);

                if(resource >= storage && planet.classList.contains('planetlink')) selector.classList.add('ogl_danger');
                else selector.classList.remove('ogl_danger');
            });

            this.addRefreshTimer(id, planet);
            
            if(!this.db.options.displayPlanetTimers)
            {
                document.querySelector('#planetList').classList.add('ogl_alt');
            }

            if(this.cache.toSend && this.mode !== 3) delete this.cache.toSend;

            if(planet.classList.contains('planetlink'))
            {
                planet.classList.add('tooltipLeft');
                planet.classList.remove('tooltipRight');
                planet.querySelector('.planet-koords').innerHTML = `<span class="ogl_hidden">[</span>${planet.querySelector('.planet-koords').textContent.slice(1, -1)}<span class="ogl_hidden">]</span>`;
            }
            else
            {
                planet.classList.add('tooltipRight');
                planet.classList.remove('tooltipLeft');
            }
        });
    }

    addRefreshTimer(id, source)
    {
        let timerDom = Util.addDom('div', {class:'ogl_refreshTimer', parent:source});

        let update = () =>
        {
            let timer = serverTime.getTime() - (this.db.myPlanets[id]?.lastRefresh || 1);
            timer = Math.min(Math.floor(timer / 60000), 60);
            timerDom.innerText = timer.toString();
            timerDom.style.color = timer > 30 ? '#ef7676' : timer > 15 ? '#d99c5d' : '#67ad7d';
        }

        update();
        setInterval(() => update(), 60000);
    }

    updateJQuerySettings()
    {
        const self = this;

        $(document).on("ajaxSend", (function(event, xhr, settings)
        {
            if(settings.url.indexOf('page=messages&tab=') >= 0)
            {
                const tabID = new URLSearchParams(settings.url).get('tab');

                if(tabID != 20)
                {
                    if(self._message.spytable) self._message.spytable.classList.add('ogl_hidden');
                }
            }
        }));

        $(document).on("ajaxSuccess", function(event, xhr, settings)
        {
            if(settings.url.indexOf('page=messages') >= 0)  // check messages loaded
            {
                if(settings.data?.indexOf('messageId=-1') >= 0)
                {
                    self._message.check();  // check messages after pagination

                    if(ogame.messages.getCurrentMessageTab() == 20 && self._message.spytable?.querySelector('.curPage'))
                    {
                        const pagination = new URLSearchParams(settings.data).get('pagination') || 0;
                        const splitted = self._message.spytable?.querySelector('.curPage').innerText.split('/');
                        self._message.spytable.querySelector('.curPage').innerText = `${pagination}/${splitted[1]}`;
                    }
                }
            }
            else if(settings.url.indexOf('action=fetchGalaxyContent') >= 0) // check galaxy on system change
            {
                self._galaxy.check(JSON.parse(xhr.responseText));
                //self._shortcut.discoveryReady = true;
            }
            /*else if(settings.url.indexOf('action=sendDiscoveryFleet') >= 0) // discovery action done
            {
                self._shortcut.discoveryReady = true;
            }*/
            else if(settings.url.indexOf('action=checkTarget') >= 0) // fleetdispatcher fetchTargetPlayerData()
            {
                document.querySelector('#planetList').classList.remove('ogl_notReady');
            }
        });

        $.ajaxSetup(
        {
            beforeSend:function(xhr)
            {
                if(this.url.indexOf('action=checkTarget') >= 0 && !self._fleet.isReady) // clear default fleet loading
                {
                    fleetDispatcher.fetchTargetPlayerDataTimeout = null;
                    xhr.abort();
                }
                else if(this.url.indexOf('action=fetchGalaxyContent') >= 0) // abort galaxy spam
                {
                    if(self._galaxy.xhr) self._galaxy.xhr.abort();
                    self._galaxy.xhr = xhr;
                }
            }
        });
    }

    checkPTRECompatibility()
    {
        if(serverTime.getTime() > this.id[1] + 86400000)
        {
            let json =
            {
                ogl_id:this.id[0] || '-',
                version:this.version || '-',
                script_name:GM_info.script.name || '-',
                script_namespace:GM_info.script.downloadURL || '-',
            }

            PTRE.postPTRECompatibility(json);
        }
    }

    createPlayer(id)
    {
        this.db.udb[id] = { uid:parseInt(id) };
        return this.db.udb[id];
    }

    removeOldPlanetOwner(coords, newUid)
    {
        Object.values(this.db.udb).filter(e => e.planets?.indexOf(coords) > -1).forEach(old =>
        {
            if(old.uid != newUid)
            {
                // remove the planet from the old user list
                const index = this.db.udb[old.uid].planets.indexOf(coords);
                this.db.udb[old.uid].planets.splice(index, 1);

                // delete the old user if the planet list is empty
                if(this.db.udb[old.uid].planets.length < 1) delete this.db.udb[old.uid];

                if(this.db.udb[old.uid] && document.querySelector('.ogl_side.ogl_active') && this.db.currentSide == old.uid)
                {
                    if(document.querySelector('.ogl_side.ogl_active') && this.db.currentSide == old.uid) this._topbar.openPinnedDetail(old.uid);
                }
            }
        });
    }

    checkDataFormat()
    {
        if(this.db.dataFormat < 10) // fix v4 data
        {
            let legacyDBName = `ogl_test_${this.server.id}-${this.server.lang}_${this.account.id}`;
            let legacyDB = JSON.parse(GM_getValue(legacyDBName) || '{}');

            if(legacyDB.pinnedList?.length > 0 || legacyDB.positions?.length > 0)
            {
                if(confirm('Do you want to import v4 pinned targets ?'))
                {
                    this._popup.open(Util.addDom('div', { child:'<div>importing v4 targets, please wait...</div><hr><div class="ogl_loading"></div>' }));

                    // add v4 pinned players
                    legacyDB.pinnedList.forEach(id =>
                    {
                        this.db.lastPinnedList = Array.from(new Set([id, ...this.db.lastPinnedList]));
                    });
                    
                    if(this.db.lastPinnedList.length > 30) this.db.lastPinnedList.length = 30;
        
                    // add v4 tagged planets
                    legacyDB.positions.filter(position => position.color).forEach(position =>
                    {
                        this.db.tdb[position.rawCoords] = { tag:position.color.replace('half', '') };
                    });

                    this.db.dataFormat = 10;

                    this._popup.close();

                    window.location.reload();
                }
                else
                {
                    this.db.dataFormat = 10;
                }
            }
            else
            {
                this.db.dataFormat = 10;
            }
        }

        if(this.db.dataFormat < 12) // fix beta todolist
        {
            document.querySelectorAll('.planetlink, .moonlink').forEach(planet =>
            {
                const urlParams = new URLSearchParams(planet.getAttribute('href'));
                const id = urlParams.get('cp').split('#')[0];
                if(this.db.myPlanets[id]) delete this.db.myPlanets[id].todolist;
            });

            if(this.cache) delete this.cache.toSend;
            this.db.dataFormat = 12;
        }

        if(this.db.dataFormat < 14) // fix beta stats
        {
            this.db.initialTime = Date.now();
            this.db.stats = {};
            this.cache.raid = {};
            this.db.dataFormat = 14;
        }

        if(this.db.dataFormat < 15) // fix beta stats
        {
            Object.entries(this.db.stats || {}).forEach(entry =>
            {
                if(entry[0].indexOf('-') > -1) return;

                const midnight = parseInt(entry[0]);
                const value = entry[1];
                const date = new Date(midnight);
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

                if(!this.db.stats[key])
                {
                    this.db.stats[key] = value;
                    delete this.db.stats[midnight];
                }
            });
            
            this.db.dataFormat = 15;
        }

        if(this.db.dataFormat < 16) // fix beta stats
        {
            Object.entries(this.db.stats || {}).forEach(entry =>
            {
                const oldKey = entry[0].split('-');
                let newMonth = parseInt(oldKey[1]) + 1;
                let newYear = parseInt(oldKey[0]);
                if(newMonth > 12)
                {
                    newMonth = 1;
                    newYear++;
                }

                const value = entry[1];
                const key = `${newYear}-${newMonth}-${oldKey[2]}`;

                delete this.db.stats[oldKey.join('-')];
                this.db.stats[key] = value;
            });
            
            this.db.dataFormat = 16;
        }
    }

    calcExpeditionMax()
    {
        const treshold =
        [
            { topScore:10000, base:10, max:40000 },
            { topScore:100000, base:125, max:500000 },
            { topScore:1000000, base:300, max:1200000 },
            { topScore:5000000, base:450, max:1800000 },
            { topScore:25000000, base:600, max:2400000 },
            { topScore:50000000, base:750, max:3000000 },
            { topScore:75000000, base:900, max:3600000 },
            { topScore:100000000, base:1050, max:4200000 },
            { topScore:Infinity, base:1250, max:5000000 },
        ].find(e => e.topScore >= this.db.serverData.topScore);

        const base = (this.account.class == 3 ? treshold.max * 3 * this.server.economySpeed : treshold.max * 2);
        const maxResources = this.db.options.expeditionValue || base * (1+(this.db.lfBonuses?.Characterclasses3?.bonus||0)/100) * (1+(this.db.lfBonuses?.ResourcesExpedition?.bonus||0)/100);
    
        return { max:Math.round(maxResources), treshold:treshold };
    }
}

GM_getTab(params => unsafeWindow.ogl = new OGLight(params));


class Manager
{
    constructor(ogl)
    {
        this.ogl = ogl;
        this.ogl['_'+this.constructor.name.toLowerCase().replace('manager', '')] = this;
        this.load();
    }
}


class LangManager extends Manager
{
    load()
    {
        this.raw =
        {
            metal:'Metal',
            crystal:'Crystal',
            deut:'Deuterium',
            artefact:'Artefact',
            dm:'Dark Matter',
            202:'Small Cargo',
            203:'Large Cargo',
            204:'Light Fighter',
            205:'Heavy Fighter',
            206:'Cruiser',
            207:'Battleship',
            208:'Colony Ship',
            209:'Recycler',
            210:'Espionage Probe',
            211:'Bomber',
            212:'Solar Satellite',
            213:'Destroyer',
            214:'Deathstar',
            215:'Battlecruiser',
            216:'Trade Ship',
            217:'Crawler',
            218:'Reaper',
            219:'Pathfinder',
            220:'Trade Ship',
        }

        this.en =
        {
            ship:"Ships",
            item:"Item",
            other:"Other",
            resource:"Resources",
            battle:"Battle",
            blackhole:"Black hole",
            early:"Early",
            late:"Late",
            trader:"Trader",
            nothing:"Nothing",
            pirate:"Pirates",
            alien:"Aliens",
            duration:"Duration",
            defaultShip:"Default ship type",
            defaultMission:"Default mission type",
            useClientTime:"Use client time",
            displayMiniStats:"Stats range",
            displaySpyTable:"Display spy table",
            displayPlanetTimers:"Display planets timer",
            disablePlanetTooltips:"Disable planets menu tooltips",
            showMenuResources:"Planets menu layout",
            reduceLargeImages:"Fold large images",
            ignoreExpeShips:"Ignore ships found in expeditions",
            ignoreExpeShipsLoss:"Ignore ships lost in expeditions",
            ignoreConsumption:"Ignore fleet consumption",
            resourceTreshold:"Resource treshold",
            tooltipDelay:"Tooltip delay (ms)",
            galaxyUp:"Next galaxy",
            galaxyDown:"Previous galaxy",
            galaxyLeft:"Previous system",
            galaxyRight:"Next system",
            previousPlanet:"Previous planet",
            nextPlanet:"Next planet",
            nextPinnedPosition:"Next pinned position",
            fleetRepeat:"Repeat last fleet",
            fleetSelectAll:"<div>Select all ships (fleet1)<hr>Select all resources (fleet2)</div>",
            expeditionSC:'Small cargo expedition',
            expeditionLC:'Large cargo expedition',
            expeditionPF:'Pathfinder expedition',
            galaxySpySystem:"System spy",
            collectLinked:"Collect to linked planet/moon",
            keyboardActions:"Keyboard settings",
            expeditionValue:"Expedition value",
            expeditionValueTT:"The custom value aimed by your expeditions.<br> Set it to <b>0</b> to use the default calculated value",
            expeditionBigShips:"Allowed biggest ships",
            expeditionRandomSystem:"Random system",
            expeditionShipRatio:"Ships found value (%)",
            fleetLimiter:"Fleet limiter",
            fleetLimiterTT:"Chose the amount of ships / resources to keep on your planets",
            menu:"Toggle OGLight menu",
            quickRaid:"Quick raid",
            attackNext:"Attack next planet",
            autoCleanReports:"Auto clean reports",
            noCurrentPin:"Error, no target pinned",
            backFirstFleet:"Back first fleet",
            backLastFleet:"Back last fleet sent",
            fleetReverseAll:"Reverse selection",
            fleetResourcesSplit:"Split ships/resources",
            manageData:"Manage OGLight data",
            profileButton:"Profile limiters",
            limiters:"Limiters",
            expeditionRedirect:"Redirect to the next planet/moon",
            playerProfile:"Player profile",
            topReportDetails:"Top report details",
            reportFound:"Top report",
            discovery:"Send a discovery",
            collectResources:"Collect resources",
            accountSummary:"Account summary",
            stats:"Stats",
            taggedPlanets:"Tagged planets",
            pinnedPlayers:"Pinned players",
            oglSettings:"OGLight settings",
            coffee:"Buy me a coffee",
            syncEmpire:"Sync empire data",
            repeatQueue:"Repeat the amount above in a new queue X time.<br>This operation can take a while",
            spyPlanet:"Spy this planet",
            spyMoon:"Spy this moon",
            resourceLimiter:"Substract the amount of resources defined in your profile limiter",
            fleetLimiter:"Substract the amount of ships defined in your profile limiter",
            forceKeepCapacity:"Keep enough capacity on you planet to move your resources (has priority over limiters)",
            forceIgnoreFood:"Ignore food (has priority over limiters)",
            resetStats:"Reset stats",
            resetTaggedPlanets:"Reset tagged planets",
            resetPinnedPlayers:"Reset pinned players",
            resetAll:"Reset all data",
            resetStatsLong:"Do you really want to reset OGLight stats data ?",
            resetTaggedPlanetsLong:"Do you really want to reset OGLight tagged planets data ?",
            resetPinnedPlayersLong:"Do you really want to reset OGLight pinned players data ?",
            resetAllLong:"Do you really want to reset all OGLight data ?",
            reportBlackhole:"Report a black hole",
            reportBlackholeLong:"Do you really want to add this black hole ?",
            emptyPlayerList:"There is no player in this list",
            debugMode:"Debug mode",
            sim:"Battle sim",
            siblingPlanetMoon:"Sibling planet / moon",
            oglMessageDone:"This message has been red by OGLight",
            boardTab:"Display board news",
            msu:"Metal standard unit",
            notifyNoProbe:"Feature disabled :(",

            ptreTeamKey:"Team key",
            ptreLogs:"Display PTRE errors",
            ptreActivityImported:"activity imported to PTRE",
            ptreActivityAlreadyImported:"activity already imported to PTRE",
            ptreSyncTarget:"Sync with PTRE",
            ptreManageTarget:"Manage on PTRE",
        };

        this.fr =
        {
            ship:"Vaisseaux",
            item:"Item",
            other:"Autre",
            resource:"Ressources",
            battle:"Combat",
            blackhole:"Trou noir",
            early:"Avance",
            late:"Retard",
            trader:"Marchand",
            nothing:"Rien",
            pirate:"Pirates",
            alien:"Aliens",
            duration:"Durée",
            defaultShip:"Type de vaisseau par défaut",
            defaultMission:"Type de mission par défaut",
            useClientTime:"Utiliser l'heure du client",
            displayMiniStats:"Fourchette",
            displaySpyTable:"Afficher le tableau d'espio",
            displayPlanetTimers:"Afficher les timers des planètes",
            disablePlanetTooltips:"Cacher les tooltips du menu des planètes",
            showMenuResources:"Affichage du menu des planètes",
            reduceLargeImages:"Réduire les grandes images",
            ignoreExpeShips:"Ignorer les vaisseaux trouvés en expédition",
            ignoreExpeShipsLoss:"Ignorer les vaisseaux perdus en expédition",
            ignoreConsumption:"Ignorer la consommation des flottes",
            resourceTreshold:"Seuil de ressources",
            tooltipDelay:"Délai des tooltips (ms)",
            galaxyUp:"Galaxie suivante",
            galaxyDown:"Galaxie précédente",
            galaxyLeft:"Système précédent",
            galaxyRight:"Système suivant",
            previousPlanet:"Planète précédente",
            nextPlanet:"Planète suivante",
            nextPinnedPosition:"Position épinglée suivante",
            fleetRepeat:"Répéter la dernière flotte",
            fleetSelectAll:"<div>Selectionner tous les vaisseaux (fleet1)<hr>Selectionner toutes les ressources (fleet2)</div>",
            expeditionSC:"Expédition au petit transporteur",
            expeditionLC:"Expédition au grand transporteur",
            expeditionPF:"Expédition à l'éclaireur",
            galaxySpySystem:"Espionnage du système",
            collectLinked:"Rapatrier vers les planètes/lunes liée",
            keyboardActions:"Raccourcis clavier",
            expeditionValue:"Valeur max. expédition",
            expeditionValueTT:"La valeur visée par les expédition.<br> Laisser à <b>0</b> pour utiliser la valeur calculée par OGLight",
            expeditionBigShips:"Gros vaisseaux autorisés",
            expeditionRandomSystem:"Système aléatoire",
            expeditionShipRatio:"Valeur vaisseaux trouvés (%)",
            fleetLimiter:"Limiteur de flotte",
            fleetLimiterTT:"Choisir le nombre de vaisseau et la quantité de ressources à garder sur les planètes/lunes",
            menu:"Afficher/masquer le menu OGLight",
            quickRaid:"Raid rapide",
            attackNext:"Attaquer la planète suivante",
            autoCleanReports:"Nettoyage automatique des rapports",
            noCurrentPin:"Pas de cible épinglée actuellement",
            backFirstFleet:"Rappeler la prochaine flotte",
            backLastFleet:"Rappeler la dernière flotte envoyée",
            fleetReverseAll:"Inverser la sélection",
            fleetResourcesSplit:"Diviser les vaisseaux/ressources",
            manageData:"Gestion des données OGLight",
            profileButton:"Configuration des limiteurs",
            limiters:"Limiteurs",
            expeditionRedirect:"Rediriger vers la planète/lune suivante",
            playerProfile:"Profil du joueur",
            topReportDetails:"Détails du meilleur rapport",
            reportFound:"Meilleur rapport",
            discovery:"Envoyer une exploration",
            collectResources:"Rapatrier les ressources",
            accountSummary:"Résumé du compte",
            stats:"Statistiques",
            taggedPlanets:"Planètes marquées",
            pinnedPlayers:"Joueurs épinglés",
            oglSettings:"Configuration d'OGLight",
            coffee:"Buy me a coffee",
            syncEmpire:"Synchroniser les données de l'empire",
            repeatQueue:"Répéter le nombre ci-dessus dans une nouvelle file X fois.<br>Cette opération peut prendre un moment",
            spyPlanet:"Espionner cette planète",
            spyMoon:"Espionner cette lune",
            resourceLimiter:"Soustraire le montant de ressources indiqué dans le limiteur",
            fleetLimiter:"Soustraire le nombre de vaisseaux indiqué dans le limiteur",
            forceKeepCapacity:"Garder assez de capacité sur la planète pour bouger les ressources (a la priorité sur le limiteur)",
            forceIgnoreFood:"Ignorer la nourriture (a la priorité sur le limiteur)",
            resetStats:"Réinitialiser stats",
            resetTaggedPlanets:"Réinitialiser les planètes marquées",
            resetPinnedPlayers:"Réinitialiser les joueurs épinglés",
            resetAll:"Réinitialiser toutes les données OGLight",
            resetStatsLong:"Voulez-vous vraiment réinitialiser les stats ?",
            resetTaggedPlanetsLong:"Voulez-vous vraiment réinitialiser les planètes marquées ?",
            resetPinnedPlayersLong:"Voulez-vous vraiment réinitialiser les joueurs épinglés ?",
            resetAllLong:"Voulez-vous vraiment réinitialiser toutes les données OGLight ?",
            reportBlackhole:"Signaler un trou noir",
            reportBlackholeLong:"Voulez vous vraiment ajouter ce trou noir ?",
            emptyPlayerList:"Cette liste de joueurs est vide",
            debugMode:"Mode debug",
            sim:"Simulateur de combat",
            siblingPlanetMoon:"Planète / lune liée",
            oglMessageDone:"Ce message a été traité par OGLight",
            boardTab:"Afficher les annonces du board",
            msu:"Metal standard unit",
            notifyNoProbe:"Fonctionnalité desactivée :(",

            ptreTeamKey:"Team key",
            ptreLogs:"Afficher les erreurs PTRE",
            ptreActivityImported:"Activité importée dans PTRE",
            ptreActivityAlreadyImported:"Activité déjà importée dans PTRE",
            ptreSyncTarget:"Synchroniser avec PTRE",
            ptreManageTarget:"Gérer sur PTRE",
        };
    }

    find(key, isRaw)
    {
        if(key == 'darkmatter') key = 'dm';

        if(isRaw && this.raw[key]) return this.raw[key];
        else if(this[this.ogl.account.lang] && this[this.ogl.account.lang][key]) return this[this.ogl.account.lang][key];
        else if(this.ogl.db.serverData[key]) return this.ogl.db.serverData[key];
        else if(this.en[key]) return this.en[key];
        else return 'TEXT_NOT_FOUND';
    }
}


class TimeManager extends Manager
{
    load()
    {
        this.units = LocalizationStrings.timeunits.short;
        this.serverTimeZoneOffset = this.ogl.db.serverData.serverTimeZoneOffsetInMinutes * 60000;
        this.clientTimeZoneOffset = serverTime.getTimezoneOffset() * 60000;

        // times at script load; /!\ those values are not refreshed
        this.UTC = serverTime.getTime() + this.serverTimeZoneOffset;
        this.serverTime = serverTime.getTime();
        this.clientTime = this.UTC - this.clientTimeZoneOffset;

        this.observeList = ['.OGameClock', '.ogl_backTimer', '.ogl_backWrapper'];
        //this.observeList = ['.OGameClock', '#fleet2 #arrivalTime', '#fleet2 #returnTime', '.ogl_backTimer', '.ogl_backWrapper'];
        this.updateList = ['.OGameClock', '.arrivalTime', '.absTime', '.nextabsTime', '.ui-dialog .msg_date'];

        this.productionBoxes =
        {
            restTimebuilding:'productionboxbuildingcomponent', // base building
            restTimeresearch:'productionboxresearchcomponent', // base research
            restTimeship2:'productionboxshipyardcomponent', // base ships
            restTimelfbuilding:'productionboxlfbuildingcomponent', // lifeform building
            restTimelfresearch:'productionboxlfresearchcomponent' // lifeform research
        };

        if(this.ogl.page == 'fleetdispatch')
        {
            // update fleet2 arrival / back time to be much more precise
            let lastLoop = 0;
            let arrivalDom, backDom;
            
            document.querySelectorAll('#fleet2 #arrivalTime, #fleet2 #returnTime').forEach((e, index) =>
            {
                if(index == 0) arrivalDom = Util.addDom('div', { class:'ogl_missionTime', parent:e.parentNode, child:'loading...' });
                else backDom = Util.addDom('div', { class:'ogl_missionTime', parent:e.parentNode, child:'loading...' });
                e.remove();
            });

            this.timeLoop = noLoop =>
            {
                const time = serverTime.getTime();

                if(unsafeWindow.fleetDispatcher && (time != lastLoop || noLoop))
                {
                    const duration = (fleetDispatcher.getDuration() || 0) * 1000;
                    const offset = this.ogl.db.options.useClientTime ? this.clientTimeZoneOffset : this.serverTimeZoneOffset;
                    const UTCArrival = time + duration + this.serverTimeZoneOffset;
                    const UTCBack = fleetDispatcher.mission == 15 ? time + duration * 2 + this.serverTimeZoneOffset + fleetDispatcher.expeditionTime * 3600000 : 
                                fleetDispatcher.mission == 5 ? time + duration * 2 + this.serverTimeZoneOffset + fleetDispatcher.holdingTime * 3600000 :
                                time + duration * 2 + this.serverTimeZoneOffset;

                    const arrival = new Date(UTCArrival - offset);
                    const back = new Date(UTCBack - offset);
                    
                    arrivalDom.setAttribute('data-output-date', arrival.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'}));
                    arrivalDom.setAttribute('data-output-time', arrival.toLocaleTimeString('de-DE'));

                    backDom.setAttribute('data-output-date', back.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'}));
                    backDom.setAttribute('data-output-time', back.toLocaleTimeString('de-DE'));
                
                    lastLoop = time;
                }
    
                if(!noLoop) requestAnimationFrame(() => this.timeLoop());
            }

            this.timeLoop();
        }

        // bottom boxes
        Object.entries(this.productionBoxes).forEach(box =>
        {
            const techType = box[0] == 'restTimebuilding' ? 'baseBuilding' : box[0] == 'restTimeresearch' ? 'baseResearch' : box[0] == 'restTimeship2' ? 'ship' : box[0] == 'restTimelfbuilding' ? 'lfBuilding' : 'lfResearch';

            if(unsafeWindow[box[0]])
            {
                const div = document.querySelector(`#${[box[1]]} .content`);
                const endTime = (this.ogl.db.options.useClientTime ? this.clientTime : this.serverTime) + unsafeWindow[box[0]] * 1000;
                div.classList.add(`ogl_${techType}`);

                let content = `<span>${new Date(endTime).toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'})}</span>
                ${new Date(endTime).toLocaleTimeString('de-DE')}`;
                Util.addDom('time', { parent:div, child:content });
            }
        });

        // ping
        const ping = (performance.timing.responseEnd - performance.timing.requestStart) / 1000;
        let li = Util.addDom('li', { 'class':'ogl_ping', child:`${ping} s`, parent:document.querySelector('#bar ul') });
        if(ping >= 2) li.classList.add('ogl_danger');
        else if(ping >= 1) li.classList.add('ogl_warning');

        Util.runAsync(this.update, this);
        Util.runAsync(this.observe, this);
    }

    update(self, domTarget)
    {
        self = self || this;

        self.updateList.forEach(element =>
        {
            let targets = domTarget ? [domTarget] : document.querySelectorAll(`${element}:not(.ogl_updated)`);

            targets.forEach(target =>
            {
                target.classList.add('ogl_updated');

                const offset = self.ogl.db.options.useClientTime ? self.clientTimeZoneOffset : self.serverTimeZoneOffset;
                const UTCdate = self.dateStringToTime(target.innerText) + self.serverTimeZoneOffset;
                const date = new Date(UTCdate - offset);

                if(target.innerText.split(/\.|:| /).length > 5)
                {
                    target.setAttribute('data-output-date', date.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'}));
                    target.setAttribute('data-time-utc', UTCdate);
                    target.setAttribute('data-time-server', UTCdate - self.serverTimeZoneOffset);
                    target.setAttribute('data-time-client', UTCdate - self.clientTimeZoneOffset);
                }
                target.setAttribute('data-output-time', date.toLocaleTimeString('de-DE'));
            });
        });
    }

    observe(self)
    {
        self = self || this;

        self.observeList.forEach(element =>
        {
            let targets = document.querySelectorAll(`${element}:not(.ogl_observed)`);

            targets.forEach(target =>
            {
                target.classList.add('ogl_observed');

                let action = () =>
                {
                    const offset = self.ogl.db.options.useClientTime ? self.clientTimeZoneOffset : self.serverTimeZoneOffset;
                    const UTCdate = self.dateStringToTime(target.textContent) + self.serverTimeZoneOffset;
                    const date = new Date(UTCdate - offset);
    
                    target.setAttribute('data-output-date', date.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'}));
                    target.setAttribute('data-output-time', date.toLocaleTimeString('de-DE'));
                    target.setAttribute('data-time-utc', UTCdate);
                    target.setAttribute('data-time-server', UTCdate - self.serverTimeZoneOffset);
                    target.setAttribute('data-time-client', UTCdate - self.clientTimeZoneOffset);
                }

                action();
    
                Util.observe(target, {childList:true}, action);
            });
        });
    }

    getClientTime(time)
    {
        let utc;
        let sTime;
        let cTime;

        if(time)
        {
            utc = time + this.serverTimeZoneOffset;
            sTime = time;
            cTime = utc - this.clientTimeZoneOffset;
        }
        else
        {
            utc = serverTime.getTime() + this.serverTimeZoneOffset;
            sTime = serverTime.getTime();
            cTime = utc - this.clientTimeZoneOffset;
        }

        return cTime;
    }

    clientToServer(cTime)
    {
        return this.clientToUTC(cTime) - this.serverTimeZoneOffset;
    }

    clientToUTC(cTime)
    {
        return cTime + (new Date(cTime).getTimezoneOffset() * 60000);
    }

    serverToUTC(sTime)
    {
        return sTime + this.serverTimeZoneOffset;
    }

    serverToClient(sTime)
    {
        return sTime - this.serverTimeZoneOffset + (new Date(sTime).getTimezoneOffset() * 60000);
    }

    convertTimestampToDate(timestamp, full)
    {
        const offset = this.ogl.db.options.useClientTime ? this.clientTimeZoneOffset : this.serverTimeZoneOffset;
        const UTCdate = timestamp + this.serverTimeZoneOffset;
        const date = new Date(UTCdate - offset);

        let target = Util.addDom('time', { child:date.toLocaleTimeString('de-DE') });

        if(full)
        {
            target = Util.addDom('time', { child:`${date.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'})} ${date.toLocaleTimeString('de-DE')}` });
        }

        return target;
    }

    updateMovements()
    {
        const initialTime = new Date();

        document.querySelectorAll('[data-mission-type]').forEach(fleet =>
        {
            if(fleet.querySelector('.ogl_backTimer')) return;

            const backButton = fleet.querySelector('.reversal_time a');
            if(!backButton) return;

            const domElement = Util.addDom('div', { class:'ogl_backTimer ogl_button', parent:fleet.querySelector('.ogl_resourcesBlock'), onclick:() => backButton.click() });

            let time = backButton.getAttribute('data-title') || backButton.getAttribute('title');
            time = time.replace('<br>',' ');
            time = time.replace(/ \.$/, '');
            time = time.trim().replace(/[ \.]/g, ':');
            time = time.split(':');
            time = new Date(`${time[4]}-${time[3]}-${time[2]}T${time[5]}:${time[6]}:${time[7]}`).getTime() - this.serverTimeZoneOffset + this.clientTimeZoneOffset;
            this.updateBackTimer(initialTime, time, domElement);

            const wrapper = Util.addDom('div');
            Util.addDom('div', { class:'ogl_backWrapper', parent:wrapper, child:domElement.innerText });
            backButton.addEventListener('tooltip', () => this.ogl._tooltip.update(wrapper));

            setInterval(() => this.updateBackTimer(initialTime, time, domElement), 500);
        });
    }

    updateBackTimer(initialTime, time, domElement)
    {
        const deltaTime = new Date() - initialTime;
        const newTime = new Date((time + timeDelta - Math.round(timeDiff / 100000) * 100000) + deltaTime * 2);
        domElement.innerText = `${newTime.toLocaleDateString('de-DE')} ${newTime.toLocaleTimeString('de-DE')}`;
    }

    dateStringToTime(str)
    {
        str = str.split(/\.|:| /);

        if(str.length <= 5)
        {
            str = ["01","01","2000"].concat(str);
        }

        str = str.map(e => e.padStart(2, '0'));
        if(str[2].length == 2) str[2] = '20' + str[2]; // ex: 10.05.22 => 10.05.2022

        return new Date(`${str[2]}-${str[1]}-${str[0]}T${str[3]}:${str[4]}:${str[5]}`).getTime();
    }

    timeToHMS(time)
    {
        return new Date(time).toISOString().slice(11, 19);
    }
}


class FetchManager extends Manager
{
    load()
    {
        this.apiCooldown = 86400000 * 7;
        this.pending = [];
        setInterval(() => this.resolve(), 500);
    }

    resolve()
    {
        if(this.pending.length < 1) return;

        let inProgress = this.pending.splice(0, 7);
        Promise.all(inProgress.map(promise => fetch(promise.url).then(response => response.text()).then(text => { return {'result':text, 'callback':promise.callback} }))).then(reqs =>
        {
            reqs.forEach(req =>
            {
                req.callback(req.result);
            });
        });
    }

    fetchEmpire()
    {
        this.ogl._topbar.syncBtn.classList.add('ogl_active');

        for(let i=0; i<=1; i++)
        {
            fetch(`https://${window.location.host}/game/index.php?page=ajax&component=empire&ajax=1&planetType=${i}&asJson=1`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(response => response.json())
            .then(result =>
            {
                this.ogl._empire.update(JSON.parse(result.mergedArray), i);
                this.ogl._topbar.syncBtn.classList.remove('ogl_active');
                this.ogl.save();
            });
        }
    }

    fetchLFBonuses()
    {
        this.ogl._topbar.syncBtn.classList.add('ogl_active');

        fetch(`https://${window.location.host}/game/index.php?page=ajax&component=lfbonuses`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.text())
        .then(result =>
        {
            let xml = new DOMParser().parseFromString(result, 'text/html');
            this.ogl._empire.getLFBonuses(xml);
            this.ogl.db.lastLFBonusUpdate = Date.now();
        });
    }

    fetchPlayerAPI(id, name, afterAjax)
    {
        if(!id) return;

        const player = this.ogl.db.udb[id] || this.ogl.createPlayer(id);
        player.uid = player.uid || id;
        player.api = player.api || 0;
        player.planets = player.planets || [];
        player.name = name || player.name;

        if(serverTime.getTime() - player.api > this.apiCooldown)
        {
            this.pending.push(
            {
                url:`https://${window.location.host}/api/playerData.xml?id=${player.uid}`,
                callback:data =>
                {
                    const xml = new DOMParser().parseFromString(data, 'text/html');
                    if(!xml.querySelector('playerdata')) return;

                    const apiTime = parseInt(xml.querySelector('playerdata').getAttribute('timestamp')) * 1000;
    
                    if(!player.name) player.name = xml.querySelector('playerdata').getAttribute('name');
                    player.score = player.score || {};

                    // score
                    player.score.global = Math.floor(xml.querySelector('positions position[type="0"]').getAttribute('score'));
                    player.score.economy = Math.floor(xml.querySelector('positions position[type="1"]').getAttribute('score'));
                    player.score.research = Math.floor(xml.querySelector('positions position[type="2"]').getAttribute('score'));
                    player.score.lifeform = Math.floor(xml.querySelector('positions position[type="8"]').getAttribute('score'));
                    player.score.military = Math.floor(xml.querySelector('positions position[type="3"]').getAttribute('score'));

                    // ranking
                    player.score.globalRanking = Math.floor(xml.querySelector('positions position[type="0"]').innerText);
                    player.score.economyRanking = Math.floor(xml.querySelector('positions position[type="1"]').innerText);
                    player.score.researchRanking = Math.floor(xml.querySelector('positions position[type="2"]').innerText);
                    player.score.lifeformRanking = Math.floor(xml.querySelector('positions position[type="8"]').innerText);
                    player.score.militaryRanking = Math.floor(xml.querySelector('positions position[type="3"]').innerText);

                    player.api = apiTime;

                    xml.querySelectorAll('planet').forEach((element, index) =>
                    {
                        const pid = element.getAttribute('id');
                        const coords = element.getAttribute('coords');
                        const moon = element.querySelector('moon')?.getAttribute('id');

                        this.ogl.db.pdb[coords] = this.ogl.db.pdb[coords] || {};
                        const planet = this.ogl.db.pdb[coords];
                        planet.api = planet.api || 0;

                        if(planet.api <= apiTime)
                        {
                            planet.uid = player.uid;
                            planet.pid = pid;
                            planet.mid = moon;
                            planet.coo = coords;
                            planet.api = apiTime;
                            if(index == 0) planet.home = true;
                        }
        
                        if(player.planets.indexOf(coords) < 0) player.planets.push(coords);
                    });

                    // clear old planets
                    player.planets.forEach((coords, index) =>
                    {
                        if(this.ogl.db.pdb[coords]?.api < apiTime)
                        {
                            player.planets.splice(index, 1);
                            if(this.ogl.db.pdb[coords].uid == player.uid) delete this.ogl.db.pdb[coords];
                        }
                    });

                    if(afterAjax) afterAjax();
                }
            });
        }
        else // no api request required
        {
            if(afterAjax) afterAjax(false);
        }
    }
}


class UIManager extends Manager
{
    load(reloaded)
    {
        document.querySelector('#planetList').classList.add('ogl_ogameDiv');

        // build side panel
        if(!document.querySelector('.ogl_side'))
        {
            this.side = Util.addDom('div', { class:`ogl_side ${this.ogl.db.currentSide ? 'ogl_active': ''}`, parent:document.body });
        }

        // build resources recap
        if(!document.querySelector('.ogl_recap'))
        {
            this.resourceDiv = Util.addDom('div', { class:'ogl_recap', parent:document.querySelector('#planetList') });
            Util.addDom('div', {class:'ogl_icon ogl_metal', parent:this.resourceDiv, child:'0'});
            Util.addDom('div', {class:'ogl_icon ogl_crystal', parent:this.resourceDiv, child:'0'});
            Util.addDom('div', {class:'ogl_icon ogl_deut', parent:this.resourceDiv, child:'0'});
            Util.addDom('div', {class:'ogl_icon ogl_msu', parent:this.resourceDiv, child:'0'});
        }

        if(!reloaded)
        {
            Util.addDom('li', { before:document.querySelector('#bar .OGameClock'), child:document.querySelector('#countColonies').innerText });
            this.checkImportExport();
            this.updateLeftMenu();
            this.updateFooter();
        }

        this.attachGlobalClickEvent(reloaded);
        this.displayResourcesRecap();
        this.groupPlanets();

        if(this.ogl.page == 'highscore' && !reloaded)
        {
            this.updateHighscore();
            this.updateStatus();
        }
    }

    openSide(dom, pin, buttonSource)
    {
        let closeBtn = Util.addDom('div', {class:'material-icons ogl_close', child:'close', onclick:() =>
        {
            this.side.classList.remove('ogl_active');
            delete this.ogl.db.currentSide;
            this.ogl._shortcut.load();
            this.ogl._shortcut.updateShortcutsPosition();
        }});

        if(buttonSource && this.ogl.db.currentSide == pin && !this.side.querySelector('.ogl_loading'))
        {
            closeBtn.click();
            return;
        }

        this.side.innerText = '';
        this.side.appendChild(closeBtn);
        this.side.appendChild(dom);
        this.side.classList.add('ogl_active');

        if(this.lastOpenedSide != pin) this.ogl._shortcut.load(); // refresh shortcuts

        this.ogl.db.currentSide = pin;
        this.lastOpenedSide = pin;

        this.ogl._shortcut.updateShortcutsPosition();
        document.querySelectorAll('.ogl_inputCheck').forEach(e => Util.formatInput(e));
    }

    attachGlobalClickEvent(reloaded)
    {
        if(!reloaded)
        {
            document.addEventListener('keyup', event =>
            {
                let activeElement = document.activeElement.tagName;

                if(activeElement == 'INPUT' || activeElement == 'TEXTAREA')
                {
                    if(document.activeElement.classList.contains('ogl_inputCheck'))
                    {
                        Util.formatInput(document.activeElement);
                    }
                }
            });

            document.querySelectorAll('.planetlink, .moonlink').forEach(target =>
            {
                target.addEventListener('pointerenter', event =>
                {
                    if(!unsafeWindow.fleetDispatcher || !this.ogl._fleet?.isReady || !document.body.classList.contains('ogl_destinationPicker')) return;
                    if(fleetDispatcher.fetchTargetPlayerDataTimeout) return;

                    //fleetDispatcher.realTarget = JSON.parse(JSON.stringify(fleetDispatcher.targetPlanet));

                    const coords = event.target.closest('.smallplanet').querySelector('.planet-koords').innerText.split(':');
                    const type = event.target.classList.contains('moonlink') ? 3 : 1;
                    const name = type == 3 ? event.target.querySelector('.icon-moon').getAttribute('alt') : event.target.querySelector('.planetPic').getAttribute('alt');

                    document.querySelector('#galaxy').value = fleetDispatcher.targetPlanet.galaxy;
                    document.querySelector('#system').value = fleetDispatcher.targetPlanet.system;
                    document.querySelector('#position').value = fleetDispatcher.targetPlanet.position;

                    fleetDispatcher.targetPlanet.type = type;
                    fleetDispatcher.targetPlanet.galaxy = coords[0];
                    fleetDispatcher.targetPlanet.system = coords[1];
                    fleetDispatcher.targetPlanet.position = coords[2];
                    fleetDispatcher.targetPlanet.name = name;
                    fleetDispatcher.refresh();
                });

                target.addEventListener('pointerleave', () =>
                {
                    if(/Android|iPhone/i.test(navigator.userAgent)) return;
                    if(!unsafeWindow.fleetDispatcher || !this.ogl._fleet?.isReady || !document.body.classList.contains('ogl_destinationPicker')) return;

                    document.querySelector('#galaxy').value = fleetDispatcher.realTarget.galaxy;
                    document.querySelector('#system').value = fleetDispatcher.realTarget.system;
                    document.querySelector('#position').value = fleetDispatcher.realTarget.position;

                    fleetDispatcher.targetPlanet.galaxy = fleetDispatcher.realTarget.galaxy;
                    fleetDispatcher.targetPlanet.system = fleetDispatcher.realTarget.system;
                    fleetDispatcher.targetPlanet.position = fleetDispatcher.realTarget.position;
                    fleetDispatcher.targetPlanet.type = fleetDispatcher.realTarget.type;
                    fleetDispatcher.targetPlanet.name = fleetDispatcher.realTarget.name;
                    fleetDispatcher.refresh();
                });
            });

            document.addEventListener('click', event =>
            {
                if(event.target.tagName == 'svg' || event.target.tagName == 'path') return;

                if(event.target.className.indexOf('tooltip') < 0 && !event.target.closest('[class*="tooltip"]'))
                {
                    this.ogl._tooltip.close();
                }
                
                if(event.target.getAttribute('data-galaxy'))
                {
                    let coords = event.target.getAttribute('data-galaxy').split(':');

                    if(this.ogl.page === 'galaxy')
                    {
                        galaxy = coords[0];
                        system = coords[1];
                        loadContentNew(galaxy, system);
                    }
                    else
                    {
                        const url = `https://${window.location.host}/game/index.php?page=ingame&component=galaxy&galaxy=${coords[0]}&system=${coords[1]}`;
                        if(event.ctrlKey) window.open(url, '_blank');
                        else window.location.href = url;
                    }
                }

                if(event.target.classList.contains('planetlink') || event.target.classList.contains('moonlink')
                || event.target.closest('.planetlink, .moonlink'))
                {
                    if(document.body.classList.contains('ogl_destinationPicker'))
                    {
                        event.preventDefault();

                        const coords = event.target.closest('.smallplanet').querySelector('.planet-koords').innerText.split(':');
                        const type = event.target.closest('.planetlink, .moonlink').classList.contains('moonlink') ? 3 : 1;

                        if(document.body.classList.contains('ogl_initHarvest'))
                        {
                            window.location.href = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&galaxy=${coords[0]}&system=${coords[1]}&position=${coords[2]}&type=${type}&oglmode=1`;
                        }
                        else
                        {
                            if(!unsafeWindow.fleetDispatcher || !this.ogl._fleet?.isReady) return;

                            this.ogl._fleet.setRealTarget(JSON.parse(JSON.stringify(fleetDispatcher.targetPlanet)));

                            if(fleetDispatcher.currentPage == 'fleet1')
                            {
                                fleetDispatcher.focusSubmitFleet1();
                            }
                            else if(fleetDispatcher.currentPage == 'fleet2')
                            {
                                fleetDispatcher.focusSendFleet();
                                fleetDispatcher.updateTarget();
                            }
                        }
                    }
                }

                if(event.target.getAttribute('data-api-code')) // copy api code
                {
                    navigator.clipboard.writeText(event.target.getAttribute('data-api-code'));
                    fadeBox('API code copied');
                }

                if(event.target.classList.contains('js_actionKillAll')) // clear ogl reports cache
                {
                    if(ogame?.messages?.getCurrentMessageTab() == 20)
                    {
                        ogl.cache.reports = {};
                    }
                }
            });
        }
    }

    openFleetProfile()
    {
        const container = Util.addDom('div', { class:'ogl_keeper' });
        Util.addDom('h2', { child:'Limiters', parent:container });

        const leftSide = Util.addDom('div', { parent:container });

        const limitResourceLabel = Util.addDom('label', { class:'ogl_limiterLabel tooltip', 'data-limiter-type':'resource', title:this.ogl._lang.find('resourceLimiter'), parent:leftSide, child:'Resources' });
        const limitResourceCheckbox = Util.addDom('input', { type:'checkbox', parent:limitResourceLabel, onclick:() =>
        {
            this.ogl.db.fleetLimiter.resourceActive = !this.ogl.db.fleetLimiter.resourceActive;
            this.ogl._fleet.updateLimiter();
            document.querySelectorAll(`[data-limiter-type="${limitResourceLabel.getAttribute('data-limiter-type')}"] input`).forEach(e => e.checked = this.ogl.db.fleetLimiter.resourceActive);
        }});
        const resourceContainer = Util.addDom('div', { parent:leftSide, class:'ogl_resourceLimiter' });
        Util.addDom('br', { parent:leftSide });

        const limitShipLabel = Util.addDom('label', { class:'ogl_limiterLabel tooltip', 'data-limiter-type':'ship', title:this.ogl._lang.find('fleetLimiter'), parent:leftSide, child:'Ships' });
        const limitShipCheckbox = Util.addDom('input', { type:'checkbox', parent:limitShipLabel, onclick:() =>
        {
            this.ogl.db.fleetLimiter.shipActive = !this.ogl.db.fleetLimiter.shipActive;
            this.ogl._fleet.updateLimiter();
            document.querySelectorAll(`[data-limiter-type="${limitShipLabel.getAttribute('data-limiter-type')}"] input`).forEach(e => e.checked = this.ogl.db.fleetLimiter.shipActive);
        }});
        const fleetContainer = Util.addDom('div', { parent:leftSide, class:'ogl_shipLimiter' });
        Util.addDom('br', { parent:leftSide });

        const limitJumpgateLabel = Util.addDom('label', { class:'ogl_limiterLabel tooltip', 'data-limiter-type':'jumpgate', title:this.ogl._lang.find('fleetLimiter'), parent:leftSide, child:'Jumpgate' });
        const limitJumpgateCheckbox = Util.addDom('input', { type:'checkbox', parent:limitJumpgateLabel, onclick:() =>
        {
            this.ogl.db.fleetLimiter.jumpgateActive = !this.ogl.db.fleetLimiter.jumpgateActive;
            this.ogl._jumpgate.updateLimiter();
            document.querySelectorAll(`[data-limiter-type="${limitJumpgateLabel.getAttribute('data-limiter-type')}"] input`).forEach(e => e.checked = this.ogl.db.fleetLimiter.jumpgateActive);
        }});
        const jumpgateContainer = Util.addDom('div', { parent:leftSide, class:'ogl_jumpgateLimiter' });

        if(this.ogl.db.fleetLimiter.resourceActive) limitResourceCheckbox.checked = true;
        if(this.ogl.db.fleetLimiter.shipActive) limitShipCheckbox.checked = true;
        if(this.ogl.db.fleetLimiter.jumpgateActive) limitJumpgateCheckbox.checked = true;

        Object.keys(this.ogl.resourcesKeys).concat(this.ogl.shipsList).forEach(id =>
        {
            if(id != 'population' && id != 'darkmatter' && id != 'energy')
            {
                const parent = isNaN(id) ? resourceContainer : fleetContainer;

                // ships
                const item = Util.addDom('div', { parent:parent, class:`ogl_icon ogl_${id}`, 'data-id':id });
                const input = Util.addDom('input',
                {
                    class:'ogl_inputCheck',
                    parent:item,
                    value:this.ogl.db.fleetLimiter.data[id] || 0,
                    oninput:() =>
                    {
                        setTimeout(() =>
                        {
                            this.ogl.db.fleetLimiter.data[id] = parseInt(input.value.replace(/\D/g, '')) || 0;
                            this.ogl._fleet.updateLimiter(true);
                        }, 200);
                    }
                });

                // jumpgate
                if(!isNaN(id))
                {
                    const jumpgateItem = Util.addDom('div', { parent:jumpgateContainer, class:`ogl_icon ogl_${id}`, 'data-id':id });
                    const jumpgateInput = Util.addDom('input',
                    {
                        class:'ogl_inputCheck',
                        parent:jumpgateItem,
                        value:this.ogl.db.fleetLimiter.jumpgateData[id] || 0,
                        oninput:() =>
                        {
                            setTimeout(() =>
                            {
                                this.ogl.db.fleetLimiter.jumpgateData[id] = parseInt(jumpgateInput.value.replace(/\D/g, '')) || 0;
                                this.ogl._fleet.updateLimiter();
                            }, 200);
                        }
                    });
                }
            }
        });

        //container.querySelectorAll('.ogl_inputCheck').forEach(e => Util.formatInput(e));

        return container;
    }

    openKeyboardActions()
    {
        const container = Util.addDom('div', {class:'ogl_keyboardActions'});
        const changes = {};

        Util.addDom('h2', { parent:container, child:this.ogl._lang.find('keyboardActions') });

        Object.entries(this.ogl.db.options.keyboardActions).forEach(key =>
        {
            const label = Util.addDom('label', { parent:container, child:`${this.ogl._lang.find(key[0])}` });
            const input = Util.addDom('input', { maxlength:'1', type:'text', value:key[1], parent:label,
            onclick:() =>
            {
                input.value = '';
                input.select();
            },
            onblur:() =>
            {
                if(input.value == '') input.value = key[1];
            },
            oninput:() =>
            {
                changes[key[0]] = input.value;
            }});


            if(key[0] == 'fleetResourcesSplit')
            {
                input.classList.add('ogl_disabled');
                input.disabled = true;
            }
        });

        Util.addDom('button', { parent:container, class:'ogl_button', child:'save', onclick:() =>
        {
            Object.entries(changes).forEach(key =>
            {
                this.ogl.db.options.keyboardActions[key[0]] = changes[key[0]];
                window.location.reload();
            });
        }});

        return container;
    }

    openExpeditionFiller()
    {
        const container = Util.addDom('div', {class:'ogl_expeditionFiller'});

        Util.addDom('h2', { parent:container, child:this.ogl._lang.find('expeditionBigShips') });

        [204, 205, 206, 207, 215, 211, 213, 218].forEach(shipID =>
        {
            const item = Util.addDom('div', { class:`ogl_icon ogl_${shipID}`, parent:container, onclick:() =>
            {
                if(this.ogl.db.options.expeditionBigShips.indexOf(shipID) > -1)
                {
                    this.ogl.db.options.expeditionBigShips = this.ogl.db.options.expeditionBigShips.filter(a => a !== shipID);
                    item.classList.remove('ogl_active');
                }
                else
                {
                    this.ogl.db.options.expeditionBigShips.push(shipID);
                    item.classList.add('ogl_active');
                }
            }});

            if(this.ogl.db.options.expeditionBigShips.indexOf(shipID) > -1) item.classList.add('ogl_active');
        });

        return container;
    }

    openDataManager()
    {
        const container = Util.addDom('div', {class:'ogl_manageData'});
        Util.addDom('h2', { parent:container, child:this.ogl._lang.find('manageData') });
        
        const grid = Util.addDom('div', { class:'ogl_grid', parent:container });

        // import
        Util.addDom('label', { class:'ogl_button', for:'ogl_import', child:'Import data', parent:grid });
        const importButton = Util.addDom('input', { id:'ogl_import', class:'ogl_hidden', accept:"application/JSON", type:'file', parent:grid, onchange:() =>
        {
            const file = importButton.files[0];
            const reader = new FileReader();

            reader.onload = () =>
            {
                let json;
                let error;

                try { json = JSON.parse(reader.result); }
                catch (e) { error = 'cannot read file'; }

                if(!error && json && json.dataFormat > 10)
                {
                    this.ogl.db = json;
                    document.location.reload();
                }
                else
                {
                    this.ogl._notification.addToQueue(`Error, ${error||"wrong data format"}`, false);
                }
            }

            reader.readAsText(file);
        }});

        // export
        Util.addDom('a', { class:'ogl_button', download:`oglight_${this.ogl.server.name}_${this.ogl.server.lang}_${serverTime.getTime()}`, child:'Export data', parent:grid, href:URL.createObjectURL(new Blob([JSON.stringify(this.ogl.db)], {type: 'application/json'})) });

        Util.addDom('hr', { parent:grid });

        // stats
        Util.addDom('div', { class:'ogl_button ogl_danger', child:this.ogl._lang.find('resetStats')+' <i class="material-icons">donut_large</i>', parent:grid, onclick:() =>
        {
            if(confirm(this.ogl._lang.find('resetStatsLong')))
            {
                this.ogl.cache.raids = {};
                this.ogl.db.stats = {};
                window.location.reload();
                this.ogl.db.initialTime = Date.now();
            }
        }});

        // tagged
        Util.addDom('div', { class:'ogl_button ogl_danger', child:this.ogl._lang.find('resetTaggedPlanets')+' <i class="material-icons">stroke_full</i>', parent:grid, onclick:() =>
        {
            if(confirm(this.ogl._lang.find('resetTaggedPlanetsLong')))
            {
                this.ogl.db.tdb = {};
                this.ogl.db.quickRaidList = [];
                window.location.reload();
            }
        }});

        // pinned
        Util.addDom('div', { class:'ogl_button ogl_danger', child:this.ogl._lang.find('resetPinnedPlayers')+' <i class="material-icons">push_pin</i>', parent:grid, onclick:() =>
        {
            if(confirm(this.ogl._lang.find('resetPinnedPlayersLong')))
            {
                this.ogl.db.pdb = {};
                this.ogl.db.udb = {};
                this.ogl.db.lastPinnedList = [];
                this.ogl.db.quickRaidList = [];
                window.location.reload();
            }
        }});

        // all
        Util.addDom('div', { class:'ogl_button ogl_danger', child:this.ogl._lang.find('resetAll'), parent:grid, onclick:() =>
        {
            if(confirm(this.ogl._lang.find('resetAllLong')))
            {
                this.ogl.cache = {};
                this.ogl.db = {};
                window.location.reload();
                this.ogl.db.initialTime = Date.now();
            }
        }});

        return container;
    }

    groupPlanets()
    {
        let lastCoords = 0;
        let group = 1;

        document.querySelectorAll('.smallplanet').forEach(planet =>
        {
            let newCoords = Util.coordsToID(planet.querySelector('.planet-koords').innerText).slice(0, -3);
            if(lastCoords === newCoords) planet.setAttribute('data-group', group);
            else if(planet.previousElementSibling?.getAttribute('data-group')) group++;
            lastCoords = newCoords;
        });
    }

    checkImportExport()
    {
        if((this.ogl.db.nextImportExport || 0) < Date.now())
        {
            document.querySelector('.menubutton[href*=traderOverview]').classList.add('ogl_active');
        }

        window.addEventListener('beforeunload', () =>
        {
            let textTarget = document.querySelector('.bargain_text');
            let button = document.querySelector('.import_bargain.hidden');

            if(textTarget && button)
            {
                let today = new Date(serverTime.getTime());
                let tomorow = new Date(serverTime.getTime() + 86400000);

                if(textTarget.innerText.match(/\d+/g))
                {
                    this.ogl.db.nextImportExport = new Date(today.getFullYear(), today.getMonth(), today.getDate(), textTarget.innerText.match(/\d+/g)[0], 0, 0).getTime();
                }
                else
                {
                    this.ogl.db.nextImportExport = new Date(tomorow.getFullYear(), tomorow.getMonth(), tomorow.getDate(), 0, 0, 1).getTime();
                }

                this.ogl.save();
            }
            else if(textTarget && textTarget.innerText == '')
            {
                this.ogl.db.nextImportExport = serverTime.getTime();
                this.ogl.save();
            }
        });
    }

    turnIntoPlayerLink(id, dom, name)
    {
        dom.classList.add('tooltipUpdate');
        dom.classList.add('tooltipRight');
        dom.classList.add('tooltipClose');

        dom.addEventListener('click', event =>
        {
            if(id == this.ogl.account.id || event.ctrlKey) return;
            event.preventDefault();
            this.ogl._topbar.openPinnedDetail(id);
        });

        dom.addEventListener('tooltip', () =>
        {
            this.ogl._tooltip.update(Util.addDom('div', { child:'<div class="ogl_loading"></div>' }));
            this.ogl._fetch.fetchPlayerAPI(id, name, () =>
            {
                if(document.querySelector('.ogl_pinDetail') && this.ogl.db.currentSide == id) // current pin
                {
                    this.ogl._topbar.openPinnedDetail(id);
                }

                if(document.querySelector(`.ogl_tooltip #player${id}`) || this.ogl._tooltip.lastSender == dom) // current tooltip
                {
                    this.ogl._tooltip.update(this.getPlayerTooltip(id), dom);
                }
            });
        });
    }

    getPlayerTooltip(id)
    {
        const player = this.ogl.db.udb[id];
        const page = Math.ceil(player.score.globalRanking / 100);
        const container = Util.addDom('div',
        {
            class:'ogl_playerData' ,
            child:`
            <h1 class="${player.status || 'status_abbr_active'}">${player.name} <a href="https://${window.location.host}/game/index.php?page=highscore&site=${page}&searchRelId=${id}">#${player.score.globalRanking}</a></h1>
            <div class="ogl_grid">
                <div class="ogl_leftSide">
                    <div class="ogl_actions"></div>
                    <div class="ogl_score">
                        <div class="ogl_line"><i class="material-icons">trending_up</i><div>${Util.formatNumber(player.score.global)}</div></div>
                        <div class="ogl_line"><i class="material-icons">diamond</i><div>${Util.formatNumber(player.score.economy)}</div></div>
                        <div class="ogl_line"><i class="material-icons">science</i><div>${Util.formatNumber(player.score.research)}</div></div>
                        <div class="ogl_line"><i class="material-icons">genetics</i><div>${Util.formatNumber(player.score.lifeform)}</div></div>
                        <div class="ogl_line"><i class="material-icons">rocket_launch</i><div>${Util.formatNumber(Util.getPlayerScoreFD(player.score, 'fleet'))}</div></div>
                        <div class="ogl_line"><i class="material-icons">security</i><div>${Util.formatNumber(Util.getPlayerScoreFD(player.score, 'defense'))}</div></div>
                        <div class="ogl_line"><i class="material-icons">schedule</i><div>${new Date(player.api).toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'})}</div></div>
                    </div>
                </div>
                <div class="ogl_planetStalk"></div>
            </div>`
        });

        // write
        const writeIcon = Util.addDom('div', { child:'edit', class:'material-icons ogl_button', parent:container.querySelector('.ogl_actions'), onclick:() =>
        {
            if(!document.querySelector('#chatBar'))
            {
                window.location.href = `https://${window.location.host}/game/index.php?page=chat&playerId=${player.uid}`;
            }
        }});

        if(document.querySelector('#chatBar'))
        {
            writeIcon.classList.add('js_openChat');
            writeIcon.setAttribute('data-playerId', player.uid);
        }

        // buddy
        Util.addDom('a', { child:'account-plus', class:'material-icons ogl_button overlay', parent:container.querySelector('.ogl_actions'), href:`https://${window.location.host}/game/index.php?page=ingame&component=buddies&action=7&id=${player.uid}&ajax=1`, onclick:() =>
        {
            this.ogl._tooltip.close();
        }});
        
        // ignore
        Util.addDom('div', { child:'block', class:'material-icons ogl_button', parent:container.querySelector('.ogl_actions'), onclick:() =>
        {
            window.location.href = `https://${window.location.host}/game/index.php?page=ignorelist&action=1&id=${player.uid}`;
        }});

        // mmorpgstat
        Util.addDom('div', { child:'query_stats', class:'material-icons ogl_button', parent:container.querySelector('.ogl_actions'), onclick:() =>
        {
            window.open(Util.genMmorpgstatLink(player.uid), '_blank');
        }});

        if(id != this.ogl.account.id)
        {
            // pin to right
            Util.addDom('div', { child:'arrow_forward', class:'material-icons ogl_button', parent:container.querySelector('.ogl_actions'), onclick:() =>
            {
                this.ogl._topbar.openPinnedDetail(player.uid);
            }});
        }

        const planetList = container.querySelector('.ogl_planetStalk');

        let lastCoords = 0;
        let group = 1;

        player.planets.sort((a, b) => Util.coordsToID(a) - Util.coordsToID(b)).forEach((planet, index) =>
        {
            let coords = planet.split(':');

            let div = Util.addDom('div',
            {
                parent:planetList,
                child:`<div>${index+1}</div><div data-galaxy="${coords[0]}:${coords[1]}">${planet}</div>`
            });

            let newCoords = Util.coordsToID(coords).slice(0, -3);
            if(lastCoords === newCoords) div.setAttribute('data-group', group);
            else if(div.previousElementSibling?.getAttribute('data-group')) group++;
            lastCoords = newCoords;

            if(this.ogl.db.pdb[planet]?.home) div.classList.add('ogl_home');

            if(window.unsafeWindow['galaxy'] == coords[0] && window.unsafeWindow['system'] == coords[1]) div.querySelector('[data-galaxy]').classList.add('ogl_active');

            this.addSpyIcons(div, coords);
        });

        return container;
    }

    addPinButton(element, id)
    {
        const player = this.ogl.db.udb[id];

        const div = Util.addDom('div', { class:'ogl_flagPicker material-icons tooltipLeft tooltipClick tooltipClose tooltipUpdate', 'data-uid':id, parent:element, ontooltip:event =>
        {
            this.ogl._tooltip.tooltip.appendChild(tooltip);
        }, onclick:event =>
        {
            if(event.shiftKey)
            {
                event.preventDefault();
                if(this.ogl.db.lastPinUsed == 'none' && this.ogl.db.udb[id])
                {
                    delete this.ogl.db.udb[id].pin;
                    document.querySelectorAll(`.ogl_flagPicker[data-uid="${id}"]`).forEach(e =>
                    {
                        e.removeAttribute('data-flag');
                        e.innerText = '';
                    });
                }
                else
                {
                    this.ogl.db.udb[id] = this.ogl.db.udb[id] || this.ogl.createPlayer(id);
                    this.ogl.db.udb[id].pin = this.ogl.db.lastPinUsed;
                    document.querySelectorAll(`.ogl_flagPicker[data-uid="${id}"]`).forEach(e =>
                    {
                        e.setAttribute('data-flag', this.ogl.db.lastPinUsed);
                    });
                }
            }
        }});

        const tooltip = Util.addDom('div', { class:'ogl_flagSelector material-icons' });
        this.ogl.flagsList.forEach(pin =>
        {
            if(pin == 'ptre' && !this.ogl.ptreKey) return;

            const icon = Util.addDom('div', { 'data-flag':pin, parent:tooltip, onclick:() =>
            {
                if(pin == 'none' && this.ogl.db.udb[id])
                {
                    delete this.ogl.db.udb[id].pin;
                    document.querySelectorAll(`.ogl_flagPicker[data-uid="${id}"]`).forEach(e =>
                    {
                        e.removeAttribute('data-flag');
                        e.innerText = '';
                    });
                }
                else
                {
                    this.ogl.db.udb[id] = this.ogl.db.udb[id] || this.ogl.createPlayer(id);
                    this.ogl.db.udb[id].pin = pin;
                    document.querySelectorAll(`.ogl_flagPicker[data-uid="${id}"]`).forEach(e =>
                    {
                        e.setAttribute('data-flag', pin);
                    });
                }

                this.ogl.db.lastPinUsed = pin;
                if(pin != 'none') this.ogl._topbar.openPinnedDetail(id);
                this.ogl._tooltip.close();
            }});
        });

        if(player?.pin)
        {
            div.setAttribute('data-flag', player.pin);
        }
    }

    addTagButton(element, coords)
    {
        const raw = Util.coordsToID(coords);
        const position = this.ogl.db.tdb[raw];

        const div = Util.addDom('div', { class:'ogl_tagPicker material-icons tooltipLeft tooltipClick tooltipClose tooltipUpdate', 'data-raw':raw, parent:element, ontooltip:event =>
        {
            this.ogl._tooltip.tooltip.appendChild(tooltip);
        },
        onclick:event =>
        {
            if(event.shiftKey)
            {
                if(this.ogl.db.lastTagUsed == 'none' && this.ogl.db.tdb[raw])
                {
                    delete this.ogl.db.tdb[raw];
                    document.querySelectorAll(`.ogl_tagPicker[data-raw="${raw}"]`).forEach(e => e.removeAttribute('data-tag'));
                }
                else
                {
                    this.ogl.db.tdb[raw] = this.ogl.db.tdb[raw] || {};
                    this.ogl.db.tdb[raw].tag = this.ogl.db.lastTagUsed;
                    document.querySelectorAll(`.ogl_tagPicker[data-raw="${raw}"]`).forEach(e => e.setAttribute('data-tag', this.ogl.db.lastTagUsed));
                }
            }
        }});

        const tooltip = Util.addDom('div', { class:'ogl_tagSelector material-icons' });
        Object.keys(this.ogl.db.tags).forEach(tag =>
        {
            Util.addDom('div', { 'data-tag':tag, parent:tooltip, onclick:() =>
            {
                if(tag == 'none' && this.ogl.db.tdb[raw])
                {
                    delete this.ogl.db.tdb[raw];
                    document.querySelectorAll(`.ogl_tagPicker[data-raw="${raw}"]`).forEach(e => e.removeAttribute('data-tag'));
                }
                else
                {
                    this.ogl.db.tdb[raw] = this.ogl.db.tdb[raw] || {};
                    this.ogl.db.tdb[raw].tag = tag;
                    document.querySelectorAll(`.ogl_tagPicker[data-raw="${raw}"]`).forEach(e => e.setAttribute('data-tag', tag));
                }

                this.ogl.db.lastTagUsed = tag;
                this.ogl._tooltip.close();
            }});
        });

        if(position?.tag)
        {
            div.setAttribute('data-tag', position.tag);
        }
    }

    addSpyIcons(parent, coords, uniqueType, displayActivity)
    {
        coords = typeof coords == typeof '' ? coords = coords.split(':') : coords;

        if(uniqueType == 'planet' || !uniqueType)
        {// onclick:e => this.ogl._fleet.addToSpyQueue(6, coords[0], coords[1], coords[2], 1)
            const planetIcon = Util.addDom('div', { class:'material-icons ogl_spyIcon tooltip', 'data-title':this.ogl._lang.find('spyPlanet'), 'data-spy-coords':`${coords[0]}:${coords[1]}:${coords[2]}:1`, child:'language', parent:parent, onclick:e => this.ogl._notification.addToQueue(this.ogl._lang.find('notifyNoProbe'), false, true) });
            const lastPlanetSpy = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.spy?.[0] || 0;
            if(serverTime.getTime() - lastPlanetSpy < this.ogl.db.options.spyIndicatorDelay)
            {
                planetIcon.setAttribute('data-spy', 'recent');
                planetIcon.setAttribute('data-title', 'recently spied');
            }

            if(displayActivity)
            {
                const activity = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.acti || [];
                const isRecent = serverTime.getTime() - activity[2] < 3600000;
                const activityDom = Util.addDom('span', { parent:planetIcon, child:isRecent ? activity[0] : '?' });
                (activity[0] == '*' && isRecent) ? activityDom.classList.add('ogl_danger') : (activity[0] == 60 && isRecent) ? activityDom.classList.add('ogl_ok') : activityDom.classList.add('ogl_warning');
            }
        }
        
        if(uniqueType == 'moon' || (!uniqueType && this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.mid))
        {// onclick:e => this.ogl._fleet.addToSpyQueue(6, coords[0], coords[1], coords[2], 3)
            const moonIcon = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.mid > 0 ? Util.addDom('div', { class:'material-icons ogl_spyIcon tooltip', 'data-title':this.ogl._lang.find('spyMoon'), 'data-spy-coords':`${coords[0]}:${coords[1]}:${coords[2]}:3`,child:'bedtime', parent:parent, onclick:e => this.ogl._notification.addToQueue(this.ogl._lang.find('notifyNoProbe'), false, true)}) : Util.addDom('div', { parent:parent });
            const lastMoontSpy = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.spy?.[1] || 0;
            if(serverTime.getTime() - lastMoontSpy < this.ogl.db.options.spyIndicatorDelay)
            {
                moonIcon.setAttribute('data-spy', 'recent');
                moonIcon.setAttribute('data-title', 'recently spied');
            }

            if(displayActivity && this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.mid > -1)
            {
                const activity = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.acti || [];
                const isRecent = serverTime.getTime() - activity[2] < 3600000;
                const activityDom = Util.addDom('span', { parent:moonIcon, child:isRecent ? activity[1] : '?' });
                (activity[1] == '*' && isRecent) ? activityDom.classList.add('ogl_danger') : (activity[1] == 60 && isRecent) ? activityDom.classList.add('ogl_ok') : activityDom.classList.add('ogl_warning');
            }
        }

        if(!uniqueType && ! this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.mid)
        {
            Util.addDom('div', { parent:parent });
        }
    }

    updateLeftMenu()
    {
        const leftMenu = document.querySelector('#menuTable');
        const version = oglVersion;

        const oglBlock = Util.addDom('li', { parent:leftMenu });
        const oglIcon = Util.addDom('span', { parent:oglBlock, class:'menu_icon ogl_leftMenuIcon', child:`<a class="tooltipRight" href="https://openuserjs.org/scripts/nullNaN/OGLight" target="_blank"><i class="material-icons">oglight_simple</i></a>` });
        Util.addDom('a', { parent:oglBlock, class:'menubutton tooltipRight', href:'https://board.fr.ogame.gameforge.com/index.php?thread/722955-oglight/', target:'_blank', child:`<span class="textlabel">OGLight ${version}</span>` });

        if(this.ogl.ptreKey)
        {
            const ptreBlock = Util.addDom('li', { parent:leftMenu });
            Util.addDom('span', { parent:ptreBlock, class:'menu_icon ogl_leftMenuIcon ogl_ptreActionIcon', child:`<a class="tooltipRight" data-title="PTRE last request status" href="#"><i class="material-icons">sync_alt</i></a>`, onclick:() => PTRE.displayLogs() });
            Util.addDom('a', { parent:ptreBlock, class:'menubutton tooltipRight', href:'https://ptre.chez.gg/', target:'_blank', child:`<span class="textlabel">PTRE</span>` });
        }

        if(this.ogl.version.indexOf('-b') == -1)
        {
            if(typeof GM_xmlhttpRequest !== 'undefined' && (serverTime.getTime() > (this.ogl.db.lastVersionCheck || 0) + 86400000))
            {
                GM_xmlhttpRequest(
                {
                    method:'GET',
                    url:'https://openuserjs.org/meta/nullNaN/OGLight.meta.js/',
                    onload:result =>
                    {
                        this.ogl.db.serverVersion = result.responseText.replace(/\D/g, '');
                        this.ogl.db.lastVersionCheck = serverTime.getTime();

                        if(this.ogl.version.replace(/\D/g, '') != this.ogl.db.serverVersion)
                        {
                            oglIcon.querySelector('i').classList.add('ogl_danger');
                            oglIcon.querySelector('a').setAttribute('data-title', 'New update available');
                        }
                    }
                });
            }
            else if(this.ogl.version.replace(/\D/g, '') != this.ogl.db.serverVersion)
            {
                oglIcon.querySelector('i').classList.add('ogl_danger');
                oglIcon.querySelector('a').setAttribute('data-title', 'New update available');
            }
        }
    }

    updateFooter()
    {
        const footer = document.querySelector('#siteFooter .fright');
        const lang = ['fr', 'de', 'en', 'es', 'pl', 'it', 'ru', 'ar', 'mx', 'tr', 'fi', 'tw', 'gr', 'br', 'nl',
        'hr', 'sk', 'cz', 'ro', 'us', 'pt', 'dk', 'no', 'se', 'si', 'hu', 'jp', 'ba'].indexOf(this.ogl.server.lang);

        footer.innerHTML +=
        `
            | <a target="_blank" href="https://www.mmorpg-stat.eu/0_fiche_joueur.php?pays=${lang}&ftr=${this.ogl.account.id}.dat&univers=_${this.ogl.server.id}">Mmorpg-stat</a>
            | <a target="_blank" href="https://trashsim.oplanet.eu/${this.ogl.server.lang}">Trashsim</a>
            | <a target="_blank" href="https://ogotcha.oplanet.eu/${this.ogl.server.lang}">Ogotcha</a>
            | <a>OGL ${this.ogl.version}</a>
        `;
    }

    updateHighscore()
    {
        if(serverTime.getTime() - this.highscoreDelay < 500) return;
        this.highscoreDelay = serverTime.getTime();

        const typesList = { 0:'global', 1:'economy', 2:'research', 3:'military', 8:'lifeform' };

        document.querySelector('#stat_list_content').setAttribute('data-category', currentCategory);
        document.querySelector('#stat_list_content').setAttribute('data-type', currentType);

        if(currentCategory != 1 || !typesList[currentType]) return;

        const highscore = JSON.parse(localStorage.getItem(`${window.location.host}_highscore`) || '{}');
        if(currentType == 0) Util.runAsync(() => this.displayScoreDiff(highscore));

        if(!highscore.timestamps?.[typesList[currentType]] || serverTime.getTime() - highscore.timestamps?.[typesList[currentType]] > 86400000 * 2) // 2 days
        {
            this.ogl._fetch.pending.push(
            {
                url:`https://${window.location.host}/api/highscore.xml?category=${currentCategory}&type=${currentType}`,
                callback:data =>
                {
                    console.log(`ranking ${typesList[currentType]} score fetched`);
                    highscore.timestamps = highscore.timestamps || {};

                    let xml = new DOMParser().parseFromString(data, 'text/html');
                    highscore.timestamps[typesList[currentType]] = parseInt(xml.querySelector('highscore').getAttribute('timestamp')) * 1000;
    
                    xml.querySelectorAll('player').forEach(player =>
                    {
                        const id = player.getAttribute('id');
                        const score = parseInt(player.getAttribute('score'));
                        const position = parseInt(player.getAttribute('position'));
    
                        if(!highscore[id] || typeof highscore[id] != typeof {}) highscore[id] = {};
                        highscore[id][typesList[currentType]] = score;

                        /*if(this.ogl.db.udb[id]?.score)
                        {
                            this.ogl.db.udb[id].score[typesList[currentType]] = score;
                            this.ogl.db.udb[id].score[typesList[currentType]+'Ranking'] = position;
                        }*/
                    });
    
                    localStorage.setItem(`${window.location.host}_highscore`, JSON.stringify(highscore));
                    if(currentType == 0) this.displayScoreDiff(highscore);
                }
            });
        }
    }

    updateStatus()
    {
        if(serverTime.getTime() - this.statusDelay < 500) return;
        this.statusDelay = serverTime.getTime();

        if(currentCategory != 1) return;

        const highscore = JSON.parse(localStorage.getItem(`${window.location.host}_highscore`) || '{}');
        Util.runAsync(() => this.displayStatus(highscore));

        if(!highscore.statusTimestamp || serverTime.getTime() - highscore.statusTimestamp > 86400000) // 1 day
        {
            this.ogl._fetch.pending.push(
            {
                url:`https://${window.location.host}/api/players.xml`,
                callback:data =>
                {
                    console.log('ranking status fetched');
                    let xml = new DOMParser().parseFromString(data, 'text/html');
                    highscore.statusTimestamp = parseInt(xml.querySelector('players').getAttribute('timestamp')) * 1000;
    
                    xml.querySelectorAll('player').forEach(player =>
                    {
                        const id = player.getAttribute('id');
                        let status = player.getAttribute('status') || 'status_abbr_active';

                        if(status.indexOf('v') > -1  && status != 'status_abbr_active') status = 'status_abbr_vacation';
                        else if(status === "I") status = 'status_abbr_longinactive';
                        else if(status === "i") status = 'status_abbr_inactive';
    
                        if(!highscore[id] || typeof highscore[id] != typeof {}) highscore[id] = {};
                        highscore[id].status = status;
                        if(this.ogl.db.udb[id]) this.ogl.db.udb[id].status = status;
                    });
    
                    localStorage.setItem(`${window.location.host}_highscore`, JSON.stringify(highscore));
                    this.displayStatus(highscore);
                }
            });
        }
    }

    displayScoreDiff(highscore)
    {
        if(document.querySelector('#ranks .ogl_scoreDiff') || currentCategory != 1 || currentType !== 0) return;

        const timeDiff = Math.round((serverTime.getTime() - highscore.timestamps.global) / 3600000);
        const top = [];

        Util.addDom('div', { class:'ogl_rankSince', prepend:document.querySelector('#stat_list_content'), child:`last ${timeDiff}h` });

        document.querySelectorAll('#ranks tbody tr').forEach(line =>
        {
            const id = line.getAttribute('id').replace('position', '');
            const currentScore = line.querySelector('.score').innerText.replace(/\D/g, '');
            const diff = (currentScore - highscore[id]?.global) || 0;

            top.push({id, diff});

            line.querySelector('.ogl_scoreDiff')?.remove();

            const scoreDiff = Util.addDom('span', { class:'ogl_scoreDiff', parent:line.querySelector('.score'), child:(diff > 0 ? '+' : '') + Util.formatNumber(diff) });
            if(diff > 0) scoreDiff.classList.add('ogl_ok');
            else if(diff < 0) scoreDiff.classList.add('ogl_danger');
        });

        top.sort((a, b) => b.diff - a.diff).slice(0, 3).forEach(item => document.querySelector('#position'+item.id).classList.add('ogl_bigScore'));
        top.sort((a, b) => a.diff - b.diff).slice(0, 3).forEach(item => { if(item.diff < 0) document.querySelector('#position'+item.id).classList.add('ogl_lowScore') });
    }

    displayStatus(highscore)
    {
        document.querySelectorAll('#ranks tbody tr').forEach(line =>
        {
            const id = line.getAttribute('id').replace('position', '');
            const nameDiv = line.querySelector('.name > a');

            if(this.ogl.db.udb[id]?.name && nameDiv.querySelector('.playername').innerText.indexOf('...') >= 0)
            {
                nameDiv.querySelector('.playername').innerText = this.ogl.db.udb[id].name;
            }
            
            if(highscore[id]) nameDiv.querySelector('.playername').classList.add(highscore[id].status);
            this.turnIntoPlayerLink(id, nameDiv);
            if(!line.querySelector('.ogl_flagPicker')) this.addPinButton(line.querySelector('.position'), id);
        });
    }

    displayResourcesRecap()
    {
        this.resources = {};
        this.resources.total = { metal:0, crystal:0, deut:0, msu:0 };
        this.resources.prod = { metal:0, crystal:0, deut:0, msu:0 };
        this.resources.fly = { metal:0, crystal:0, deut:0 };
        this.resources.ground = { metal:0, crystal:0, deut:0 };
        this.resources.todo = { metal:0, crystal:0, deut:0 };

        document.querySelectorAll('.planetlink, .moonlink').forEach(planet =>
        {
            const urlParams = new URLSearchParams(planet.getAttribute('href'));
            const id = urlParams.get('cp').split('#')[0];

            ['metal', 'crystal', 'deut'].forEach(resourceName =>
            {
                this.resources.total[resourceName] += this.ogl.db.myPlanets[id]?.[resourceName] || 0;
                this.resources.ground[resourceName] += this.ogl.db.myPlanets[id]?.[resourceName] || 0;
                this.resources.prod[resourceName] += this.ogl.db.myPlanets[id]?.['prod'+resourceName] || 0;
            });

            Object.values(this.ogl.db.myPlanets[id]?.todolist || {}).forEach(entry =>
            {
                Object.values(entry || {}).forEach(todo =>
                {
                    if(!todo.cost) return;

                    this.resources.todo.metal += todo.cost.metal;
                    this.resources.todo.crystal += todo.cost.crystal;
                    this.resources.todo.deut += todo.cost.deut;
                });
            });
        });

        Object.entries(this.ogl.cache?.movements || {}).forEach(entry =>
        {
            entry[1].forEach(line =>
            {
                ['metal', 'crystal', 'deut'].forEach(resourceName =>
                {
                    this.resources.total[resourceName] += line[resourceName] || 0;
                    this.resources.fly[resourceName] += line[resourceName] || 0;
                });
            });
        });

        const msuValue = this.ogl.db.options.msu.split(':');
        this.resources.total.msu = this.resources.total.metal * msuValue[0] + this.resources.total.crystal * msuValue[1] + this.resources.total.deut * msuValue[2];

        this.resources.prod.metal = Math.floor(this.resources.prod.metal * 3600 * 24);
        this.resources.prod.crystal = Math.floor(this.resources.prod.crystal * 3600 * 24);
        this.resources.prod.deut = Math.floor(this.resources.prod.deut * 3600 * 24);
        this.resources.prod.msu = this.resources.prod.metal * msuValue[0] + this.resources.prod.crystal * msuValue[1] + this.resources.prod.deut * msuValue[2];

        this.resourceDiv.querySelector('.ogl_metal').innerHTML = `<span>${Util.formatToUnits(this.resources.total.metal)}</span><span>+${Util.formatToUnits(Math.floor(this.resources.prod.metal, 1))}</span>`;
        this.resourceDiv.querySelector('.ogl_crystal').innerHTML = `<span>${Util.formatToUnits(this.resources.total.crystal)}</span><span>+${Util.formatToUnits(Math.floor(this.resources.prod.crystal, 1))}</span>`;
        this.resourceDiv.querySelector('.ogl_deut').innerHTML = `<span>${Util.formatToUnits(this.resources.total.deut)}</span><span>+${Util.formatToUnits(Math.floor(this.resources.prod.deut, 1))}</span>`;
        this.resourceDiv.querySelector('.ogl_msu').innerHTML = `<span>${Util.formatToUnits(this.resources.total.msu)}</span><span>+${Util.formatToUnits(Math.floor(this.resources.prod.msu, 1))}</span>`;

        if(!this.recapReady)
        {
            this.recapReady = true;
            this.resourceDiv.classList.add('tooltipLeft');
            this.resourceDiv.classList.add('tooltipClick');
            this.resourceDiv.classList.add('tooltipClose');
            this.resourceDiv.classList.add('tooltipUpdate');
    
            this.resourceDiv.addEventListener('tooltip', () =>
            {
                const container = Util.addDom('div', { class:'ogl_resourcesDetail' });
    
                container.innerHTML =
                `
                    <div>
                        <h3 class="material-icons">precision_manufacturing</h3>
                        <div class="ogl_metal">+${Util.formatToUnits(this.resources.prod.metal)}</div>
                        <div class="ogl_crystal">+${Util.formatToUnits(this.resources.prod.crystal)}</div>
                        <div class="ogl_deut">+${Util.formatToUnits(this.resources.prod.deut)}</div>
                    </div>
                    <div>
                        <h3 class="material-icons">format_list_bulleted</h3>
                        <div class="ogl_metal ogl_todoDays">${Util.formatToUnits(this.resources.todo.metal)} <span>(${Math.ceil(Math.max(0, this.resources.todo.metal - this.resources.total.metal) / this.resources.prod.metal)}${LocalizationStrings.timeunits.short.day})</span></div>
                        <div class="ogl_crystal ogl_todoDays">${Util.formatToUnits(this.resources.todo.crystal)} <span>(${Math.ceil(Math.max(0, this.resources.todo.crystal - this.resources.total.crystal) / this.resources.prod.crystal)}${LocalizationStrings.timeunits.short.day})</span></div>
                        <div class="ogl_deut ogl_todoDays">${Util.formatToUnits(this.resources.todo.deut)} <span>(${Math.ceil(Math.max(0, this.resources.todo.deut - this.resources.total.deut) / this.resources.prod.deut)}${LocalizationStrings.timeunits.short.day})</span></div>
                    </div>
                    <hr>
                    <div>
                        <h3 class="material-icons">globe_uk</h3>
                        <div class="ogl_metal">${Util.formatToUnits(this.resources.ground.metal)}</div>
                        <div class="ogl_crystal">${Util.formatToUnits(this.resources.ground.crystal)}</div>
                        <div class="ogl_deut">${Util.formatToUnits(this.resources.ground.deut)}</div>
                    </div>
                    <div>
                        <h3 class="material-icons">send</h3>
                        <div class="ogl_metal">${Util.formatToUnits(this.resources.fly.metal)}</div>
                        <div class="ogl_crystal">${Util.formatToUnits(this.resources.fly.crystal)}</div>
                        <div class="ogl_deut">${Util.formatToUnits(this.resources.fly.deut)}</div>
                    </div>
                    <div>
                        <h3 class="material-icons">sigma</h3>
                        <div class="ogl_metal">${Util.formatToUnits(this.resources.total.metal)}</div>
                        <div class="ogl_crystal">${Util.formatToUnits(this.resources.total.crystal)}</div>
                        <div class="ogl_deut">${Util.formatToUnits(this.resources.total.deut)}</div>
                    </div>
                `;
    
                this.ogl._tooltip.update(container);
            });
        }
    }
}


class TopbarManager extends Manager
{
    load(reloaded)
    {
        this.topbar = Util.addDom('div', {class:'ogl_topbar', prepend:document.querySelector('#planetList')});

        Util.addDom('i', {class:'material-icons tooltipTop', child:'conversion_path', title:this.ogl._lang.find('collectResources'),parent:this.topbar, onclick:e =>
        {
            this.ogl.db.harvestCoords = false;
            document.body.classList.toggle('ogl_destinationPicker');
            document.body.classList.toggle('ogl_initHarvest');
        }});

        Util.addDom('i', { class:'material-icons tooltipTop', child:'account_balance', parent:this.topbar, title:this.ogl._lang.find('accountSummary'), onclick:() => this.openAccount() });
        Util.addDom('i', { class:'material-icons tooltipTop', child:'clock_loader_60', parent:this.topbar, title:this.ogl._lang.find('stats'), onclick:() => this.openStats() });
        Util.addDom('i', { class:'material-icons tooltipTop', child:'stroke_full', parent:this.topbar, title:this.ogl._lang.find('taggedPlanets'), onclick:() => this.openTagged(true) });
        Util.addDom('i', { class:'material-icons tooltipTop', child:'push_pin', parent:this.topbar, title:this.ogl._lang.find('pinnedPlayers'), onclick:() => this.openPinned(true) });
        Util.addDom('i', { class:'material-icons tooltipTop', child:'settings', parent:this.topbar, title:this.ogl._lang.find('oglSettings'), onclick:() => this.openSettings(true) });

        Util.addDom('a', { parent:this.topbar, class:'material-icons tooltipTop', child:'favorite', title:this.ogl._lang.find('coffee'), target:'_blank', href:'https://ko-fi.com/O4O22XV69' });
        
        this.syncBtn = Util.addDom('i', {class:'material-icons tooltipTop', child:'directory_sync', title:this.ogl._lang.find('syncEmpire'), parent:this.topbar, onclick:() =>
        {
            this.ogl._fetch.fetchLFBonuses();
            this.ogl._fetch.fetchEmpire();
            this.syncBtn.classList.add('ogl_disabled');
        }});

        if(!reloaded)
        {
            if(!isNaN(this.ogl.db.currentSide)) this.openPinnedDetail(this.ogl.db.currentSide);
            else if(this.ogl.db.currentSide == 'settings') this.openSettings();
            else if(this.ogl.db.currentSide == 'pinned') this.openPinned();
            else if(this.ogl.db.currentSide == 'tagged') this.openTagged();
        }

        Util.addDom('button', { class:'ogl_button', child:this.ogl._lang.find('siblingPlanetMoon'), parent:this.topbar, onclick:() =>
        {
            if(this.ogl.currentPlanet.obj.planetID || this.ogl.currentPlanet.obj.moonID)
            {
                window.location.href = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&oglmode=2`;
            }
            else
            {
                let nextID = this.ogl.planetType == 'planet' ? this.ogl.currentPlanet.dom.nextWithMoon.getAttribute('id').replace('planet-', '') : this.ogl.currentPlanet.dom.nextWithMoon.querySelector('.moonlink').getAttribute('href').match(/cp=(\d+)/)[1];
                window.location.href = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&cp=${nextID}&oglmode=2`;
            }
        }});
    }

    openAccount()
    {
        const container = Util.addDom('div', {class:'ogl_empire'});
        const count = document.querySelectorAll('.smallplanet').length;
        const stack = {};
        stack.fieldUsed = 0;
        stack.fieldMax = 0;
        stack.fieldLeft = 0;
        stack.temperature = 0;
        stack.metal = 0;
        stack.crystal = 0;
        stack.deut = 0;
        stack.prodmetal = 0;
        stack.prodcrystal = 0;
        stack.proddeut = 0;

        // top
        Util.addDom('div', {class:'ogl_invisible', parent:container});
        Util.addDom('div', {class:'ogl_invisible', parent:container});
        Util.addDom('div', {class:'ogl_invisible', parent:container});
        Util.addDom('div', {class:'ogl_invisible', parent:container});
        Util.addDom('div', {class:'ogl_invisible', parent:container});
        Util.addDom('div', {class:'ogl_invisible', parent:container});
        Util.addDom('div', {class:'ogl_invisible', parent:container});
        Util.addDom('div', {class:'ogl_icon ogl_metal', parent:container});
        Util.addDom('div', {class:'ogl_icon ogl_crystal', parent:container});
        Util.addDom('div', {class:'ogl_icon ogl_deut', parent:container});

        Util.addDom('div', {child:'Coords', parent:container});
        Util.addDom('div', {child:'P', parent:container});
        Util.addDom('div', {child:'M', parent:container});
        Util.addDom('div', {child:'Name', parent:container});
        Util.addDom('div', {child:'Fields', parent:container});
        Util.addDom('div', {child:'T°c', parent:container});
        Util.addDom('div', {child:'LF', parent:container});
        
        /*Util.addDom('div',
        {
            parent:container,
            child:`${Math.round(stack.fieldUsed / count)}/${Math.round(stack.fieldMax / count)} (<span>${Math.round(stack.fieldLeft / count)}</span>)`
        });

        let stackedTemperature = Util.addDom('div',
        {
            parent:container,
            child:Math.round(stack.temperature / count) + '°C'
        });

        if(stack.temperature / count >= 110) stackedTemperature.style.color = "#af644d"; // too hot
        else if(stack.temperature / count>= 10) stackedTemperature.style.color = "#af9e4d"; // hot
        else if(stack.temperature / count >= -40) stackedTemperature.style.color = "#4daf67"; // normal
        else if(stack.temperature / count >= -140) stackedTemperature.style.color = "#4dafa6"; // cold
        else stackedTemperature.style.color = "#4d79af"; // too cold*/

        let metalStack = Util.addDom('div',
        {
            class:'ogl_metal',
            parent:container
        });

        let crystalStack = Util.addDom('div',
        {
            class:'ogl_crystal',
            parent:container
        });

        let deutStack = Util.addDom('div',
        {
            class:'ogl_deut',
            parent:container
        });

        document.querySelectorAll('.smallplanet').forEach(line =>
        {
            const id = line.getAttribute('id').replace('planet-', '');
            const planet = this.ogl.db.myPlanets[id];
            const name = line.querySelector('.planet-name').innerText;
            
            // coords
            let coordDiv = Util.addDom('div',
            {
                parent:container,
                'data-galaxy':planet.coords,
                child:planet.coords
            });

            if(line.getAttribute('data-group')) coordDiv.setAttribute('data-group', line.getAttribute('data-group'));

            // planet picture
            Util.addDom('a', 
            {
                parent:container,
                href:line.querySelector('.planetlink').getAttribute('href'),
                child:Util.addDom('img',
                {
                    src:line.querySelector('.planetPic').getAttribute('src')
                })
            });

            // moon picture
            if(line.querySelector('.moonlink'))
            {
                Util.addDom('a', 
                {
                    parent:container,
                    href:line.querySelector('.moonlink').getAttribute('href'),
                    child:Util.addDom('img',
                    {
                        src:line.querySelector('.moonlink img').getAttribute('src')
                    })
                });
            }
            else
            {
                Util.addDom('div', { class:'ogl_invisible', parent:container });
            }

            // planet name
            Util.addDom('div',
            {
                parent:container,
                child:name
            });

            // planet fields
            Util.addDom('div',
            {
                parent:container,
                child:`${planet.fieldUsed}/${planet.fieldMax} (<span>${planet.fieldMax-planet.fieldUsed}</span>)`
            });

            stack.fieldUsed += planet.fieldUsed;
            stack.fieldMax += planet.fieldMax;
            stack.fieldLeft += (planet.fieldMax-planet.fieldUsed);

            // °C
            let temperature = Util.addDom('div',
            {
                parent:container,
                child:planet.temperature + 40 + '°C'
            });

            stack.temperature += (planet.temperature + 40);

            if(planet.temperature >= 110) temperature.style.color = "#af644d"; // too hot
            else if(planet.temperature>= 10) temperature.style.color = "#af9e4d"; // hot
            else if(planet.temperature >= -40) temperature.style.color = "#4daf67"; // normal
            else if(planet.temperature >= -140) temperature.style.color = "#4dafa6"; // cold
            else temperature.style.color = "#4d79af"; // too cold

            // lieform
            Util.addDom('div',
            {
                class:`ogl_icon ogl_lifeform${planet.lifeform || 0}`,
                parent:container
            });

            // metal mine
            let metal = Util.addDom('div',
            {
                class:'ogl_metal',
                parent:container,
                child:`<strong>${planet[1]}</strong><small>+${Util.formatToUnits(Math.round((planet.prodmetal || 0) * 3600 * 24))}</small>`
            });

            if(planet.upgrades?.['baseBuilding']?.[0]?.id == 1 && serverTime.getTime() < planet.upgrades['baseBuilding'].end) metal.querySelector('strong').innerHTML += `<span>${planet[1]+1}</span>`;

            // crystal mine
            let crystal = Util.addDom('div',
            {
                class:'ogl_crystal',
                parent:container,
                child:`<strong>${planet[2]}</strong><small>+${Util.formatToUnits(Math.round((planet.prodcrystal || 0) * 3600 * 24))}</small>`
            });

            if(planet.upgrades?.['baseBuilding']?.[0]?.id == 2 && serverTime.getTime() < planet.upgrades['baseBuilding'].end) crystal.querySelector('strong').innerHTML += `<span>${planet[2]+1}</span>`;

            // deut mine
            let deut = Util.addDom('div',
            {
                class:'ogl_deut',
                parent:container,
                child:`<strong>${planet[3]}</strong><small>+${Util.formatToUnits(Math.round((planet.proddeut || 0) * 3600 * 24))}</small>`
            });

            stack.metal += planet[1];
            stack.crystal += planet[2];
            stack.deut += planet[3];

            stack.prodmetal += planet.prodmetal || 0;
            stack.prodcrystal += planet.prodcrystal || 0;
            stack.proddeut += planet.proddeut || 0;

            if(planet.upgrades?.['baseBuilding']?.[0]?.id == 3 && serverTime.getTime() < planet.upgrades['baseBuilding'].end) deut.querySelector('strong').innerHTML += `<span>${planet[3]+1}</span>`;
        });

        metalStack.innerHTML = `<strong>${(stack.metal / count).toFixed(1)}</strong><small>+${Util.formatToUnits(Math.round((stack.prodmetal || 0) * 3600 * 24))}</small>`;
        crystalStack.innerHTML = `<strong>${(stack.crystal / count).toFixed(1)}</strong><small>+${Util.formatToUnits(Math.round((stack.prodcrystal || 0) * 3600 * 24))}</small>`;
        deutStack.innerHTML = `<strong>${(stack.deut / count).toFixed(1)}</strong><small>+${Util.formatToUnits(Math.round((stack.proddeut || 0) * 3600 * 24))}</small>`;

        this.ogl._popup.open(container, true);
    }

    openStats()
    {
        Util.runAsync(() => this.ogl._stats.buildStats(false, false)).then(e => this.ogl._popup.open(e, true));
    }

    openSettings(buttonSource)
    {
        const container = Util.addDom('div', {class:'ogl_config', child:'<h2>Settings<i class="material-icons">settings</i></h2>'});

        let subContainer;
        let options =
        [
            'defaultShip', 'defaultMission', 'profileButton',
            'resourceTreshold', 'msu', 'sim', 'useClientTime', 'keyboardActions',
            'showMenuResources', 'tooltipDelay', 'disablePlanetTooltips', 'reduceLargeImages', 'displayPlanetTimers',
            'expeditionValue', 'expeditionRandomSystem', 'expeditionRedirect', 'expeditionBigShips',
            'expeditionShipRatio', 'ignoreExpeShipsLoss', 'ignoreConsumption',
            'displaySpyTable', 'autoCleanReports', 'boardTab',
            'ptreTeamKey', 'ptreLogs',
            'manageData', 'debugMode',
        ];

        options.forEach(opt =>
        {
            const isBoolean = typeof this.ogl.db.options[opt] === typeof true;
            const isNumber = typeof this.ogl.db.options[opt] !== typeof [] && (typeof this.ogl.db.options[opt] === typeof 0 || Number(this.ogl.db.options[opt]));
            //const isString = typeof this.ogl.db.options[opt] === typeof '';

            if(!this.ogl.db.options[opt]) this.ogl.db.options[opt]

            if(opt == 'defaultShip') subContainer = 'fleet';
            else if(opt == 'resourceTreshold') subContainer = 'general';
            else if(opt == 'showMenuResources') subContainer = 'interface';
            else if(opt == 'expeditionValue') subContainer = 'expeditions';
            else if(opt == 'expeditionShipRatio') subContainer = 'stats';
            else if(opt == 'displaySpyTable') subContainer = 'messages';
            else if(opt == 'ptreTeamKey') subContainer = 'PTRE';
            else if(opt == 'manageData') subContainer = 'data';

            let currentContainer;

            if(!container.querySelector(`[data-container="${subContainer}"]`))
            {
                currentContainer = Util.addDom('div', { parent:container, 'data-container':subContainer });
                if(this.ogl.db.configState[subContainer]) currentContainer.classList.add('ogl_active');
                Util.addDom('h3', { parent:currentContainer, child:subContainer, onclick:() =>
                {
                    if(currentContainer.classList.contains('ogl_active'))
                    {
                        currentContainer.classList.remove('ogl_active');
                        this.ogl.db.configState[currentContainer.getAttribute('data-container')] = false;
                    }
                    else
                    {
                        currentContainer.classList.add('ogl_active');
                        this.ogl.db.configState[currentContainer.getAttribute('data-container')] = true;
                    }
                }});
            }
            else
            {
                currentContainer = container.querySelector(`[data-container="${subContainer}"]`);
            }

            const label = Util.addDom('label', { parent:currentContainer, 'data-label':`${this.ogl._lang.find(opt)}` });
            const tooltip = this.ogl._lang.find(opt+'TT');

            if(tooltip != 'TEXT_NOT_FOUND')
            {
                label.classList.add('tooltipLeft');
                label.setAttribute('title', tooltip);
            }

            if(opt == 'defaultShip')
            {
                this.ogl.fretShips.forEach(shipID =>
                {
                    let div = Util.addDom('div', {parent:label, class:`ogl_icon ogl_${shipID}`, onclick:(event, element) =>
                    {
                        this.ogl.db.options.defaultShip = shipID;
                        label.querySelector('.ogl_active')?.classList.remove('ogl_active');
                        element.classList.add('ogl_active');
        
                        if(this.ogl.page == 'fleetdispatch')
                        {
                            document.querySelectorAll('.ogl_fav').forEach(e => e.remove());
                            Util.addDom('div', { class:'material-icons ogl_fav', child:'star', parent:document.querySelector(`[data-technology="${this.ogl.db.options.defaultShip}"] .ogl_shipFlag`) });
                        }
                    }});
        
                    if(this.ogl.db.options.defaultShip == shipID) div.classList.add('ogl_active');
                });
            }
            else if(opt == 'defaultMission')
            {
                [3, 4].forEach(missionID =>
                {
                    let div = Util.addDom('div', {parent:label, class:`ogl_icon ogl_mission${missionID}`, onclick:(event, element) =>
                    {
                        this.ogl.db.options.defaultMission = missionID;
                        label.querySelector('.ogl_active')?.classList.remove('ogl_active');
                        element.classList.add('ogl_active');
                    }});
        
                    if(this.ogl.db.options.defaultMission == missionID) div.classList.add('ogl_active');
                });
            }
            else if(opt == 'profileButton')
            {
                label.innerHTML = `<button class="material-icons">transit_enterexit</button>`;

                label.querySelector('button').addEventListener('click', () =>
                {
                    Util.runAsync(() => this.ogl._ui.openFleetProfile()).then(e => this.ogl._popup.open(e));
                });
            }
            else if(opt == 'msu')
            {
                label.classList.add('tooltipLeft');
                label.setAttribute('title', 'Format:<br>metal:crystal:deut');

                const input = Util.addDom('input', { type:'text', placeholder:'m:c:d', value:this.ogl.db.options[opt], parent:label,
                oninput:() =>
                {
                    if(input.value && !/^[0-9]*[.]?[0-9]+:[0-9]*[.]?[0-9]+:[0-9]*[.]?[0-9]+$/.test(input.value))
                    {
                        input.classList.add('ogl_danger');
                    }
                    else
                    {
                        input.classList.remove('ogl_danger');
                        this.ogl.db.options[opt] = input.value.match(/^[0-9]*[.]?[0-9]+:[0-9]*[.]?[0-9]+:[0-9]*[.]?[0-9]+$/)[0];
                    }
                }});
            }
            else if(opt == 'showMenuResources')
            {
                label.innerHTML = ``;
                const select = Util.addDom('select', { parent:label, onchange:() =>
                {
                    this.ogl.db.options[opt] = parseInt(select.value);
                    localStorage.setItem('ogl_menulayout', this.ogl.db.options[opt]);
                    document.body.setAttribute('data-menulayout', select.value);
                }});

                ['All', 'Coords', 'Resources'].forEach((entry, index) =>
                {
                    const selectOption = Util.addDom('option', { parent:select, child:entry, value:index });
                    if(this.ogl.db.options[opt] == index) selectOption.selected = true;
                });
            }
            else if(isBoolean && opt != 'sim')
            {
                if(opt == 'boardTab' && this.ogl.server.lang != 'fr') { label.remove(); return; }

                const input = Util.addDom('input', { type:'checkbox', parent:label, onclick:() =>
                {
                    this.ogl.db.options[opt] = !this.ogl.db.options[opt];
                    input.checked = this.ogl.db.options[opt];

                    if (opt == 'ignoreExpeShipsLoss' && this.ogl.db.options.displayMiniStats)
                    {
                        this.ogl._stats.miniStats();
                    }
                    else if (opt == 'ignoreConsumption' && this.ogl.db.options.displayMiniStats)
                    {
                        this.ogl._stats.miniStats();
                    }
                    else if(opt == 'displayPlanetTimers')
                    {
                        document.querySelector('#planetList').classList.toggle('ogl_alt')
                    }
                    else if(opt == 'reduceLargeImages')
                    {
                        localStorage.setItem('ogl_minipics', this.ogl.db.options[opt]);
                        document.body.setAttribute('data-minipics', this.ogl.db.options[opt]);
                    }
                }});

                if(this.ogl.db.options[opt]) input.checked = true;
            }
            else if(isNumber)
            {
                const input = Util.addDom('input', { class:'ogl_inputCheck', type:'text', value:this.ogl.db.options[opt], parent:label, oninput:() =>
                {
                    setTimeout(() =>
                    {
                        if(opt == 'expeditionShipRatio') // min & max
                        {
                            if(parseInt(input.value.replace(/\D/g, '')) < 0) input.value = 0;
                            else if(parseInt(input.value.replace(/\D/g, '')) > 100) input.value = 100;
                        }

                        this.ogl.db.options[opt] = (parseInt(input.value.replace(/\D/g, '')) || false);

                        if(opt == 'expeditionShipRatio') this.ogl._stats.miniStats();
                    }, 200);
                }});

                if(opt == 'expeditionValue')
                {
                    input.classList.add('ogl_placeholder');
                    input.setAttribute('placeholder', `(${Util.formatNumber(this.ogl.calcExpeditionMax().max)})`);
                }

                //Util.formatInput(input);
            }
            else if(opt == 'keyboardActions')
            {
                label.innerHTML = `<button class="material-icons">keyboard_alt</button>`;
                label.querySelector('button').addEventListener('click', () =>
                {
                    Util.runAsync(() => this.ogl._ui.openKeyboardActions()).then(e => this.ogl._popup.open(e));
                });
            }
            else if(opt == 'sim')
            {
                label.innerHTML = ``;
                const select = Util.addDom('select', { parent:label, child:'<option value="false" selected disabled>-</option>', onchange:() =>
                {
                    this.ogl.db.options[opt] = select.value;
                }});

                Object.entries(Util.simList).forEach(entry =>
                {
                    const selectOption = Util.addDom('option', { parent:select, child:entry[0], value:entry[0] });
                    if(this.ogl.db.options[opt] == entry[0]) selectOption.selected = true;
                });
            }
            else if(opt == 'expeditionBigShips')
            {
                label.innerHTML = `<button class="material-icons">rocket</button>`;
                label.querySelector('button').addEventListener('click', () =>
                {
                    Util.runAsync(() => this.ogl._ui.openExpeditionFiller()).then(e => this.ogl._popup.open(e));
                });
            }
            else if(opt == 'displayMiniStats')
            {
                label.innerHTML = `<div class="ogl_choice" data-limiter="day">D</div><div class="ogl_choice" data-limiter="week">W</div><div class="ogl_choice" data-limiter="month">M</div>`;

                label.querySelectorAll('div').forEach(button =>
                {
                    button.addEventListener('click', () =>
                    {
                        this.ogl.db.options[opt] = button.getAttribute('data-limiter');
                        this.ogl._stats.miniStats();

                        label.querySelector('.ogl_active') && label.querySelector('.ogl_active').classList.remove('ogl_active');
                        button.classList.add('ogl_active');
                    });

                    if(button.getAttribute('data-limiter') == this.ogl.db.options[opt])
                    {
                        button.classList.add('ogl_active');
                    }
                });
            }
            else if(opt == 'ptreTeamKey')
            {
                label.classList.add('tooltipLeft');
                label.setAttribute('title', 'Format:<br>TM-XXXX-XXXX-XXXX-XXXX');

                const input = Util.addDom('input', { type:'password', placeholder:'TM-XXXX-XXXX-XXXX-XXXX', value:localStorage.getItem('ogl-ptreTK') || '', parent:label,
                oninput:() =>
                {
                    if(input.value && (input.value.replace(/-/g, '').length != 18 || input.value.indexOf('TM') != 0))
                    {
                        input.classList.add('ogl_danger');
                    }
                    else
                    {
                        input.classList.remove('ogl_danger');
                        localStorage.setItem('ogl-ptreTK', input.value);
                        this.ogl.ptreKey = input.value;
                    }
                },
                onfocus:() => input.type = 'text',
                onblur:() => input.type = 'password'
                });
            }
            else if(opt == 'ptreLogs')
            {
                label.innerHTML = `<button class="material-icons">bug</button>`;
                label.querySelector('button').addEventListener('click', () =>
                {
                    PTRE.displayLogs();
                });
            }
            else if(opt == 'manageData')
            {
                label.innerHTML = `<button class="material-icons">database</button>`;
                label.querySelector('button').addEventListener('click', () =>
                {
                    Util.runAsync(() => this.ogl._ui.openDataManager()).then(e => this.ogl._popup.open(e));
                });
            }
        });

        this.ogl._ui.openSide(container, 'settings', buttonSource);
    }

    openPinned(buttonSource)
    {
        this.ogl._ui.openSide(Util.addDom('div', { class:'ogl_loading' }), 'pinned', buttonSource);

        Util.runAsync(() =>
        {
            const container = Util.addDom('div', {class:'ogl_pinned', child:'<h2>Pinned players<i class="material-icons">push_pin</i></h2>'});

            const tabs = Util.addDom('div', { class:'ogl_tabs ogl_flagSelector material-icons', parent:container });
            const list = Util.addDom('div', { class:'ogl_list', parent:container });

            this.ogl.flagsList.forEach(pin =>
            {
                if(pin != 'none')
                {
                    const tab = Util.addDom('div', { parent:tabs, 'data-flag':pin, onclick:() =>
                    {
                        list.innerText = '';
                        tabs.querySelector('[data-flag].ogl_active')?.classList.remove('ogl_active');
                        tab.classList.add('ogl_active');

                        this.ogl.db.lastPinTab = pin;

                        if(pin == 'ptre' && this.ogl.ptreKey)
                        {
                            const actionList = Util.addDom('div', { class:'ogl_grid', parent:list });

                            Util.addDom('button', { class:'ogl_button', child:this.ogl._lang.find('ptreSyncTarget'), parent:actionList, onclick:() =>
                            {
                                PTRE.syncTargetList();
                            }});

                            Util.addDom('button', { class:'ogl_button', child:this.ogl._lang.find('ptreManageTarget'), parent:actionList, onclick:() =>
                            {
                                window.open(PTRE.manageSyncedListUrl, '_blank');
                            }})

                            Util.addDom('hr', { parent:list });
                        }

                        Object.values(this.ogl.db.udb).filter(u => u.pin == this.ogl.db.lastPinTab).forEach(player =>
                        {
                            if(player.uid)
                            {
                                this.addPinnedItemToList(player, list);
                            }
                        });

                        if(!list.querySelector('[data-uid]') && !list.querySelector('.ogl_button')) list.innerHTML = `<p class="ogl_emptyList">${this.ogl._lang.find('emptyPlayerList')}</p>`;
                    }});

                    if(pin == this.ogl.db.lastPinTab)
                    {
                        tab.click();
                    }
                }
            });

            const recentTab = Util.addDom('div', { 'data-flag':'recent', parent:tabs, onclick:() =>
            {
                this.ogl.db.lastPinTab = 'recent';

                list.innerText = '';
                tabs.querySelector('[data-flag].ogl_active')?.classList.remove('ogl_active');
                recentTab.classList.add('ogl_active');

                this.ogl.db.lastPinnedList.forEach(id =>
                {
                    const player = this.ogl.db.udb[id];

                    if(player.uid)
                    {
                        this.addPinnedItemToList(player, list);
                    }
                });

                if(!list.querySelector('[data-uid]')) list.innerText = this.ogl._lang.find('emptyPlayerList');
            }});

            if(this.ogl.db.lastPinTab == 'recent')
            {
                recentTab.click();
            }

            return container;
        })
        .then(container => this.ogl._ui.openSide(container, 'pinned', buttonSource));
    }

    addPinnedItemToList(player, list)
    {
        const item = Util.addDom('div', { parent:list });

        const playerDiv = Util.addDom('span',
        {
            class:`tooltipLeft tooltipClose tooltipUpdate ${player.status || 'status_abbr_active'}`,
            parent:item,
            child:typeof player.name == typeof '' ? player.name : '?',
        });

        this.ogl._ui.turnIntoPlayerLink(player.uid, playerDiv);

        const page = Math.max(1, Math.ceil((player.score?.globalRanking || 100) / 100));
        const rankLink = Util.addDom('a', { class:'ogl_ranking', href:`https://${window.location.host}/game/index.php?page=highscore&site=${page}&searchRelId=${player.uid}`, child:'#'+player.score?.globalRanking || '?' });

        Util.addDom('div', { parent:item, child:rankLink.outerHTML });
        this.ogl._ui.addPinButton(item, player.uid);

        Util.addDom('i', { class:'material-icons', parent:item, child:'delete', onclick:() =>
        {
            this.ogl.db.lastPinnedList.splice(this.ogl.db.lastPinnedList.findIndex(e => e == player.uid), 1);
            item.remove();
            delete this.ogl.db.udb[player.uid].pin;
        }});
    }

    openPinnedDetail(id, update)
    {
        id = parseInt(id);

        this.ogl._ui.openSide(Util.addDom('div', { class:'ogl_loading' }), id);

        const updateSide = () =>
        {
            const player = this.ogl.db.udb[id];
            if(!player) return;
    
            const container = Util.addDom('div', { class:'ogl_pinDetail' });
    
            Util.addDom('div', { parent:container, class:'material-icons ogl_back', child:'arrow_back', onclick:() => { this.openPinned() } })
            const title = Util.addDom('h2', { class:player.status || 'status_abbr_active', parent:container, child:player.name });
            const score = Util.addDom('div', { class:'ogl_score', parent:container });
            const actions = Util.addDom('div', { class:'ogl_actions', parent:container });
            const list = Util.addDom('div', { class:'ogl_list', parent:container });

            this.ogl._ui.addPinButton(title, id);

            // write
            const writeIcon = Util.addDom('div', { child:'edit', class:'material-icons ogl_button', parent:actions, onclick:() =>
            {
                if(!document.querySelector('#chatBar'))
                {
                    window.location.href = `https://${window.location.host}/game/index.php?page=chat&playerId=${id}`;
                }
            }});

            if(document.querySelector('#chatBar'))
            {
                writeIcon.classList.add('js_openChat');
                writeIcon.setAttribute('data-playerId', id);
            }

            // buddy
            Util.addDom('a', { child:'account-plus', class:'material-icons ogl_button overlay', parent:container.querySelector('.ogl_actions'), href:`https://${window.location.host}/game/index.php?page=ingame&component=buddies&action=7&id=${id}&ajax=1`, onclick:() =>
            {
                this.ogl._tooltip.close();
            }});
            
            // ignore
            Util.addDom('div', { child:'block', class:'material-icons ogl_button', parent:actions, onclick:() =>
            {
                window.location.href = `https://${window.location.host}/game/index.php?page=ignorelist&action=1&id=${id}`;
            }});

            // mmorpgstat
            Util.addDom('div', { child:'query_stats', class:'material-icons ogl_button', parent:actions, onclick:() =>
            {
                window.open(Util.genMmorpgstatLink(id), '_blank');
            }});

            // ptre get player info
            Util.addDom('div', { child:'ptre', class:'material-icons ogl_button', parent:actions, onclick:() =>
            {
                PTRE.getPlayerInfo({ name:player.name, id:id });
            }});

            Util.addDom('div', { child:'sync', class:'material-icons ogl_button', parent:actions, onclick:() =>
            {
                PTRE.getPlayerPositions({ name:player.name, id:id });
            }});
    
            this.ogl.db.lastPinnedList = Array.from(new Set([id, ...this.ogl.db.lastPinnedList].map(Number)));
            if(this.ogl.db.lastPinnedList.length > 30) this.ogl.db.lastPinnedList.length = 30;

            if(!update)
            {
                Util.addDom('div', { class:'ogl_loading', parent:container });
                this.ogl._ui.openSide(container, id);
                PTRE.getPlayerPositions({ name:player.name, id:id }); // includes _fetch.fetchPlayerAPI()
            }
    
            const page = Math.max(1, Math.ceil((player.score?.globalRanking || 100) / 100));
            const rankLink = Util.addDom('a', { class:'ogl_ranking', href:`https://${window.location.host}/game/index.php?page=highscore&site=${page}&searchRelId=${player.uid}`, child:'#'+player.score?.globalRanking || '?' });

            title.innerHTML = `${player.name} ${rankLink.outerHTML}`;

            this.ogl._ui.addPinButton(title, id);
            
            score.innerHTML =
            `
                <div class="ogl_line"><i class="material-icons">trending_up</i><div>${Util.formatNumber(player.score?.global)}</div></div>
                <div class="ogl_line"><i class="material-icons">diamond</i><div>${Util.formatNumber(player.score?.economy)}</div></div>
                <div class="ogl_line"><i class="material-icons">science</i><div>${Util.formatNumber(player.score?.research)}</div></div>
                <div class="ogl_line"><i class="material-icons">genetics</i><div>${Util.formatNumber(player.score?.lifeform)}</div></div>
                <div class="ogl_line"><i class="material-icons">rocket_launch</i><div>${Util.formatNumber(Util.getPlayerScoreFD(player.score, 'fleet'))}</div></div>
                <div class="ogl_line"><i class="material-icons">security</i><div>${Util.formatNumber(Util.getPlayerScoreFD(player.score, 'defense'))}</div></div>
            `;

            let lastCoords = 0;
            let group = 1;
            let index = 1;

            player.planets.sort((a, b) => Util.coordsToID(a) - Util.coordsToID(b)).forEach((planetID) =>
            {
                const planet = this.ogl.db.pdb[planetID];

                if(!planet) return;

                const date = new Date(planet.api);
                const dateDiff = Math.floor((serverTime.getTime() - date) / (1000 * 3600 * 24));
                const hourDiff = Math.round(((serverTime.getTime() - date % 86400000) % 3600000) / 60000);
                const line = Util.addDom('div', { parent:list });

                if(planet.home) line.classList.add('ogl_home');

                let newCoords = Util.coordsToID(planet.coo).slice(0, -3);
                if(lastCoords === newCoords) line.setAttribute('data-group', group);
                else if(line.previousElementSibling?.getAttribute('data-group')) group++;
                lastCoords = newCoords;

                Util.addDom('div', { child:index, parent:line });
                Util.addDom('div', { child:planet.coo, parent:line, 'data-galaxy':planet.coo });
                Util.addDom('div', { class:'tooltip', 'data-title':'Debris<br>'+Util.formatNumber(planet.debris || 0), child:Util.formatToUnits(planet.debris || 0), parent:line });

                this.ogl._ui.addSpyIcons(line, planet.coo.split(':'), false, true);

                let ageStr = !dateDiff && dateDiff !== 0 ? '?' : dateDiff > 0 ? `${dateDiff}${LocalizationStrings.timeunits.short.hour} ago` : `${hourDiff}${LocalizationStrings.timeunits.short.minute} ago`;

                const dateDiv = Util.addDom('date', { class:'tooltipLeft', child:ageStr, 'data-title':`<span>${date.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'})}</span> <span>${date.toLocaleTimeString('de-DE')}</span>`, parent:line });
                if(dateDiff >= 5) dateDiv.classList.add('ogl_danger');
                else if(dateDiff >= 3) dateDiv.classList.add('ogl_warning');

                index += 1;

                //Util.addDom('date', { child:`<span>${date.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'})}</span><span>${date.toLocaleTimeString('de-DE')}</span>`, parent:line });
            });

            this.ogl._ui.openSide(container, id);
            setTimeout(() => this.ogl._shortcut.load(), 50);

            this.ogl._galaxy.checkCurrentSystem();
        }

        Util.runAsync(() =>
        {
            this.ogl._fetch.fetchPlayerAPI(id, false, () => updateSide());
        });
    }

    openTagged(buttonSource)
    {
        this.ogl._ui.openSide(Util.addDom('div', { class:'ogl_loading' }), 'tagged');

        Util.runAsync(() =>
        {
            const container = Util.addDom('div', {class:'ogl_tagged', child:'<h2>Tagged planets<i class="material-icons">stroke_full</i></h2>'});
            const tabs = Util.addDom('div', { class:'ogl_tabs ogl_tagSelector material-icons', parent:container });
            const inputs = Util.addDom('div', { class:'ogl_actions', parent:container });
            Util.addDom('hr', { parent:container });
            const list = Util.addDom('div', { class:'ogl_list', parent:container, child:'<p class="ogl_emptyList">Select a galaxy/system range</p>' });

            const buildList = () =>
            {
                const start = Util.coordsToID(`${gStart.value}:${sStart.value}:000`);
                const end = Util.coordsToID(`${gEnd.value}:${sEnd.value}:000`);

                const items = this.getTaggedItems(start, end);
                list.innerText = '';

                if(items.length < 1)
                {
                    Util.addDom('p', { child:'No result', parent:list } );
                }
                else
                {
                    /*Util.addDom('button', { class:'ogl_button', child:'Use as quick raid list', parent:list, onclick:() =>
                    {
                        this.ogl.db.quickRaidList = this.tmpRaidList;
                        this.ogl._notification.addToQueue(`You can now use [${this.ogl.db.options.keyboardActions.quickRaid}] on the fleet page to use this list`, true);
                        setTimeout(() => this.ogl._shortcut.load(), 50);
                    }});*/

                    let nextTargetFound = false;
                    let newList = [];
        
                    items.forEach((item, index) =>
                    {
                        const coords = item.match(/.{1,3}/g).map(Number).join(':');
                        const coordsID = Util.coordsToID(coords);

                        const line = Util.addDom('div', { parent:list });
                        Util.addDom('div', { child:index+1, parent:line });
                        Util.addDom('div', { child:coords, 'data-galaxy':coords, parent:line});
                        const target = Util.addDom('div', { class:'material-icons tooltip ogl_nextQuickTarget', 'data-title':'Select as next quick raid target', child:'swords', parent:line, onclick:() =>
                        {
                            const start = Util.coordsToID(coords);
                            const end = Util.coordsToID(`${gEnd.value}:${sEnd.value}:000`);
                            this.getTaggedItems(start, end, true);

                            this.ogl.db.quickRaidList = this.tmpRaidList;
                            this.ogl._notification.addToQueue(`You can now use [${this.ogl.db.options.keyboardActions.quickRaid}] on fleet page to attack next target`, true);
                            setTimeout(() => this.ogl._shortcut.load(), 50);

                            list.querySelectorAll('.ogl_nextQuickTarget.ogl_active').forEach(e => e.classList.remove('ogl_active'));
                            target.classList.add('ogl_active');
                        }});

                        if(this.ogl.db.quickRaidList && this.ogl.db.quickRaidList?.[0] == coordsID)
                        {
                            target.classList.add('ogl_active');
                            nextTargetFound = true;
                        }

                        if(nextTargetFound) newList.push(coordsID);
        
                        this.ogl._ui.addSpyIcons(line, coords);
                        this.ogl._ui.addTagButton(line, coords);
                    });

                    this.ogl.db.quickRaidList = nextTargetFound ? newList : [];
                }
            }

            Object.keys(this.ogl.db.tags).forEach(tag =>
            {
                if(tag != 'none')
                {
                    const tab = Util.addDom('div', { parent:tabs, 'data-tag':tag, onclick:() =>
                    {
                        if(this.ogl.db.tags[tag])
                        {
                            this.ogl.db.tags[tag] = false;
                            tab.classList.add('ogl_off');
                        }
                        else
                        {
                            this.ogl.db.tags[tag] = true;
                            tab.classList.remove('ogl_off');
                        }
                    }});

                    if(!this.ogl.db.tags[tag]) tab.classList.add('ogl_off');
                }
            });

            const currentCoords = this.ogl.currentPlanet.obj.coords.split(':');

            const gStart = Util.addDom('input', { type:'text', min:'1', max:'10', parent:inputs, value:this.ogl.db.lastTaggedInput[0] || currentCoords[0], onblur:e => e.target.value = e.target.value || 1, oninput:() => saveInput() });
            const sStart = Util.addDom('input', { type:'text', min:'1', max:'499', parent:inputs, value:this.ogl.db.lastTaggedInput[1] || currentCoords[1], onblur:e => e.target.value = e.target.value || 1, oninput:() => saveInput() });
            Util.addDom('div', { class:'material-icons', child:'arrow_right_alt', parent:inputs });
            const gEnd = Util.addDom('input', { type:'text', min:'1', max:'10', parent:inputs, value:this.ogl.db.lastTaggedInput[2] || 1, onblur:e => e.target.value = e.target.value || 1, oninput:() => saveInput() });
            const sEnd = Util.addDom('input', { type:'text', min:'1', max:'499', parent:inputs, value:this.ogl.db.lastTaggedInput[3] || 1, onblur:e => e.target.value = e.target.value || 1, oninput:() => saveInput() });
            const ignoreNoobButton = Util.addDom('label', { class:'status_abbr_noob', parent:inputs, child:this.ogl._lang.find('noob')+'<input class="ogl_hidden" type="checkbox">', onclick:() =>
            {
                setTimeout(() =>
                {
                    this.ogl.db.lastTaggedInput[4] = ignoreNoobButton.querySelector('input').checked;
                    this.ogl.db.lastTaggedInput[4] ? ignoreNoobButton.classList.remove('ogl_off') : ignoreNoobButton.classList.add('ogl_off');
                    buildList();
                }, 50);
            }});
            const ignoreVacationButton = Util.addDom('label', { class:'status_abbr_vacation', parent:inputs, child:this.ogl._lang.find('vacation')+'<input class="ogl_hidden" type="checkbox">', onclick:() =>
            {
                setTimeout(() =>
                {
                    this.ogl.db.lastTaggedInput[5] = ignoreVacationButton.querySelector('input').checked;
                    this.ogl.db.lastTaggedInput[5] ? ignoreVacationButton.classList.remove('ogl_off') : ignoreVacationButton.classList.add('ogl_off');
                    buildList();
                }, 50);
            }});
            Util.addDom('div', { class:'material-icons ogl_button', parent:inputs, child:'search', onclick:() => buildList() });

            if(this.ogl.db.lastTaggedInput[0] && this.ogl.db.lastTaggedInput[1] && this.ogl.db.lastTaggedInput[2] && this.ogl.db.lastTaggedInput[3]) buildList();

            if(!this.ogl.db.lastTaggedInput[4]) ignoreNoobButton.classList.add('ogl_off');
            else ignoreNoobButton.querySelector('input').checked = true;
            if(!this.ogl.db.lastTaggedInput[5]) ignoreVacationButton.classList.add('ogl_off');
            else ignoreVacationButton.querySelector('input').checked = true;

            const saveInput = () =>
            {
                if(this.timeout) clearTimeout(this.timeout);

                this.ogl.db.lastTaggedInput[0] = gStart.value;
                this.ogl.db.lastTaggedInput[1] = sStart.value;
                this.ogl.db.lastTaggedInput[2] = gEnd.value;
                this.ogl.db.lastTaggedInput[3] = sEnd.value;
            }

            return container;
        }).then(container => this.ogl._ui.openSide(container, 'tagged', buttonSource));
    }

    getTaggedItems(rawStart, rawEnd, newFlag)
    {
        rawStart = parseInt(rawStart);
        rawEnd = parseInt(rawEnd);
        
        const displayNoob = this.ogl.db.lastTaggedInput[4];
        const displayVacation = this.ogl.db.lastTaggedInput[5];

        if(!newFlag)
        {
            if(rawStart <= rawEnd) rawEnd += 15;
            else rawStart += 15;
        }

        this.tmpRaidList = Object.keys(this.ogl.db.tdb).sort((a, b) => rawStart <= rawEnd ? a-b : b-a).filter(position =>
        {
            const coords = position.match(/.{1,3}/g).map(Number).join(':');
            const status = this.ogl.db.udb[this.ogl.db.pdb[coords]?.uid]?.status;

            return this.ogl.db.tags[this.ogl.db.tdb[position].tag]
            && (rawStart <= rawEnd ? position >= rawStart && position <= rawEnd : position <= rawStart && position >= rawEnd)
            && (displayNoob || !status || (!displayNoob && status?.indexOf('noob') < 0))
            && (displayVacation || !status || (!displayVacation && (status?.indexOf('vacation') < 0 && status?.indexOf('banned') < 0)))
        });

        return this.tmpRaidList;
    }
    
    checkUpgrade()
    {
        this.PlanetBuildingtooltip = this.PlanetBuildingtooltip || {};

        document.querySelectorAll('.planetlink, .moonlink').forEach(planet =>
        {
            if(planet.querySelector('.ogl_buildIconList')) planet.querySelector('.ogl_buildIconList').innerText = '';

            const urlParams = new URLSearchParams(planet.getAttribute('href'));
            const id = urlParams.get('cp').split('#')[0];
            const isMoon = planet.classList.contains('moonlink');

            this.PlanetBuildingtooltip[id] = Util.addDom('ul', { class:'ogl_buildList' });

            let hasBaseBuilding = false;
            let hasBaseShip = false;
            let hasLFBuilding = false;

            this.ogl.db.myPlanets[id] = this.ogl.db.myPlanets[id] || {};

            Object.values(this.ogl.db.myPlanets[id].upgrades || {}).forEach(upgradeType =>
            {
                let ready = false;

                if(upgradeType?.id) return; // clear old beta data

                upgradeType.forEach(upgrade =>
                {
                    if(serverTime.getTime() < upgrade.end)
                    {
                        if(!ready)
                        {
                            ready = true;

                            const name = this.ogl.db.serverData[upgrade.id] || upgrade.id;
                            Util.addDom('li', { parent:this.PlanetBuildingtooltip[id], child:`<i class="material-icons">fiber_manual_record</i><span class="ogl_slidingText" data-text="${name}"></span><i class="material-icons">east</i><b>${upgrade.lvl}</b>` });
                        
                            if(upgrade.type == 'baseBuilding' || upgrade.type == 'baseResearch') hasBaseBuilding = true;
                            else if(upgrade.type == 'ship' || upgrade.type == 'def') hasBaseShip = true;
                            else if(upgrade.type == 'lfBuilding' || upgrade.type == 'lfResearch') hasLFBuilding = true;
                        }
                    }
                });
            });

            const parent = Util.addDom('div', { class:'ogl_buildIconList', parent:planet });

            if(hasBaseBuilding)
            {
                Util.addDom('div', { class:'ogl_buildIcon material-icons', child:'stat_0', parent:parent });
            }

            if(hasBaseShip)
            {
                Util.addDom('div', { class:'ogl_buildIcon ogl_baseShip material-icons', child:'stat_0', parent:parent });
            }

            if(hasLFBuilding)
            {
                Util.addDom('div', { class:'ogl_buildIcon ogl_lfBuilding material-icons', child:'stat_0', parent:parent });
            }
        });
    }
}


class FleetManager extends Manager
{
    load()
    {
        this.spyReady = true;
        this.validationReady = true;
        this.spyInterval;

        this.updateSpyFunctions();

        if(this.ogl.page == 'fleetdispatch')
        {
            this.totalCapacity = 0;
            this.capacityWrapper = Util.addDom('div', { 'class':'capacityProgress', parent:document.querySelector('#fleet1 .content'), onclick:() => document.querySelector(`.ogl_requiredShips .ogl_${this.ogl.db.options.defaultShip}`).click() });
            this.capacityBar = Util.addDom('progress', { 'data-capacity':'', max:100, value:0, parent:this.capacityWrapper });

            this.resOnPlanet = { metal:'metalOnPlanet', crystal:'crystalOnPlanet', deut:'deuteriumOnPlanet', food:'foodOnPlanet' };
            this.cargo = { metal:'cargoMetal', crystal:'cargoCrystal', deut:'cargoDeuterium', food:'cargoFood' };

            this.initialTarget = JSON.parse(JSON.stringify(targetPlanet));

            // wait for fleetDispatcher to be ready
            let initInterval = setInterval(() =>
            {
                if(unsafeWindow.fleetDispatcher)
                {
                    // initialize realTarget
                    this.setRealTarget(this.initialTarget);

                    // get initial resources / ships on planet
                    this.initialResOnPlanet = { metal:fleetDispatcher.metalOnPlanet, crystal:fleetDispatcher.crystalOnPlanet, deut:fleetDispatcher.deuteriumOnPlanet, food:fleetDispatcher.foodOnPlanet };
                    this.initialShipsOnPlanet = JSON.parse(JSON.stringify(fleetDispatcher.shipsOnPlanet));

                    /// overwrite default methods
                    if(!this.overwrited) this.overwrite();

                    if(!fleetDispatcher.fetchTargetPlayerDataTimeout)
                    {
                        // force shipsData fetch (can happen when the server is laggy)
                        if(!unsafeWindow.shipsData || !fleetDispatcher?.fleetHelper?.shipsData)
                        {
                            let params = {};
                            fleetDispatcher.appendShipParams(params);
                            fleetDispatcher.appendTargetParams(params);
                            fleetDispatcher.appendTokenParams(params);
                            params.union = fleetDispatcher.union;

                            $.post(fleetDispatcher.checkTargetUrl, params, response =>
                            {
                                let data = JSON.parse(response);
                                fleetDispatcher.fleetHelper.shipsData = data.shipsData;
                                fleetDispatcher.updateToken(data.newAjaxToken);
                                this.init();
                                clearInterval(initInterval);
                            });
                        }
                        else
                        {
                            this.init();
                            clearInterval(initInterval);
                        }
                    }
                }
            }, 50);
        }
    }

    overwrite()
    {
        this.overwrited = true;

        fleetDispatcher.refreshDataAfterAjax = data =>
        {
            fleetDispatcher.setOrders(data.orders);
            
            fleetDispatcher.mission = 0;

            fleetDispatcher.setTargetInhabited(data.targetInhabited);
            fleetDispatcher.setTargetPlayerId(data.targetPlayerId);
            fleetDispatcher.setTargetPlayerName(data.targetPlayerName);
            fleetDispatcher.setTargetIsStrong(data.targetIsStrong);
            fleetDispatcher.setTargetIsOutlaw(data.targetIsOutlaw);
            fleetDispatcher.setTargetIsBuddyOrAllyMember(data.targetIsBuddyOrAllyMember);
            fleetDispatcher.setTargetPlayerColorClass(data.targetPlayerColorClass);
            fleetDispatcher.setTargetPlayerRankIcon(data.targetPlayerRankIcon);
            fleetDispatcher.setPlayerIsOutlaw(data.playerIsOutlaw);

            fleetDispatcher.targetPlanet.galaxy = data.targetPlanet.galaxy;
            fleetDispatcher.targetPlanet.system = data.targetPlanet.system;
            fleetDispatcher.targetPlanet.position = data.targetPlanet.position;
            fleetDispatcher.targetPlanet.type = data.targetPlanet.type;
            fleetDispatcher.targetPlanet.name = data.targetPlanet.name;

            this.setRealTarget(JSON.parse(JSON.stringify(fleetDispatcher.targetPlanet)));

            if(!data.targetOk && this.isQuickRaid)
            {
                this.ogl.db.quickRaidList.shift();
            }

            setTimeout(() =>
            {
                const hasMission = (fleetDispatcher.getAvailableMissions() || []).indexOf(fleetDispatcher.mission) > -1;

                
                if(!hasMission && this.lastMissionOrder && (fleetDispatcher.getAvailableMissions() || []).indexOf(this.lastMissionOrder) > -1)
                {
                    fleetDispatcher.mission = this.lastMissionOrder;
                }
                else if(!hasMission && fleetDispatcher.currentPage == 'fleet2' && (fleetDispatcher.getAvailableMissions() || []).length == 1)
                {
                    fleetDispatcher.mission = fleetDispatcher.getAvailableMissions()[0];
                }
                else if(!hasMission && (fleetDispatcher.getAvailableMissions() || []).indexOf(this.ogl.db.options.defaultMission) > -1)
                {
                    fleetDispatcher.mission = this.ogl.db.options.defaultMission;
                }
                else if(hasMission)
                {
                    fleetDispatcher.mission = this.lastMissionOrder;
                }

                fleetDispatcher.refresh();
            }, 50);
        }

        fleetDispatcher.selectShip = (shipId, number) =>
        {
            let shipsAvailable = fleetDispatcher.getNumberOfShipsOnPlanet(shipId);
            const input = document.querySelector(`[data-technology="${shipId}"] input`);

            if(shipsAvailable === 0 || (number > shipsAvailable && !document.querySelector(`[data-technology="${shipId}"]`)?.classList.contains('ogl_notEnough'))) input?.classList.add('ogl_flashNotEnough');
            else input.classList.remove('ogl_flashNotEnough');
            number = Math.min(shipsAvailable, number);

            if (number <= 0) fleetDispatcher.removeShip(shipId);
            else if (fleetDispatcher.hasShip(shipId)) fleetDispatcher.updateShip(shipId, number);
            else fleetDispatcher.addShip(shipId, number);

            Util.formatInput(input, false, true);
            fleetDispatcher.refresh();
        }

        fleetDispatcher.trySubmitFleet1 = () =>
        {
            if(fleetDispatcher.currentPage != 'fleet1') return;

            fleetDispatcher.targetPlanet = fleetDispatcher.realTarget;

            if(fleetDispatcher.validateFleet1() === false)
            {
                if(this.hasBeenInitialized && fleetDispatcher.shipsToSend.length == 0)
                {
                    document.querySelector(`.ogl_requiredShips .ogl_${this.ogl.db.options.defaultShip}`).click();
                }

                this.validationReady = true;
                return;
            }

            fleetDispatcher.switchToPage('fleet2');
        }

        Util.overWrite('refresh', fleetDispatcher, false, () =>
        {
            /*if(fleetDispatcher.shipsToSend.length > 0) document.body.classList.add('ogl_destinationPicker');
            else if(!document.body.classList.contains('ogl_initHarvest')) document.body.classList.remove('ogl_destinationPicker');*/

            // capacity bar
            let totalResources = fleetDispatcher.metalOnPlanet + fleetDispatcher.crystalOnPlanet + fleetDispatcher.deuteriumOnPlanet + fleetDispatcher.foodOnPlanet;
            this.totalCapacity = this.totalCapacity || 1;

            const percentCapacity = Math.floor((fleetDispatcher.getCargoCapacity() / this.totalCapacity) * 100) || 0;
            const percentResources = Math.floor((fleetDispatcher.getCargoCapacity() / totalResources) * 100) || 0;
            const percentRequired = Math.floor((totalResources / this.totalCapacity) * 100) || 0;

            this.capacityBar.style.setProperty('--capacity', `linear-gradient(to right, #641717, #938108 ${percentRequired * .8}%, #055c54 ${percentRequired}%)`);
            this.capacityWrapper.style.setProperty('--currentCapacityPercent', Math.min(94, percentCapacity)+'%');

            this.capacityWrapper.setAttribute('data-percentResources', Math.min(100, percentResources));
            this.capacityWrapper.setAttribute('data-rawCargo', `${Util.formatNumber(fleetDispatcher.getCargoCapacity())} / ${Util.formatNumber(this.totalCapacity)} - (req. ${Util.formatNumber(totalResources)})`);
            this.capacityBar.setAttribute('max', 100);
            this.capacityBar.setAttribute('value', percentCapacity);

            const apiButton = document.querySelector('.show_fleet_apikey');
            if(apiButton)
            {
                const apiRaw = (apiButton.getAttribute('title') || apiButton.getAttribute('data-title') || apiButton.getAttribute('data-api-code')).match(/coords;[a-zA-Z0-9-:|;]*/);

                if(apiRaw)
                {
                    const api = apiRaw[0];
                    apiButton.setAttribute('data-api-code', api);
                }
            }

            if(this.ogl._time.timeLoop) this.ogl._time.timeLoop(true);
        });

        Util.overWrite('updateTarget', fleetDispatcher, () =>
        {
            document.querySelector('#planetList').classList.add('ogl_notReady');
        });

        // fix undefined "hasEnoughFuel" value
        fleetDispatcher.hasEnoughFuel = () => (this.initialResOnPlanet?.deut || fleetDispatcher.deuteriumOnPlanet) >= fleetDispatcher.getConsumption();

        Util.overWrite('selectMission', fleetDispatcher, false, () =>
        {
            this.lastMissionOrder = fleetDispatcher.mission;
        });

        Util.overWrite('switchToPage', fleetDispatcher, () =>
        {
            if(fleetDispatcher.getFreeCargoSpace() < 0 && fleetDispatcher.cargoFood) { fleetDispatcher.selectMinFood(); fleetDispatcher.selectMaxFood(); }
            if(fleetDispatcher.getFreeCargoSpace() < 0 && fleetDispatcher.cargoMetal) { fleetDispatcher.selectMinMetal(); fleetDispatcher.selectMaxMetal(); }
            if(fleetDispatcher.getFreeCargoSpace() < 0 && fleetDispatcher.cargoCrystal) { fleetDispatcher.selectMinCrystal(); fleetDispatcher.selectMaxCrystal(); }
            if(fleetDispatcher.getFreeCargoSpace() < 0 && fleetDispatcher.cargoDeuterium) { fleetDispatcher.selectMinDeuterium(); fleetDispatcher.selectMaxDeuterium(); }
        }, () =>
        {
            if(fleetDispatcher.currentPage == 'fleet2')
            {
                document.body.classList.add('ogl_destinationPicker');
                fleetDispatcher.focusSendFleet();
            }
            else if(fleetDispatcher.currentPage == 'fleet1')
            {
                document.body.classList.remove('ogl_destinationPicker');
                fleetDispatcher.focusSubmitFleet1();
            }
        });

        Util.overWrite('stopLoading', fleetDispatcher, () =>
        {
            if(fleetDispatcher.currentPage == 'fleet2') this.validationReady = true;
        });

        fleetDispatcher.submitFleet2 = force =>
        {
            if(this.sent) return true;

            this.sent = true;

            if(fleetDispatcher.realTarget)
            {
                fleetDispatcher.targetPlanet.galaxy = fleetDispatcher.realTarget.galaxy;
                fleetDispatcher.targetPlanet.system = fleetDispatcher.realTarget.system;
                fleetDispatcher.targetPlanet.position = fleetDispatcher.realTarget.position;
                fleetDispatcher.targetPlanet.type = fleetDispatcher.realTarget.type;
                fleetDispatcher.targetPlanet.name = fleetDispatcher.realTarget.name;
                fleetDispatcher.refresh();
            }

            if(fleetDispatcher.realSpeedPercent)
            {
                fleetDispatcher.speedPercent = fleetDispatcher.realSpeedPercent;
            }

            force = force || false;

            let self = this;
            let that = fleetDispatcher;
            let params = {};

            if(self.ajaxSuccess) return;

            fleetDispatcher.appendTokenParams(params);
            fleetDispatcher.appendShipParams(params);
            fleetDispatcher.appendTargetParams(params);
            fleetDispatcher.appendCargoParams(params);
            fleetDispatcher.appendPrioParams(params);

            params.mission = fleetDispatcher.mission;
            params.speed = fleetDispatcher.speedPercent;
            params.retreatAfterDefenderRetreat = fleetDispatcher.retreatAfterDefenderRetreat === true ? 1 : 0;
            params.lootFoodOnAttack = fleetDispatcher.lootFoodOnAttack === true ? 1 : 0;
            params.union = fleetDispatcher.union;

            if(force) params.force = force;
            params.holdingtime = fleetDispatcher.getHoldingTime();
            fleetDispatcher.startLoading();

            $.post(fleetDispatcher.sendFleetUrl, params, function(response)
            {
                let data = JSON.parse(response);

                if(data.success === true)
                {
                    fadeBox(data.message, false);
                    $("#sendFleet").removeAttr("disabled");
                    self.fleetSent(data.redirectUrl);
                }
                else
                {
                    setTimeout(() => self.sent = false, 500);

                    if(data.responseArray && data.responseArray.limitReached && !data.responseArray.force)
                    {
                        that.updateToken(data.newAjaxToken || '');
                        errorBoxDecision(that.loca.LOCA_ALL_NETWORK_ATTENTION, that.locadyn.localBashWarning, that.loca.LOCA_ALL_YES, that.loca.LOCA_ALL_NO, function () { that.submitFleet2(true); });
                    }
                    else
                    {
                        that.displayErrors(data.errors);
                        that.updateToken(data.newAjaxToken || '');
                        $("#sendFleet").removeAttr("disabled");
                        that.stopLoading();
                    }
                }
            });
        };

        Util.overWrite('refreshTargetPlanet', fleetDispatcher, () =>
        {
            // update ACS data
            if(fleetDispatcher.union)
            {
                // preselect default mission
                fleetDispatcher.mission = 2;
                fleetDispatcher.refresh();

                const acsEndTime = (Object.values(fleetDispatcher.unions).find(a => a.id == fleetDispatcher.union)?.time || 0) * 1000;
                if(acsEndTime)
                {
                    if(document.querySelector('.ogl_acsInfo')) return;

                    Util.addDom('hr', { prepend:document.querySelector('#fleetBriefingPart1') });
                    const liMax = Util.addDom('li', { class:'ogl_acsInfo', child:'Allowed max. duration:', prepend:document.querySelector('#fleetBriefingPart1') });
                    const liOffset = Util.addDom('li', { class:'ogl_acsInfo', child:'ACS offset:', prepend:document.querySelector('#fleetBriefingPart1') });

                    const spanMax = Util.addDom('span', { class:'ogl_warning value', parent:liMax });
                    const spanOffset = Util.addDom('span', { class:'value', parent:liOffset });

                    clearInterval(this.acsInterval);
                    this.acsInterval = setInterval(() =>
                    {
                        if(!fleetDispatcher.getDuration()) return;

                        const fleetDurationLeft = fleetDispatcher.getDuration() * 1000;
                        const acsDurationLeft = acsEndTime - serverTime.getTime() - timeZoneDiffSeconds * 1000;
                        const acsDurationTreshold = acsDurationLeft * .3; // can't slow down more than 30%
                        const delta = fleetDurationLeft - acsDurationLeft;

                        spanOffset.className = 'value';

                        if(fleetDurationLeft > acsDurationLeft + acsDurationTreshold)
                        {
                            spanOffset.textContent = ` too late`;
                            spanOffset.classList.add('ogl_danger');
                        }
                        else if(fleetDurationLeft > acsDurationLeft)
                        {
                            spanOffset.textContent = ` +${new Date(delta).toISOString().slice(11,19)}`;
                            spanOffset.classList.add('ogl_warning');
                        }
                        else
                        {
                            spanOffset.textContent = ' +00:00:00';
                            spanOffset.classList.add('ogl_ok');
                        }

                        spanMax.textContent = ` ${new Date(acsDurationLeft + acsDurationTreshold).toISOString().slice(11,19)}`;
                    }, 333);
                }
            }

            if(!fleetDispatcher.mission)
            {
                fleetDispatcher.mission = this.ogl.db.options.defaultMission;
                fleetDispatcher.refresh();
            }
        });
    }

    init()
    {
        this.isReady = true;

        document.querySelector('.planetlink.active, .moonlink.active')?.classList.add('ogl_disabled');

        // preselect related planet/moon
        if(JSON.stringify(fleetDispatcher.realTarget) == JSON.stringify(fleetDispatcher.currentPlanet))
        {
            this.setRealTarget(fleetDispatcher.realTarget, { type:fleetDispatcher.realTarget.type == 1 ? 3 : 1 });
        }
        
        this.addLimiters();

        if(this.ogl.mode === 1 || this.ogl.mode === 2 || this.ogl.mode === 5)
        {
            this.prepareRedirection();
        }
        else if(this.ogl.mode === 3 && this.ogl.cache.toSend)
        {
            let cumul = 0;
            let curmulRes = [0,0,0];
            let max = 0;
            let maxRes = [0, 0, 0];

            this.ogl.cache.toSend.forEach(build =>
            {
                curmulRes[0] = curmulRes[0] + build.cost.metal;
                curmulRes[1] = curmulRes[1] + build.cost.crystal;
                curmulRes[2] = curmulRes[2] + build.cost.deut;
            });
            
            maxRes[0] = Math.min(fleetDispatcher.metalOnPlanet, curmulRes[0]);
            maxRes[1] = Math.min(fleetDispatcher.crystalOnPlanet, curmulRes[1]);
            maxRes[2] = Math.min(fleetDispatcher.deuteriumOnPlanet, curmulRes[2]);

            max = maxRes[0] + maxRes[1] + maxRes[2];

            let urlParams = new URLSearchParams(window.location.search);

            if(urlParams.get('substractMode') && urlParams.get('targetid'))
            {
                const targetID = urlParams.get('targetid');
                curmulRes[0] = Math.max(curmulRes[0] - (this.ogl.db.myPlanets[targetID]?.metal || 0), 0);
                curmulRes[1] = Math.max(curmulRes[1] - (this.ogl.db.myPlanets[targetID]?.crystal || 0), 0);
                curmulRes[2] = Math.max(curmulRes[2] - (this.ogl.db.myPlanets[targetID]?.deut || 0), 0);
            }

            cumul = curmulRes[0] + curmulRes[1] + curmulRes[2];

            fleetDispatcher.selectShip(this.ogl.db.options.defaultShip, this.shipsForResources(this.ogl.db.options.defaultShip, Math.min(cumul, max)));

            if(fleetDispatcher.shipsToSend.length > 0)
            {
                fleetDispatcher.cargoMetal = Math.min(curmulRes[0], fleetDispatcher.metalOnPlanet);
                fleetDispatcher.cargoCrystal = Math.min(curmulRes[1], fleetDispatcher.crystalOnPlanet);
                fleetDispatcher.cargoDeuterium = Math.min(curmulRes[2], fleetDispatcher.deuteriumOnPlanet);
                fleetDispatcher.refresh();
            }
        }
        else
        {
            this.ogl.db.harvestCoords = undefined;
        }

        this.updateSpeedBar();

        // save ships data in OGL DB
        this.ogl.shipsList.forEach(shipID =>
        {
            if(fleetDispatcher.fleetHelper.shipsData?.[shipID])
            {
                //this.ogl.db.serverData[shipID] = fleetDispatcher.fleetHelper.shipsData[shipID].name;
                this.ogl.db.shipsCapacity[shipID] = fleetDispatcher.fleetHelper.shipsData[shipID].cargoCapacity || fleetDispatcher.fleetHelper.shipsData[shipID].baseCargoCapacity;
            }
        });

        fleetDispatcher.selectMission(parseInt(fleetDispatcher.mission) || parseInt(this.ogl.db.options.defaultMission));
        fleetDispatcher.speedPercent = fleetDispatcher.speedPercent || 10;
        fleetDispatcher.realSpeedPercent = fleetDispatcher.speedPercent;

        if(this.ogl.mode === 1 || this.ogl.mode === 2)
        {
            fleetDispatcher.selectShip(this.ogl.db.options.defaultShip, this.shipsForResources());
            fleetDispatcher.selectMaxAll();
        }
        else if(this.ogl.mode === 5 && this.ogl.db.options.expeditionRedirect)
        {
            this.selectExpedition(this.ogl.db.lastExpeditionShip || this.ogl.db.options.defaultShip);
        }

        fleetDispatcher.refresh();
        fleetDispatcher.focusSubmitFleet1();

        if(document.querySelector('.secondcol'))
        {
            Util.runAsync(() =>
            {
                document.querySelector('#sendall').classList.add('material-icons');
                document.querySelector('#sendall').innerText = 'chevron-double-right';
                document.querySelector('#resetall').classList.add('material-icons');
                document.querySelector('#resetall').innerText = 'exposure_zero';
            });
    
            Util.addDom('div', { child:'cube-send', class:'material-icons tooltipRight tooltipClose tooltipClick tooltipUpdate', parent:document.querySelector('.secondcol'), ontooltip:() =>
            {
                const container = Util.addDom('div', { class:'ogl_resourcesPreselection' });
                const resources = ['metal', 'crystal', 'deut', 'food'];

                resources.forEach(resourceName =>
                {
                    const item = Util.addDom('div', { class:`ogl_icon ogl_${resourceName}`, parent:container, onclick:() =>
                    {
                        input.value =  input.value == fleetDispatcher[this.resOnPlanet[resourceName]] ? 0 : fleetDispatcher[this.resOnPlanet[resourceName]];
                        fleetDispatcher[this.cargo[resourceName]] = input.value;
                        input.dispatchEvent(new Event('input'));
                    }});
    
                    const input = Util.addDom('input', { type:'text', parent:item,
                    onclick:e =>
                    {
                        e.stopPropagation();
                    },
                    oninput:() =>
                    {
                        Util.formatInput(input, () =>
                        {
                            input.value = Math.min(fleetDispatcher[this.resOnPlanet[resourceName]], (parseInt(input.value.replace(/\D/g, '')) || 0));
                            fleetDispatcher[this.cargo[resourceName]] = input.value;
                            input.value = (parseInt(input.value.replace(/\D/g, '') || 0)).toLocaleString('fr-FR');
                        });
                    }});
                });
    
                Util.addDom('hr', { parent:container });
    
                Util.addDom('div', { class:'ogl_button ogl_formValidation', child:'OK', parent:container, onclick:() =>
                {
                    let total = 0;
    
                    container.querySelectorAll('input').forEach(input =>
                    {
                        total += parseInt(input.value.replace(/\D/g, '')) || 0;
                    });
    
                    if(total > 0) fleetDispatcher.selectShip(this.ogl.db.options.defaultShip, this.shipsForResources(false, total));

                    container.querySelectorAll('input').forEach((input, index) => fleetDispatcher[this.cargo[resources[index]]] = parseInt(input.value.replace(/\D/g, '') || 0));

                    this.ogl._tooltip.close();
    
                    fleetDispatcher.refresh();
                    setTimeout(() => fleetDispatcher.focusSubmitFleet1(), 50);
                }});
    
                //this.ogl._popup.open(container);
                this.ogl._tooltip.update(container);
                container.querySelector('input').focus();
            }});
        }

        document.querySelectorAll('#fleet2 .resourceIcon').forEach(icon =>
        {
            Util.addDom('div', { class:'ogl_reverse material-icons', child:'fiber_smart_record', parent:icon, onclick:e =>
            {
                let type = icon.classList.contains('metal') ? 'metal' : icon.classList.contains('crystal') ? 'crystal' : icon.classList.contains('deuterium') ? 'deut' : 'food';
                fleetDispatcher[this.cargo[type]] = Math.min(fleetDispatcher[this.resOnPlanet[type]] - fleetDispatcher[this.cargo[type]], fleetDispatcher.getFreeCargoSpace());
                fleetDispatcher.refresh();
            }});
        });

        if(!this.ogl.mode) this.hasBeenInitialized = true;
    }

    setRealTarget(obj, forceParam)
    {
        // set realTarget and inputs
        obj.galaxy = forceParam?.galaxy || obj.galaxy;
        obj.system = forceParam?.system || obj.system;
        obj.position = forceParam?.position || obj.position;
        obj.type = forceParam?.type || obj.type;
        obj.name = forceParam?.name || obj.name;

        fleetDispatcher.realTarget = obj;

        document.querySelector('#galaxy').value = fleetDispatcher.realTarget.galaxy;
        document.querySelector('#system').value = fleetDispatcher.realTarget.system;
        document.querySelector('#position').value = fleetDispatcher.realTarget.position;

        fleetDispatcher.targetPlanet.galaxy = fleetDispatcher.realTarget.galaxy;
        fleetDispatcher.targetPlanet.system = fleetDispatcher.realTarget.system;
        fleetDispatcher.targetPlanet.position = fleetDispatcher.realTarget.position;
        fleetDispatcher.targetPlanet.type = fleetDispatcher.realTarget.type;

        // update the flag icon
        document.querySelectorAll('.smallplanet').forEach(planet =>
        {
            const coords = planet.querySelector('.planet-koords').innerText.split(':');
            planet.querySelector('.ogl_currentDestination')?.classList.remove('ogl_currentDestination');

            if(fleetDispatcher.realTarget.galaxy == coords[0] && fleetDispatcher.realTarget.system == coords[1] && fleetDispatcher.realTarget.position == coords[2])
            {
                const parent = fleetDispatcher.realTarget.type == 1 ? planet.querySelector('.planetlink') : fleetDispatcher.realTarget.type == 3 ? planet.querySelector('.moonlink') : false;
                if(parent) parent.classList.add('ogl_currentDestination');
            }
        });
    }

    fleetSent(defaultRedirection)
    {
        if(this.ajaxSuccess) return;

        this.ajaxSuccess = true;

        // save fleet data
        this.ogl.db.previousFleet = {};
        this.ogl.db.previousFleet.shipsToSend = fleetDispatcher.shipsToSend;
        this.ogl.db.previousFleet.speedPercent = fleetDispatcher.speedPercent;
        this.ogl.db.previousFleet.targetPlanet = JSON.parse(JSON.stringify(fleetDispatcher.targetPlanet)); // unproxify
        this.ogl.db.previousFleet.mission = fleetDispatcher.mission;
        this.ogl.db.previousFleet.expeditionTime = fleetDispatcher.expeditionTime;
        this.ogl.db.previousFleet.cargoMetal = fleetDispatcher.cargoMetal;
        this.ogl.db.previousFleet.cargoCrystal = fleetDispatcher.cargoCrystal;
        this.ogl.db.previousFleet.cargoDeuterium = fleetDispatcher.cargoDeuterium;
        this.ogl.db.previousFleet.cargoFood = fleetDispatcher.cargoFood;

        // update planet resources left
        this.ogl.currentPlanet.obj.metal -= Math.min(this.initialResOnPlanet.metal, fleetDispatcher.cargoMetal);
        this.ogl.currentPlanet.obj.crystal -= Math.min(this.initialResOnPlanet.crystal, fleetDispatcher.cargoCrystal);
        this.ogl.currentPlanet.obj.deut -= Math.min(this.initialResOnPlanet.deut, fleetDispatcher.cargoDeuterium + fleetDispatcher.getConsumption());
        this.ogl.currentPlanet.obj.food -= Math.min(this.initialResOnPlanet.food, fleetDispatcher.cargoFood);

        // add conso to stats
        const stats = this.ogl._stats.getDayStats(serverTime.getTime());
        stats.conso = (stats.conso || 0) + Math.min(this.initialResOnPlanet.deut, fleetDispatcher.getConsumption());

        if(this.isQuickRaid) this.ogl.db.quickRaidList.shift();
        if(this.ogl.mode === 5 && fleetDispatcher.mission !== 15 && this.ogl.db.options.expeditionRedirect) this.ogl.mode = 0;
        if(this.ogl.mode != 1 && this.ogl.mode != 2 && this.ogl.mode != 5) this.prepareRedirection();

        if(this.ogl.mode === 1 || this.ogl.mode === 2 || (this.ogl.mode === 5 && this.ogl.db.options.expeditionRedirect))
        {
            //localStorage.setItem('ogl-redirect', this.ogl.nextRedirection);
            window.location.href = this.ogl.nextRedirection;
        }
        else if(this.ogl.mode === 3 && this.ogl.cache.toSend)
        {
            let cumul = [0,0,0];
            let urlParams = new URLSearchParams(window.location.search);
            
            if(urlParams.get('substractMode') && urlParams.get('targetid'))
            {
                const targetID = urlParams.get('targetid');
                cumul[0] -= (this.ogl.db.myPlanets[targetID]?.metal || 0);
                cumul[1] -= (this.ogl.db.myPlanets[targetID]?.crystal || 0);
                cumul[2] -= (this.ogl.db.myPlanets[targetID]?.deut || 0);
            }

            this.ogl.cache.toSend.forEach(build =>
            {                    
                const id = new URLSearchParams(window.location.search).get('targetid');
                const cost = this.ogl.db.myPlanets[id].todolist[build.id][build.level].cost;

                for(let i=0; i<3; i++)
                {
                    let res = i === 2 ? 'deut' : i === 1 ? 'crystal' : 'metal';
                    let cargo = i == 2 ? 'cargoDeuterium' : i == 1 ? 'cargoCrystal' : 'cargoMetal';
                    let newVal = Math.min(fleetDispatcher[cargo] - cumul[i], build.cost[res]);
                    cumul[i] += newVal;

                    cost[res] -= newVal;
                }

                if(build.amount && cost.metal + cost.crystal + cost.deut <= 0) delete this.ogl.db.myPlanets[id].todolist[build.id][build.level];

                if(Object.values(this.ogl.db.myPlanets[id].todolist[build.id]).length < 1)
                {
                    delete this.ogl.db.myPlanets[id].todolist[build.id];
                }
            });

            window.location.href = defaultRedirection;
        }
        else if(this.ogl.mode === 4)
        {
            let messageId = parseInt(new URLSearchParams(window.location.search).get('oglmsg')) || 0;
            if(this.ogl.cache.reports[messageId]) this.ogl.cache.reports[messageId].attacked = true;
            window.location.href = `https://${window.location.host}/game/index.php?page=messages`;
        }
        else
        {
            window.location.href = defaultRedirection;
        }

        this.ogl.save();
    }

    addLimiters()
    {
        // add limiters
        const limiterContainer = document.querySelector('#fleetdispatchcomponent');

        const limiterField = Util.addDom('fieldset', { parent:limiterContainer });
        Util.addDom('legend', { parent:limiterField, child:'<i class="material-icons">settings</i> Settings' });

        const limitResourceLabel = Util.addDom('label', { class:'ogl_limiterLabel tooltip', 'data-limiter-type':'resource', title:this.ogl._lang.find('resourceLimiter'), parent:limiterField, child:'Limit resources' });
        const limitResourceCheckbox = Util.addDom('input', { type:'checkbox', parent:limitResourceLabel, onclick:() =>
        {
            this.ogl.db.fleetLimiter.resourceActive = !this.ogl.db.fleetLimiter.resourceActive;
            this.updateLimiter();
        }});

        const limitShipLabel = Util.addDom('label', { class:'ogl_limiterLabel tooltip', 'data-limiter-type':'ship', title:this.ogl._lang.find('fleetLimiter'), parent:limiterField, child:'Limit ships' });
        const limitShipCheckbox = Util.addDom('input', { type:'checkbox', parent:limitShipLabel, onclick:() =>
        {
            this.ogl.db.fleetLimiter.shipActive = !this.ogl.db.fleetLimiter.shipActive;
            this.updateLimiter();
        }});

        const limitFoodLabel = Util.addDom('label', { class:'ogl_limiterLabel tooltip', title:this.ogl._lang.find('forceIgnoreFood'), parent:limiterField, child:'Ignore Food' });
        const limitFoodCheckbox = Util.addDom('input', { type:'checkbox', parent:limitFoodLabel, onclick:() =>
        {
            this.ogl.db.fleetLimiter.ignoreFood = !this.ogl.db.fleetLimiter.ignoreFood;
            this.updateLimiter();
        }});

        const keepLabel = Util.addDom('div', { class:'ogl_limiterGroup tooltip', title:this.ogl._lang.find('forceKeepCapacity'), parent:limiterField, child:'Force' });

        [202, 203, 219, 200].forEach(shipID =>
        {
            const item = Util.addDom('div', { class:`ogl_icon ogl_${shipID}`, parent:keepLabel, onclick:() =>
            {
                keepLabel.querySelector('.ogl_active')?.classList.remove('ogl_active');
                item.classList.add('ogl_active');
                this.ogl.db.keepEnoughCapacityShip = shipID;
                this.updateLimiter();
            }});

            if(this.ogl.db.keepEnoughCapacityShip == shipID) item.classList.add('ogl_active');
        });

        if(this.ogl.db.fleetLimiter.resourceActive) limitResourceCheckbox.checked = true;
        if(this.ogl.db.fleetLimiter.shipActive) limitShipCheckbox.checked = true;
        if(this.ogl.db.fleetLimiter.ignoreFood) limitFoodCheckbox.checked = true;
        
        this.updateLimiter();
    }

    updateLimiter()
    {
        if(!unsafeWindow.fleetDispatcher) return;

        this.totalCapacity = 0;

        // ships
        fleetDispatcher.shipsOnPlanet.forEach((entry, index) =>
        {
            let forced = 0;

            if(this.ogl.db.keepEnoughCapacityShip == entry.id && this.ogl.mode !== 1 && this.ogl.mode !== 2)
            {
                forced = this.shipsForResources(entry.id);
            }

            if(this.ogl.db.fleetLimiter.shipActive && this.ogl.db.fleetLimiter.data[entry.id]) entry.number = Math.max(0, this.initialShipsOnPlanet.find(e => e.id == entry.id).number - Math.max(this.ogl.db.fleetLimiter.data[entry.id], forced));
            else entry.number = this.initialShipsOnPlanet.find(e => e.id == entry.id).number - forced;

            if(fleetDispatcher.shipsToSend.find(e => e.id == entry.id)?.number >= entry.number)
            {
                fleetDispatcher.selectShip(entry.id, entry.number);
            }

            const techDom = document.querySelector(`[data-technology="${entry.id}"]`);
            if(techDom)
            {
                if(!techDom.querySelector('.ogl_reverse'))
                {
                    Util.addDom('div', { class:'ogl_reverse material-icons', child:'fiber_smart_record', parent:techDom, onclick:e =>
                    {
                        e.stopPropagation();
                        let delta = fleetDispatcher.shipsOnPlanet.find(e => e.id == entry.id)?.number - (fleetDispatcher.findShip(entry.id)?.number || 0);
                        fleetDispatcher.selectShip(entry.id, delta);
                        fleetDispatcher.refresh();
                    }});
                }

                techDom.querySelector('.ogl_maxShip')?.remove();
                const text = Util.addDom('div', { class:'ogl_maxShip', parent:techDom });
                text.innerHTML = `<b>-${Util.formatToUnits(this.ogl.db.fleetLimiter.shipActive ? Math.max(this.ogl.db.fleetLimiter.data[entry.id], forced) : forced)}</b>`;
                text.addEventListener('click', () => { Util.runAsync(() => this.ogl._ui.openFleetProfile()).then(e => this.ogl._popup.open(e)); });

                if(!this.ogl.db.fleetLimiter.shipActive && this.ogl.db.keepEnoughCapacityShip != entry.id) text.classList.add('ogl_hidden');
    
                if(entry.number <= 0)
                {
                    techDom.classList.add('ogl_notEnough');
                    fleetDispatcher.removeShip(entry.id);
                }
                else techDom.classList.remove('ogl_notEnough');
    
                this.totalCapacity += this.ogl.db.shipsCapacity[entry.id] * entry.number;

                //techDom.querySelector('input').classList.add('ogl_inputCheck');
            }

            document.querySelectorAll(`.ogl_flashNotEnough`).forEach(e => { if(e.value == 0) e.classList.remove('ogl_flashNotEnough') });
        });

        // resources
        ['metal', 'crystal', 'deut', 'food'].forEach(resourceName =>
        {
            if(this.ogl.db.fleetLimiter.resourceActive)
            {
                fleetDispatcher[this.resOnPlanet[resourceName]] = Math.max(0, this.initialResOnPlanet[resourceName] - (this.ogl.db.fleetLimiter.data[resourceName] || 0));
            }
            else
            {
                fleetDispatcher[this.resOnPlanet[resourceName]] = Math.max(0, this.initialResOnPlanet[resourceName]);
            }

            if(resourceName == 'food' && this.ogl.db.fleetLimiter.ignoreFood) fleetDispatcher[this.resOnPlanet[resourceName]] = 0;

            fleetDispatcher[this.cargo[resourceName]] = Math.min(fleetDispatcher[this.cargo[resourceName]], fleetDispatcher[this.resOnPlanet[resourceName]]);

            const techDom = document.querySelector(`#fleet2 #resources .${resourceName?.replace('deut', 'deuterium')}`);

            if(techDom)
            {
                techDom.querySelector('.ogl_maxShip')?.remove();
                const text = Util.addDom('div', { class:'ogl_maxShip', parent:techDom });
                text.innerHTML = `<b>-${Util.formatToUnits(this.ogl.db.fleetLimiter.resourceActive ? this.ogl.db.fleetLimiter.data[resourceName] : 0, 0)}</b>`;
                text.addEventListener('click', () => { Util.runAsync(() => this.ogl._ui.openFleetProfile()).then(e => this.ogl._popup.open(e)); });

                techDom.parentNode.querySelector('input').classList.add('ogl_inputCheck');
            }
        });

        fleetDispatcher.refresh();
        this.updateRequiredShips();
    }
    
    updateRequiredShips()
    {
        const requiredShips = document.querySelector('.ogl_requiredShips') || Util.addDom('span', { class:'ogl_requiredShips', parent:document.querySelector("#civilships #civil") || document.querySelector('#warning') });
        requiredShips.innerText = '';

        this.ogl.fretShips.forEach(shipID =>
        {
            const amount = this.shipsForResources(shipID);

            const item = Util.addDom('div', { class:`tooltip ogl_required ogl_icon ogl_${shipID}`, title:Util.formatNumber(amount), parent:requiredShips, child:Util.formatToUnits(amount), onclick:() =>
            {
                fleetDispatcher.selectShip(shipID, amount);
                fleetDispatcher.selectMaxAll();
                fleetDispatcher.refresh();
                fleetDispatcher.focusSubmitFleet1();
            }});
            
            if((fleetDispatcher.shipsOnPlanet.find(e => e.id == shipID)?.number || 0) < amount) item.classList.add('ogl_notEnough');
        });
        
    
        this.ogl.shipsList.forEach(shipID =>
        {
            const domElement = document.querySelector(`[data-technology="${shipID}"]`);

            if(domElement)
            {
                const shipFlag = domElement.querySelector('.ogl_shipFlag') || Util.addDom('div', { class:'ogl_shipFlag', parent:domElement });
                shipFlag.innerText = '';
    
                if(this.ogl.db.options.defaultShip == shipID) Util.addDom('div', { class:'material-icons ogl_fav', child:'star', parent:shipFlag });
                if(this.ogl.db.keepEnoughCapacityShip == shipID) Util.addDom('div', { class:'material-icons ogl_shipLock', child:'lock', parent:shipFlag });
            }
        });

        if(!document.querySelector('.ogl_popup.ogl_active')) fleetDispatcher.focusSubmitFleet1();
    }

    shipsForResources(shipID, resource)
    {
        shipID = shipID || this.ogl.db.options.defaultShip;
        resource = resource === 0 ? 0 : (resource || -1);

        if(resource === -1)
        {
            if(unsafeWindow.fleetDispatcher)
            {
                ['metal', 'crystal', 'deut', 'food'].forEach(resourceName => resource += fleetDispatcher[this.resOnPlanet[resourceName]]);
            }
            else
            {
                ['metal', 'crystal', 'deut', 'food'].forEach(resourceName => resource += this.ogl.currentPlanet?.obj?.[resourceName]) || 0;
            }
        }

        return Math.ceil(resource / this.ogl.db.shipsCapacity[shipID]) || 0;
    }

    selectExpedition(shipID)
    {
        if(fleetDispatcher.fetchTargetPlayerDataTimeout) return;

        this.ogl.mode = 5;

        /*let cumul = {};

        document.querySelectorAll('.smallplanet').forEach(smallplanet =>
        {
            const id = smallplanet.getAttribute('id').replace('planet-', '');
            const colo = this.ogl.db.myPlanets[id];

            if(!colo) return;

            // raceLevel boost building
            const techBonus11111 = (colo.lifeform == 1 ? (colo[11111] || 0) : 0) * Datafinder.getTech(11111).bonus1BaseValue / 100; // human metropolis
            const techBonus13107 = (colo.lifeform == 3 ? (colo[13107] || 0) : 0) * Datafinder.getTech(13107).bonus2BaseValue / 100; // meca tower
            const techBonus13111 = (colo.lifeform == 3 ? (colo[13111] || 0) : 0) * Datafinder.getTech(13111).bonus1BaseValue / 100; // meca cpu

            let bonusRaceLevel = (1 + this.ogl.db.lfBonuses?.[`lifeform${colo.lifeform}`]?.bonus / 100) || 1;
            bonusRaceLevel = bonusRaceLevel * (1 + techBonus11111 + techBonus13107 + techBonus13111);

            cumul[14205] = (cumul[14205] || 0) + (colo.activeLFTechs?.indexOf('14205') >= 0 ? colo[14205] : 0) * Datafinder.getTech(14205).bonus1BaseValue / 100 * bonusRaceLevel;
            cumul[14211] = (cumul[14211] || 0) + (colo.activeLFTechs?.indexOf('14211') >= 0 ? colo[14211] : 0) * Datafinder.getTech(14211).bonus1BaseValue / 100 * bonusRaceLevel;
            cumul[14218] = (cumul[14218] || 0) + (colo.activeLFTechs?.indexOf('14218') >= 0 ? colo[14218] : 0) * Datafinder.getTech(14218).bonus1BaseValue / 100 * bonusRaceLevel;
        });*/

        fleetDispatcher.resetShips();
        fleetDispatcher.resetCargo();

        const coords = [fleetDispatcher.currentPlanet.galaxy, fleetDispatcher.currentPlanet.system, fleetDispatcher.currentPlanet.position];
        const factor = { 202:1, 203:3, 219:5.75 };
        const expeditionData = this.ogl.calcExpeditionMax();

        //const maxResources = this.ogl.db.options.expeditionValue || base * (1 + (cumul[14205] + cumul[14211])) * (1 + cumul[14218]);

        //const maxResources = this.ogl.db.options.expeditionValue || (this.ogl.account.class == 3 ? treshold.max * 3 * this.ogl.server.economySpeed : treshold.max * 2) * (1 + LFbonus / 100);
        const amount = Math.max(this.ogl.db.options.expeditionValue ? 0 : Math.ceil(expeditionData.treshold.base / factor[shipID]), this.shipsForResources(shipID, expeditionData.max));

        let fillerID = 0;

        [218, 213, 211, 215, 207, 206, 205, 204].forEach(filler =>
        {
            if(this.ogl.db.options.expeditionBigShips.indexOf(filler) >= 0 && fillerID == 0 && document.querySelector(`.technology[data-technology="${filler}"] .amount`)?.getAttribute('data-value') > 0) fillerID = filler;
        });

        fleetDispatcher.shipsOnPlanet.forEach(ship =>
        {
            if(ship.id == shipID) fleetDispatcher.selectShip(ship.id, amount);
            else if(ship.id == fillerID && shipID != fillerID) fleetDispatcher.selectShip(ship.id, 1);
            else if(ship.id == 210) fleetDispatcher.selectShip(ship.id, 1);
            else if(ship.id == 219 && shipID != 219) fleetDispatcher.selectShip(ship.id, 1);
        });

        const randomSystem = Math.round(Math.random() * this.ogl.db.options.expeditionRandomSystem) * (Math.round(Math.random()) ? 1 : -1) + coords[1];

        this.setRealTarget(fleetDispatcher.realTarget,
        {
            galaxy:coords[0],
            system:randomSystem,
            position:16,
            type:1,
            name:fleetDispatcher.loca.LOCA_EVENTH_ENEMY_INFINITELY_SPACE
        });
    
        fleetDispatcher.selectMission(15);
        fleetDispatcher.expeditionTime = 1;
        fleetDispatcher.updateExpeditionTime();
        fleetDispatcher.refresh();
        fleetDispatcher.focusSubmitFleet1();

        this.ogl.db.lastExpeditionShip = shipID;

        this.prepareRedirection();
    }

    updateSpeedBar()
    {
        // update speed selector
        document.querySelector('#speedPercentage').addEventListener('mousemove', event =>
        {
            document.querySelector('#speedPercentage').querySelectorAll('.selected').forEach(e => e.classList.remove('selected'));
            document.querySelector('#speedPercentage').querySelector(`[data-step="${fleetDispatcher.realSpeedPercent}"]`).classList.add('selected');
        });

        document.querySelector('#speedPercentage').addEventListener('click', e =>
        {
            // fix OGame bug for ff mobile
            if(e.target.getAttribute('data-step'))
            {
                document.querySelector('#speedPercentage .bar').style.width = e.target.offsetLeft + e.target.offsetWidth + 'px';
                document.querySelector('#speedPercentage').querySelectorAll('.selected').forEach(e => e.classList.remove('selected'));
                e.target.classList.add('selected');
                fleetDispatcher.speedPercent = e.target.getAttribute('data-step');
                fleetDispatcher.realSpeedPercent = e.target.getAttribute('data-step');
                fleetDispatcher.refresh();
            }

            fleetDispatcher.realSpeedPercent = fleetDispatcher.speedPercent;
            fleetDispatcher.setFleetPercent(fleetDispatcher.speedPercent);

            if(fleetDispatcher.cargoDeuterium + fleetDispatcher.getConsumption() >= fleetDispatcher.getDeuteriumOnPlanetWithoutConsumption())
            {
                fleetDispatcher.cargoDeuterium = 0;
                fleetDispatcher.selectMaxDeuterium();
                fleetDispatcher.refresh();
            }

            fleetDispatcher.focusSendFleet();
        });
    }

    prepareRedirection()
    {
        if(this.redirectionReady && !this.ogl.mode) return;

        const isInit = !this.ogl.db.harvestCoords ? true : false;
        const nextCoords = this.ogl.currentPlanet.dom.next.querySelector('.planet-koords').innerText;
        const nextNextCoords = this.ogl.currentPlanet.dom.nextNext?.querySelector('.planet-koords')?.innerText;
        const type = fleetDispatcher.realTarget.type;
        
        let coords = `${fleetDispatcher.realTarget.galaxy}:${fleetDispatcher.realTarget.system}:${fleetDispatcher.realTarget.position}`.split(':');
        let destCoords = `${fleetDispatcher.realTarget.galaxy}:${fleetDispatcher.realTarget.system}:${fleetDispatcher.realTarget.position}`;
        let sourceCoords = `${this.ogl.db.harvestCoords?.source?.galaxy}:${this.ogl.db.harvestCoords?.source?.system}:${this.ogl.db.harvestCoords?.source?.position}`;
        
        if(isInit)
        {
            if(this.redirectionReady)
            {
                this.ogl.mode = 0;
                sourceCoords = nextCoords;
            }
            else
            {
                this.ogl.db.harvestCoords = { source:fleetDispatcher.currentPlanet, destination:fleetDispatcher.realTarget };
                sourceCoords = `${this.ogl.db.harvestCoords?.source?.galaxy}:${this.ogl.db.harvestCoords?.source?.system}:${this.ogl.db.harvestCoords?.source?.position}`;
            }
        }

        let prevID;
        let nextID;

        if(this.ogl.mode === 1)
        {
            prevID = this.ogl.db.harvestCoords?.source?.type == 1 ? this.ogl.currentPlanet.dom.prev.getAttribute('id').replace('planet-', '') : this.ogl.currentPlanet.dom.prevWithMoon.querySelector('.moonlink').getAttribute('href').match(/cp=(\d+)/)[1];
            nextID = this.ogl.db.harvestCoords?.source?.type == 1 ? this.ogl.currentPlanet.dom.next.getAttribute('id').replace('planet-', '') : this.ogl.currentPlanet.dom.nextWithMoon.querySelector('.moonlink').getAttribute('href').match(/cp=(\d+)/)[1];

            if(!isInit && destCoords == nextCoords && fleetDispatcher.currentPlanet.type == fleetDispatcher.realTarget.type)
            {
                nextID = this.ogl.db.harvestCoords?.source?.type == 1 ? this.ogl.currentPlanet.dom.nextNext.getAttribute('id').replace('planet-', '') : this.ogl.currentPlanet.dom.nextNextWithMoon.querySelector('.moonlink').getAttribute('href').match(/cp=(\d+)/)[1];
            }

            this.ogl.prevRedirection = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&cp=${prevID}&galaxy=${coords[0]}&system=${coords[1]}&position=${coords[2]}&type=${type}&oglmode=1`;
            this.ogl.nextRedirection = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&cp=${nextID}&galaxy=${coords[0]}&system=${coords[1]}&position=${coords[2]}&type=${type}&oglmode=1`;
        }
        else if(this.ogl.mode === 2)
        {
            prevID = this.ogl.db.harvestCoords?.source?.type == 1 ? this.ogl.currentPlanet.dom.prevWithMoon.getAttribute('id').replace('planet-', '') : this.ogl.currentPlanet.dom.prevWithMoon.querySelector('.moonlink').getAttribute('href').match(/cp=(\d+)/)[1];
            nextID = this.ogl.db.harvestCoords?.source?.type == 1 ? this.ogl.currentPlanet.dom.nextWithMoon.getAttribute('id').replace('planet-', '') : this.ogl.currentPlanet.dom.nextWithMoon.querySelector('.moonlink').getAttribute('href').match(/cp=(\d+)/)[1];
        
            this.ogl.prevRedirection = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&cp=${prevID}&oglmode=2`;
            this.ogl.nextRedirection = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&cp=${nextID}&oglmode=2`;
        }
        else if(this.ogl.mode === 5)
        {
            prevID = this.ogl.db.harvestCoords?.source?.type == 1 ? this.ogl.currentPlanet.dom.prev.getAttribute('id').replace('planet-', '') : this.ogl.currentPlanet.dom.prevWithMoon.querySelector('.moonlink').getAttribute('href').match(/cp=(\d+)/)[1];
            nextID = this.ogl.db.harvestCoords?.source?.type == 1 ? this.ogl.currentPlanet.dom.next.getAttribute('id').replace('planet-', '') : this.ogl.currentPlanet.dom.nextWithMoon.querySelector('.moonlink').getAttribute('href').match(/cp=(\d+)/)[1];

            this.ogl.prevRedirection = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&cp=${prevID}&oglmode=5`;
            this.ogl.nextRedirection = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&cp=${nextID}&oglmode=5`;
        }

        if(sourceCoords == nextCoords || (nextCoords == destCoords && sourceCoords == nextNextCoords && this.ogl.db.harvestCoords?.source?.type == this.ogl.db.harvestCoords?.destination?.type))
        {
            this.ogl.db.harvestCoords = undefined;
            this.ogl.nextRedirection = `https://${window.location.host}/game/index.php?page=ingame&component=overview&cp=${nextID}`;
        }

        this.redirectionReady = true;
    }

    // not only spies
    addToSpyQueue(order, galaxy, system, position, type, shipCount, callback)
    {
        this.spyQueue = this.spyQueue || [];
        this.spyQueue.push({ order:order, galaxy:galaxy, system:system, position:position, type:type, shipCount:shipCount, callback:callback });

        document.querySelectorAll(`[data-spy-coords="${galaxy}:${system}:${position}:${type}"]`).forEach(e => e.setAttribute('data-spy', 'prepare'));
        
        if(!this.spyInterval)
        {
            this.spyInterval = setInterval(() => this.spy(), 500);
        }
    }

    spy()
    {
        if(!this.spyReady) return;
        if(this.spyQueue.length <= 0)
        {
            clearInterval(this.spyInterval);
            this.spyInterval = false;
            this.spyReady = true;
            return;
        }

        this.spyReady = false;

        const self = this;
        const params =
        {
            mission:this.spyQueue[0].order,
            galaxy:this.spyQueue[0].galaxy,
            system:this.spyQueue[0].system,
            position:this.spyQueue[0].position,
            type:this.spyQueue[0].type,
            shipCount:this.spyQueue[0].shipCount || this.ogl.db.spyProbesCount,
            token:token
        };

        $.ajax(miniFleetLink,
        {
            data:params,
            dataType:"json",
            type:"POST",
            success:function(data)
            {
                if(typeof data.newAjaxToken != "undefined")
                {
                    // update message token
                    let tokenInput = document.querySelector('[name="token"]');
                    if(tokenInput) tokenInput.value = data.newAjaxToken;

                    // update token
                    token = data.newAjaxToken;
                    updateOverlayToken('phalanxSystemDialog', data.newAjaxToken);
                    updateOverlayToken('phalanxDialog', data.newAjaxToken);
                }

                if(!data.response.success && !data.response.coordinates)
                {
                    self.spyReady = true;
                    return;
                }

                if(self.spyQueue[0].callback) self.spyQueue[0].callback();

                if(data.response.coordinates && data.response.success)
                {
                    document.querySelectorAll(`[data-spy-coords="${params.galaxy}:${params.system}:${params.position}:${params.type}"]`).forEach(e => e.setAttribute('data-spy', 'done'));

                    self.spyQueue.shift();

                    if(params.mission == 6 && self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`])
                    {
                        self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`].spy =  self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`].spy || [];

                        if(params.type == 1)
                        {
                            self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`].spy[0] = serverTime.getTime();
                        }
                        else
                        {
                            self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`].spy[1] = serverTime.getTime();
                        }
                    }

                    if(data.response.slots && document.querySelector('#galaxycomponent #slotUsed'))
                    {
                        document.querySelector('#galaxycomponent #slotUsed').innerText = data.response.slots;
                    }

                    if(data.response.probes && document.querySelector('#galaxycomponent #probeValue'))
                    {
                        document.querySelector('#galaxycomponent #probeValue').innerText = data.response.probes;
                    }

                    refreshFleetEvents();
                }
                else if(data.response.coordinates && !data.response.success)
                {
                    self.spyQueue[0].retry = (self.spyQueue[0].retry || 0) + 1;

                    if(self.spyQueue[0].retry > 1)
                    {
                        self.spyQueue.shift();
                        document.querySelectorAll(`[data-spy-coords="${params.galaxy}:${params.system}:${params.position}:${params.type}"]`).forEach(e => e.setAttribute('data-spy', 'fail'));
                        self.ogl._notification.addToQueue(`[${data.response.coordinates.galaxy}:${data.response.coordinates.system}:${data.response.coordinates.position}] ${data.response.message}`, false);
                    }
                }

                self.spyReady = true;
            },
            error:function(error)
            {
                self.spyReady = true;
            }
        });
    }

    updateSpyFunctions()
    {
        sendShips = (order, galaxy, system, planet, planettype, shipCount) =>
        {
            this.addToSpyQueue(order, galaxy, system, planet, planettype, shipCount);
        }

        sendShipsWithPopup = (order, galaxy, system, planet, planettype, shipCount) =>
        {
            this.addToSpyQueue(order, galaxy, system, planet, planettype, shipCount);
        }
    }

    checkSendShips()
    {
        // spy
        document.querySelectorAll(`[onclick*="sendShips(6"]:not([data-spy-coords]), [onclick*="sendShipsWithPopup(6"]:not([data-spy-coords])`).forEach(element =>
        {
            const matches = element.getAttribute('onclick').match(/[sendShips|sendShipsWithPopup]\((\d|,| )+\)/);

            if(matches)
            {
                const params = matches[0].match(/\d+/g)
                element.setAttribute('data-spy-coords', `${params[1]}:${params[2]}:${params[3]}:${params[4]}`);

                const lastSpy = this.ogl.db.pdb[`${params[1]}:${params[2]}:${params[3]}`]?.spy?.[params[4] == 1 ? 0 : 1] || 0;
                if(serverTime.getTime() - lastSpy < this.ogl.db.options.spyIndicatorDelay) element.setAttribute('data-spy', 'recent');
            }
        });

        // df
        document.querySelectorAll(`[onclick*="sendShips(8"]:not([data-spy-coords]), [onclick*="sendShipsWithPopup(8"]:not([data-spy-coords])`).forEach(element =>
        {
            const matches = element.getAttribute('onclick').match(/[sendShips|sendShipsWithPopup]\((\d|,| )+\)/);

            if(matches)
            {
                const params = matches[0].match(/\d+/g)
                element.setAttribute('data-spy-coords', `${params[1]}:${params[2]}:${params[3]}:${params[4]}`);
            }
        });
    }

    updateSystemSpy()
    {
        const self = this;

        document.querySelector('.spysystemlink').addEventListener('click', event =>
        {
            event.preventDefault();
            event.stopPropagation();

            const targetUrl =  event.target.getAttribute('data-target-url');
            if(!targetUrl) return;

            $.post(targetUrl,
            {
                galaxy:$("#galaxy_input").val(),
                system:$("#system_input").val(),
                token:token
            }, 'json')
            .done(function(json)
            {
                const data = JSON.parse(json);
                token = data.newAjaxToken;

                updateOverlayToken('phalanxDialog', data.newAjaxToken);
                updateOverlayToken('phalanxSystemDialog', data.newAjaxToken);

                if(!data.count)
                {
                    self.ogl._notification.addToQueue(data.text, false);
                }

                data.planets.forEach(params =>
                {
                    document.querySelectorAll(`[data-spy-coords="${params.galaxy}:${params.system}:${params.position}:${params.type}"]`).forEach(e => e.setAttribute('data-spy', 'done'));

                    if(self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`])
                    {
                        self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`].spy = self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`].spy || [];

                        if(params.type == 1)
                        {
                            self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`].spy[0] = serverTime.getTime();
                        }
                        else
                        {
                            self.ogl.db.pdb[`${params.galaxy}:${params.system}:${params.position}`].spy[1] = serverTime.getTime();
                        }
                    }
                });
            });
        });
    }
}


class GalaxyManager extends Manager
{
    init()
    {
        if(!this.isReady)
        {
            this.isReady = true;
            this.unloadSystem();
            submitForm();
        }
    }

    load()
    {
        if(this.ogl.page != 'galaxy' || !unsafeWindow.galaxy) return;

        this.galaxy = galaxy;
        this.system = system;

        const loader = document.querySelector('#galaxyLoading');
        loader.setAttribute('data-currentposition', this.galaxy+':'+this.system);

        Util.overWrite('loadContentNew', unsafeWindow, (g, s) =>
        {
            this.unloadSystem();
            loader.setAttribute('data-currentPosition', `${g}:${s}`);
            this.ogl._tooltip.close();
        });

        submitForm();

        this.ogl._fleet.updateSystemSpy();
    }

    check(data)
    {
        if(!data.success || !data.system)
        {
            this.ogl._notification.addToQueue(`Error, cannot fetch [${this.galaxy}:${this.system}] data`);
            return;
        }

        this.galaxy = data.system.galaxy;
        this.system = data.system.system;

        let ptrePositions = {}; // ptre positions data
        let ptreActivities = {}; // ptre activities data

        this.ogl.db.spyProbesCount = data.system.settingsProbeCount || 0;

        let getActivity = element =>
        {
            if(element.activity.showActivity == 15) return '*'; // acti
            else return element.activity.idleTime || 60;
        }
        
        data.system.galaxyContent.forEach(line =>
        {
            const position = line.position;
            const debris = { metal:0, crystal:0, deut:0, total:0 };
            const row = document.querySelector(`#galaxyRow${position}`);

            if(position == 16)
            {
                debris.metal = parseInt(line.planets.resources.metal.amount);
                debris.crystal = parseInt(line.planets.resources.crystal.amount);
                debris.deut = parseInt(line.planets.resources.deuterium.amount);
                debris.total = debris.metal + debris.crystal + debris.deut;

                this.updateDebrisP16(debris, row);
                return;
            }

            const coords = `${this.galaxy}:${this.system}:${position}`;
            const playerID = parseInt(line.player.playerId == 99999 ? -1 : line.player.playerId);
            const playerName = line.player.playerName;
            const playerStatus = Array.from(row.querySelector(`.cellPlayerName span[class*="status_"]`)?.classList || []).filter(e => e.startsWith('status_'))[0];
            const playerStatusTag = line.player.isOnVacation ? 'v' : line.player.isLongInactive ? 'I' : line.player.isInactive ? 'i' : 'n';
            const isOwn = playerID == this.ogl.account.id;
            const rank = line.player.highscorePositionPlayer;
            const activities = [];

            let planetID = -1;
            let moonID = -1;
            let moonSize = -1;

            row.querySelector('.cellDebris').classList.remove('ogl_important');
            
            line.planets.forEach(element =>
            {
                if(element.planetType == 1) // planet
                {
                    activities[0] = getActivity(element);
                    planetID = element.isDestroyed ? -1 : parseInt(element.planetId);
                }
                else if(element.planetType == 2) // debris
                {
                    debris.metal = parseInt(element.resources.metal.amount);
                    debris.crystal = parseInt(element.resources.crystal.amount);
                    debris.deut = parseInt(element.resources.deuterium.amount);
                    debris.total = debris.metal + debris.crystal + debris.deut;

                    this.updateDebris(debris, row);
                }
                else if(element.planetType == 3) // moon
                {
                    activities[1] = getActivity(element);
                    moonID = element.isDestroyed ? -1 : parseInt(element.planetId);
                    moonSize = parseInt(element.size);
                }
            });

            if(line.player.isAdmin) return;
            
            const oldEntry = this.ogl.db.pdb[coords] || { pid:-1, mid:-1 };

            if(this.ogl.ptreKey)
            {
                ptrePositions[coords] = {};
                ptrePositions[coords].teamkey = this.ogl.ptreKey;
                ptrePositions[coords].galaxy = this.galaxy;
                ptrePositions[coords].system = this.system;
                ptrePositions[coords].position = position;
                ptrePositions[coords].timestamp_ig = serverTime.getTime();

                ptrePositions[coords].old_player_id = oldEntry.uid || -1;
                ptrePositions[coords].timestamp_api = oldEntry?.api || -1;
                ptrePositions[coords].old_name = oldEntry?.name || false;
                ptrePositions[coords].old_rank = oldEntry?.score?.globalRanking || -1;
                ptrePositions[coords].old_score = oldEntry?.score?.global || -1;
                ptrePositions[coords].old_fleet = oldEntry?.score?.military || -1;

                if(playerID < 0 && oldEntry.pid != planetID) // old:occupied -> now:empty
                {
                    ptrePositions[coords].id = -1;
                    ptrePositions[coords].player_id = -1;
                    ptrePositions[coords].name = false;
                    ptrePositions[coords].rank = -1;
                    ptrePositions[coords].score = -1;
                    ptrePositions[coords].fleet = -1;
                    ptrePositions[coords].status = false;
                    ptrePositions[coords].moon = { id:-1 };
                }
                else if(playerID < 0) // old:empty -> now:empty
                {
                    delete ptrePositions[coords];
                }
            }

            // planet has changed
            if(oldEntry.pid != planetID)
            {
                this.ogl.removeOldPlanetOwner(coords, playerID);
                delete this.ogl.db.pdb[coords];
            }

            // valid player
            if(playerID > 0)
            {
                this.ogl.db.pdb[coords] = this.ogl.db.pdb[coords] || {};

                const player = this.ogl.db.udb[playerID] || this.ogl.createPlayer(playerID);
                const planet = this.ogl.db.pdb[coords];

                if(this.ogl.ptreKey && (oldEntry.pid != planetID || (oldEntry.mid || -1) != moonID)) // planet or moon has changed
                {
                    ptrePositions[coords].id = planetID;
                    ptrePositions[coords].player_id = playerID;
                    ptrePositions[coords].name = playerName || false;
                    ptrePositions[coords].rank = rank || -1;
                    ptrePositions[coords].score = player.score?.global || -1;
                    ptrePositions[coords].fleet = player.score?.military || -1;
                    ptrePositions[coords].status = playerStatusTag;

                    if(moonID > -1)
                    {
                        ptrePositions[coords].moon = {};
                        ptrePositions[coords].moon.id = moonID;
                        ptrePositions[coords].moon.size = moonSize;
                    }

                    console.log(`${coords} | ${oldEntry.pid} -> ${planetID} | ${oldEntry.mid} -> ${moonID}`)
                }
                else // no change
                {
                    delete ptrePositions[coords];
                }

                // update planet data
                planet.uid = playerID;
                planet.pid = planetID;
                planet.mid = moonID;
                planet.coo = coords;

                // update player data
                player.uid = playerID;
                player.name = playerName;
                player.status = playerStatus;
                player.score = player.score || {};
                player.score.globalRanking = rank;
                player.planets = player.planets || [];
                if(player.planets.indexOf(coords) < 0) player.planets.push(coords);

                this.updateRow(player, row, isOwn, coords);

                // get the activities if the player has been pinned
                if((player.pin || this.ogl.db.lastPinnedList.indexOf(playerID) > -1) && this.ogl.db.pdb[coords])
                {
                    this.ogl.db.pdb[coords].api = serverTime.getTime();
                    this.ogl.db.pdb[coords].acti = [activities[0], activities[1], serverTime.getTime()];
                    this.ogl.db.pdb[coords].debris = debris.total;

                    if(document.querySelector('.ogl_side.ogl_active') && this.ogl.db.currentSide == playerID) this.ogl._topbar.openPinnedDetail(playerID);

                    ptreActivities[coords] = {};
                    ptreActivities[coords].id = planetID;
                    ptreActivities[coords].player_id = playerID;
                    ptreActivities[coords].teamkey = this.ogl.ptreKey;
                    ptreActivities[coords].mv = playerStatusTag == 'v' ? true : false;
                    ptreActivities[coords].activity = activities[0];
                    ptreActivities[coords].galaxy = this.galaxy;
                    ptreActivities[coords].system = this.system;
                    ptreActivities[coords].position = position;
                    ptreActivities[coords].main = this.ogl.db.pdb[coords].home || false;
                    ptreActivities[coords].cdr_total_size = debris.total;
    
                    if(moonID > -1)
                    {
                        ptreActivities[coords].moon = {};
                        ptreActivities[coords].moon.id = moonID;
                        ptreActivities[coords].moon.activity = activities[1];
                    }
                }
            }
        });

        // send positions data to the PTRE server
        if(Object.keys(ptrePositions).length > 0) PTRE.postPositions(ptrePositions);

        // send acivities data to the PTRE server
        if(Object.keys(ptreActivities).length > 0) PTRE.postActivities(ptreActivities);

        this.checkCurrentSystem();
    }

    updateRow(player, row, isOwn, coords)
    {
        const page = Math.max(1, Math.ceil(player.score.globalRanking / 100));

        this.ogl._ui.turnIntoPlayerLink(player.uid, row.querySelector('.cellPlayerName [class*="status_abbr"]'), player.name);
        Util.addDom('a', { class:'ogl_ranking', parent:row.querySelector('.cellPlayerName'), href:`https://${window.location.host}/game/index.php?page=highscore&site=${page}&searchRelId=${player.uid}`, child:'#'+player.score.globalRanking });

        if(!isOwn)
        {
            this.ogl._ui.addPinButton(row.querySelector('.cellPlayerName'), player.uid);
            this.ogl._ui.addTagButton(row.querySelector('.cellPlanetName'), coords);
        }

        if(player.uid == this.ogl.db.currentSide)
        {
            row.querySelector('.cellPlayerName').classList.add('ogl_active');
        }
    }

    updateDebris(debris, row)
    {
        if(debris.total > 0)
        {
            const dom = row.querySelector('.microdebris');
            dom.classList.remove('debris_1');

            const ships = dom.querySelector('[onclick*="sendShips(8"]');
            const div = Util.addDom('div', { parent:dom });

            if(ships)
            {
                const params = ships.getAttribute('onclick').match(/\d+/g).map(Number);
                div.setAttribute('data-spy-coords', `${params[1]}:${params[2]}:${params[3]}:2`);
                div.addEventListener('click', () => sendShips(params[0], params[1], params[2], params[3], params[4], params[5]));
            }

            div.innerHTML = Util.formatToUnits(debris.total, 0);

            if(debris.total >= this.ogl.db.options.resourceTreshold)
            {
                div.closest('.cellDebris').classList.add('ogl_important');
            }
        }
}

    updateDebrisP16(debris, row)
    {
        if(debris.total > 0)
        {
            let content = row.querySelectorAll('.ListLinks li');
            if(!content[0]) content = document.querySelectorAll('#debris16 .ListLinks li');

            let scouts = content[3];
            let action = content[4];

            if(debris.total >= this.ogl.db.options.resourceTreshold) document.querySelector('.expeditionDebrisSlotBox').classList.add('ogl_important');

            (document.querySelector('.expeditionDebrisSlotBox .ogl_expeditionRow') || Util.addDom('div', { class:'ogl_expeditionRow', prepend:document.querySelector('.expeditionDebrisSlotBox') })).innerHTML = `
                <div>
                    <div class="material-icons">debris</div>
                </div>
                <div class="ogl_expeditionDebris">
                    <div class="ogl_icon ogl_metal">${Util.formatToUnits(debris.metal)}</div>
                    <div class="ogl_icon ogl_crystal">${Util.formatToUnits(debris.crystal)}</div>
                    <div class="ogl_icon ogl_deut">${Util.formatToUnits(debris.deut)}</div>
                </div>
                <div>
                    <div>${scouts.innerText}</div>
                    <div>${action.outerHTML}</div>
                </div>
            `;
        }

        row.classList.remove('ogl_hidden');
    }

    unloadSystem()
    {
        if(document.querySelector('#galaxyRow16'))
        {
            document.querySelector('#galaxyRow16').classList.add('ogl_hidden');
            document.querySelector('#galaxyRow16').classList.remove('ogl_important');
        }

        for(let i=1; i<16; i++)
        {
            document.querySelectorAll(`#galaxyRow${i} .galaxyCell:not(.cellPosition)`).forEach(e =>
            {
                e.innerText = '';
                e.classList.remove('ogl_important');
                e.classList.remove('ogl_active');
            });

            document.querySelector(`#galaxyRow${i}`).className = 'galaxyRow ctContentRow empty_filter filtered_filter_empty';
        }
    }

    checkCurrentSystem()
    {
        document.querySelectorAll('[data-galaxy]').forEach(element =>
        {
            let coords = element.getAttribute('data-galaxy').split(':');
            if(this.galaxy == coords[0] && this.system == coords[1]) element.classList.add('ogl_active');
            else element.classList.remove('ogl_active');
        });
    }
}


class JumpgateManager extends Manager
{
    load()
    {
        this.initialRel = {};

        Util.overWrite('initJumpgate', unsafeWindow, false, () =>
        {
            this.check();
        });

        Util.overWrite('initPhalanx', unsafeWindow, false, () =>
        {
            this.checkPhalanx();
        });

        this.saveTimer();
        this.displayTimer();
    }

    check()
    {
        const parent = document.querySelector('#jumpgate');

        if(!parent || parent.querySelector('.ogl_limiterLabel')) return;

        document.querySelectorAll('#jumpgate .ship_input_row').forEach(line =>
        {
            if(line.previousElementSibling.classList.contains('tdInactive')) return;

            const input = line.querySelector('input');
            const shipID = input.getAttribute('id').replace('ship_', '');
            this.initialRel[shipID] = parseInt(input.getAttribute('rel'));
        });

        const limiterField = Util.addDom('fieldset', { parent:document.querySelector('#jumpgateForm .ship_selection_table') });
        Util.addDom('legend', { parent:limiterField, child:'Settings' });

        const limitShipLabel = Util.addDom('label', { class:'ogl_limiterLabel', parent:limiterField, child:'Ships' });
        const limitShipCheckbox = Util.addDom('input', { type:'checkbox', parent:limitShipLabel, onclick:() =>
        {
            this.ogl.db.fleetLimiter.jumpgateActive = !this.ogl.db.fleetLimiter.jumpgateActive;
            this.updateLimiter();
        }});

        const keepLabel = Util.addDom('div', { class:'ogl_limiterGroup', parent:limiterField, child:'Force (jumpgate)' });

        [202, 203, 219, 200].forEach(shipID =>
        {
            const item = Util.addDom('div', { class:`ogl_icon ogl_${shipID}`, parent:keepLabel, onclick:() =>
            {
                keepLabel.querySelector('.ogl_active')?.classList.remove('ogl_active');
                item.classList.add('ogl_active');
                this.ogl.db.keepEnoughCapacityShipJumpgate = shipID;
                this.updateLimiter();
            }});

            if(this.ogl.db.keepEnoughCapacityShipJumpgate == shipID) item.classList.add('ogl_active');
        });

        if(this.ogl.db.fleetLimiter.jumpgateActive) limitShipCheckbox.checked = true;

        this.updateLimiter();
    }

    updateLimiter()
    {
        if(!document.querySelector('#jumpgate') || document.querySelector('#jumpgateNotReady')) return;

        const sendAllJson = {};
        
        document.querySelectorAll('#jumpgate .ship_input_row').forEach(line =>
        {
            if(line.previousElementSibling.classList.contains('tdInactive')) return;

            const input = line.querySelector('input');
            const shipID = input.getAttribute('id').replace('ship_', '');
            let forced = 0;

            if(this.ogl.db.keepEnoughCapacityShipJumpgate == shipID)
            {
                forced = this.ogl._fleet.shipsForResources(shipID);
            }

            const keeped = Math.max(forced, (this.ogl.db.fleetLimiter.jumpgateActive ? (this.ogl.db.fleetLimiter.jumpgateData[shipID] || 0) : 0));
            const amount = Math.max(0, this.initialRel[shipID] - keeped);
            input.setAttribute('rel', amount);
            if(input.value > amount) input.value = amount;

            line.previousElementSibling.querySelector('.quantity').setAttribute('onclick', `toggleMaxShips('#jumpgateForm', ${shipID}, ${amount})`);
            line.previousElementSibling.querySelector('a').setAttribute('onclick', `toggleMaxShips('#jumpgateForm', ${shipID}, ${amount})`);

            let text = line.querySelector('.ogl_keepRecap') || Util.addDom('div', { parent:line, class:'ogl_keepRecap' });
            text.innerText = `-${keeped}`;
            text.addEventListener('click', () => { Util.runAsync(() => this.ogl._ui.openFleetProfile()).then(e => this.ogl._popup.open(e)); });

            sendAllJson[shipID] = amount;
        });

        document.querySelector('#jumpgate #sendall').setAttribute('onclick', `setMaxIntInput("#jumpgateForm", ${JSON.stringify(sendAllJson)})`);
    }

    checkPhalanx()
    {
        const parent = document.querySelector('#phalanxWrap');
        const container = Util.addDom('div', { prepend:parent, child:'<span>Last update:</span><br>', class:'ogl_phalanxLastUpdate' });
        const clock = document.querySelector('.OGameClock').cloneNode(true);
        clock.className='';

        container.appendChild(clock);
        const refresh =  Util.addDom('span', { parent:container, child:' - <b>0s</b>' });
        
        setInterval(() =>
        {
            const currentTime = parseInt(document.querySelector('.OGameClock').getAttribute('data-time-server'));
            const refreshTime = parseInt(clock.getAttribute('data-time-server'));

            refresh.innerHTML = ` - <b>${(currentTime - refreshTime) / 1000}s</b>`;
        }, 1000);
    }

    saveTimer()
    {
        const calcTimer = level =>
        {
            return (0.25 * Math.pow(level, 2) - 7.57 * level + 67.34) / this.ogl.server.warFleetSpeed * 60000;
        }
        
        jumpgateDone = a =>
        {
            var a = $.parseJSON(a);

            if(a.status)
            {
                planet = a.targetMoon;
                $(".overlayDiv").dialog("destroy");

                const originID = this.ogl.currentPlanet.obj.id;
                //const originCoords = this.ogl.currentPlanet.obj.coords.join(':');
                const originLevel = this.ogl.currentPlanet.dom.element.parentNode.querySelector('.moonlink').getAttribute('data-jumpgatelevel');

                //const destinationCoords = document.querySelector(`.moonlink[href*="${jumpGateTargetId}"]`).parentNode.querySelector('.planet-koords').textContent.slice(1, -1);
                const destinationLevel = document.querySelector(`.moonlink[href*="${jumpGateTargetId}"]`).getAttribute('data-jumpgatelevel');

                const now = serverTime.getTime();
                this.ogl.db.myPlanets[originID].jumpgateTimer = now + calcTimer(originLevel);
                this.ogl.db.myPlanets[jumpGateTargetId].jumpgateTimer = now + calcTimer(destinationLevel);
            }

            errorBoxAsArray(a.errorbox);
            if(typeof(a.newToken) != "undefined") setNewTokenData(a.newToken);
        }
    }

    displayTimer()
    {
        document.querySelectorAll('.moonlink').forEach(moon =>
        {
            const targetDom = moon.parentNode.querySelector(`.ogl_sideIconInfo`) || Util.addDom('div', { class:'ogl_sideIconInfo tooltip', 'data-title':'Jumpgate not ready', parent:moon.parentNode });
            const moonID = moon.getAttribute('href').match(/cp=(\d+)/)[1];

            if(this.ogl.db.myPlanets[moonID]?.jumpgateTimer > serverTime.getTime())
            {
                const updateTimer = () => new Date(this.ogl.db.myPlanets[moonID].jumpgateTimer - (serverTime.getTime() + 3600000)).toLocaleTimeString([], { minute:'2-digit', second:'2-digit' });

                const div = Util.addDom('div', { class:'ogl_jumpgateTimer', parent:targetDom, child:updateTimer() });

                let interval = setInterval(() =>
                {
                    if(this.ogl.db.myPlanets[moonID].jumpgateTimer <= serverTime.getTime())
                    {
                        clearInterval(interval);
                        div.remove();
                    }
                    else div.innerText = updateTimer();
                }, 1000);
            }
        });
    }
}


class TooltipManager extends Manager
{
    load()
    {
        this.openTimeout;
        this.lastSender;
        this.lastActiveSender;
        this.shouldWait = false;

        this.tooltip = Util.addDom('div',
        {
            class:'ogl_tooltip',
            parent:document.body
        });

        // fix resources tooltips
        if(!document.querySelector('#metal_box')?.getAttribute('title')) getAjaxResourcebox();

        this.init();
    }

    init(self)
    {
        self = self || this;
        const hoveredList = Array.from(document.querySelectorAll(':hover') || []);

        document.querySelectorAll('[class*="tooltip"] [class*="tooltip"]:not(.ogl_tooltip):not(.ogl_ready)').forEach(sender =>
        {
            sender.classList.add('ogl_ready');
            sender.removeAttribute('title');
        });

        document.querySelectorAll('[class*="tooltip"]:not(.ogl_tooltip):not(.ogl_ready):not([class*="tooltip"] [class*="tooltip"])').forEach(sender =>
        {
            sender.classList.add('ogl_ready');

            if(sender.getAttribute('rel')?.indexOf('player') > -1)
            {
                //sender.classList.add('tooltipClick');
                sender.classList.add('tooltipUpdate');
            }

            if(sender.title) sender.setAttribute('data-title', sender.title);
            sender.removeAttribute('title');
            
            const isClick = sender.classList.contains('tooltipClick');
            const isCustom = sender.classList.contains('tooltipCustom');
            const isClose = sender.classList.contains('tooltipClose');
            const isRel = sender.classList.contains('tooltipRel');
            const isUpdate = sender.classList.contains('tooltipUpdate') || sender.classList.contains('recallFleet') || (sender.classList.contains('player') && sender.classList.contains('advice'));
            const isFlagPicker = sender.classList.contains('ogl_flagPicker');
            const isTagPicker = sender.classList.contains('ogl_tagPicker');
            const delay = isClick || isFlagPicker || isTagPicker ? 1 : 0;

            let eventType = isClick ? 'click' : 'mouseenter';

            if(eventType == 'click')
            {
                sender.addEventListener('mouseenter', () =>
                {
                    this.lastActiveSender = sender;
                    this.lastSender = sender;
                    if(sender.title) sender.setAttribute('data-title', sender.title);
                    sender.removeAttribute('title');
                });
            }
            else
            {
                sender.addEventListener('click', () =>
                {
                    clearTimeout(this.openTimeout);
                    this.close();
                });
            }

            if(sender.closest('#top, #box'))
            {
                sender.classList.add('tooltipBottom');
            }

            sender.addEventListener(eventType, event =>
            {
                if(event.detail > 1 || (isClick && event.shiftKey)) return;

                this.lastSender = sender;
                if(sender.title) sender.setAttribute('data-title', sender.title);
                sender.removeAttribute('title');

                self.openTimeout = setTimeout(() =>
                {
                    this.lastActiveSender = this.lastSender;
                    self.tooltip.innerText = '';
                    self.tooltip.classList.remove('ogl_active');

                    if(isRel || isFlagPicker || isUpdate)
                    {
                        if(isUpdate)
                        {
                            sender.dispatchEvent(this.ogl.tooltipEvent);
                        }
                        else
                        {
                            self.tooltip.appendChild(document.querySelector('#'+sender.getAttribute('rel')).cloneNode(true));
                        }
                    }
                    else if(sender.getAttribute('data-title'))
                    {
                        if(sender.classList.contains('show_fleet_apikey')) self.tooltip.innerHTML = `<div>${sender.getAttribute('data-title')}</div>`;
                        else self.tooltip.innerHTML = `<div>${sender.getAttribute('data-title')?.replace(/\|/g, '<hr>')}</div>`;
                    }
                    else return;

                    self.prepare();
                    if(self.tooltip.innerHTML == '') return;

                    if(isClick || isClose) this.closeBtn = Util.addDom('div', { class:'material-icons ogl_close', child:'close-thick', parent:self.tooltip, onclick:() => self.close() });
                    self.triangle = Util.addDom('div', { class:'ogl_tooltipTriangle', parent:self.tooltip });
                    
                    const position = self.recalcPosition(sender, self);
                    if(position == 0) return;

                    clearTimeout(self.openTimeout);

                    if(isTagPicker && event.shiftKey) return;

                    if((!sender.closest('#planetList') || !document.body.classList.contains('ogl_destinationPicker'))
                    && self.tooltip.innerHTML.trim() !== ''
                    && self.tooltip.innerHTML.trim() !== 'undefined')
                    {
                        //self.tooltip.classList.add('ogl_active')
                        //self.openTimeout = setTimeout(() => self.tooltip.classList.add('ogl_active'), delay || self.ogl.db.options.tooltipDelay);
                        self.openTimeout = setTimeout(() =>
                        {
                            if(eventType == 'click' || self.tooltip.querySelector('.ogl_playerData')) this.shouldWait = true;
                            else this.shouldWait = false;

                            self.tooltip.classList.add('ogl_active');
                        }, this.shouldWait ? 0 : (delay || self.ogl.db.options.tooltipDelay));
                    }
                }, this.shouldWait ? (delay || self.ogl.db.options.tooltipDelay) : 0);
            });

            if(!isClick && hoveredList.find(e => e == sender))
            {
                sender.dispatchEvent(new Event('mouseenter'));
            }

            sender.addEventListener('pointerleave', () =>
            {
                clearTimeout(self.openTimeout);

                if(!sender.classList.contains('tooltipClose') && !isCustom && this.lastActiveSender == this.lastSender)
                {
                    self.tooltip.classList.remove('ogl_active');
                }
            });
        });
    }

    close()
    {
        this.tooltip.classList.remove('ogl_active');
    }

    prepare()
    {
        if(this.tooltip.querySelector('.fleetinfo'))
        {
            const origin = (this.lastSender.closest('.eventFleet')?.querySelector('.coordsOrigin') || this.lastSender.closest('.fleetDetails')?.querySelector('.originData a'))?.innerText.slice(1, -1);
            const div = Util.addDom('div', { class:'ogl_fleetDetail' });
            let rawText = '';
            let trashsimData = { ships:{} };

            this.tooltip.querySelectorAll('tr').forEach(line =>
            {
                const name = line.querySelector('td')?.innerText.replace(':', '');
                const key = Object.entries(this.ogl.db.serverData).find(entry => entry[1] === name)?.[0];
                const value = line.querySelector('.value')?.innerText.replace(/\.|,| /g, '');

                if(key && value)
                {
                    if(key == 'metal') Util.addDom('hr', { parent:div });

                    const val = key == 'metal' || key == 'crystal' || key == 'deut' || key == 'food' ? Util.formatNumber(parseInt(value)) : Util.formatToUnits(value);

                    Util.addDom('div', { parent:div, class:`ogl_icon ogl_${key}`, child:val });
                    trashsimData.ships[key] = { count:value };

                    rawText += `${name}: ${Util.formatNumber(parseInt(value))}\n`;
                }
            });

            if(rawText.length > 0)
            {
                const container = Util.addDom('span', { parent:div, class:'ogl_fullgrid' });
                Util.addDom('hr', { parent:container });
                const btn = Util.addDom('button',
                {
                    class:'ogl_button',
                    parent:container,
                    child:'<span class="material-icons">content-copy</span><span>Copy</span>',
                    onclick:() =>
                    {
                        navigator.clipboard.writeText(rawText);
                        btn.classList.remove('material-icons');
                        btn.innerText = 'Copied!';
                    }
                });

                if(origin)
                {
                    Util.addDom('div',
                    {
                        class:'ogl_button',
                        parent:container,
                        child:'<span class="material-icons">letter_s</span><span>Simulate</span>',
                        onclick:() => 
                        {
                            if(Array.from(document.querySelectorAll('.planet-koords')).find(e => e.innerText == origin))
                            {
                                window.open(Util.genTrashsimLink(false, trashsimData, false, false), '_blank');
                            }
                            else
                            {
                                trashsimData.planet = { galaxy:origin.split(':')[0], system:origin.split(':')[1], position:origin.split(':')[2] };
                                window.open(Util.genTrashsimLink(false, false, trashsimData, true), '_blank');
                            }
                        }
                    });
                }
            }

            if(rawText.length > 0)
            {
                this.tooltip.innerText = '';
                this.tooltip.appendChild(div);
            }
        }
        else if(this.lastSender.classList.contains('planetlink'))
        {
            if(this.ogl.db.options.disablePlanetTooltips)
            {
                this.tooltip.innerText = '';
                clearTimeout(this.openTimeout);
                this.close();
                return;
            }

            const planetID = this.lastSender.parentNode.getAttribute('id').replace('planet-', '');
            const name = this.lastSender.querySelector('.planet-name').innerText;
            const data = this.ogl.db.myPlanets[planetID];
            const div = Util.addDom('div', { class:'ogl_planetTooltip' });
            const links = this.tooltip.querySelectorAll('a');

            if(!data) return;

            if(data?.lifeform) Util.addDom('div', { parent:div, class:`ogl_icon ogl_lifeform${data.lifeform}` });
            div.appendChild(this.lastSender.querySelector('.planetPic').cloneNode());
            Util.addDom('h3', { parent:div, child:`<span data-galaxy="${data.coords}">[${data.coords}]</span><br>${name}` });
            Util.addDom('div', { class:'ogl_textCenter', parent:div, child:`${data.fieldUsed}/${data.fieldMax}` });
            Util.addDom('div', { class:'ogl_textCenter', parent:div, child:`${data.temperature + 40}°c` });
            Util.addDom('hr', { parent:div });
            Util.addDom('div', { class:'ogl_mineRecap', child:`<span class='ogl_metal'>${data[1]}</span> <span class='ogl_crystal'>${data[2]}</span> <span class='ogl_deut'>${data[3]}</span>`, parent:div });
            if(this.ogl._topbar?.PlanetBuildingtooltip[planetID])
            {
                div.appendChild(this.ogl._topbar?.PlanetBuildingtooltip[planetID]);
            }
            Util.addDom('hr', { parent:div });
            links.forEach(e => div.appendChild(e));

            this.tooltip.innerText = '';
            this.tooltip.appendChild(div);
        }
        else if(this.lastSender.classList.contains('moonlink'))
        {
            if(this.ogl.db.options.disablePlanetTooltips)
            {
                this.tooltip.innerText = '';
                clearTimeout(this.openTimeout);
                this.close();
                return;
            }

            const urlParams = new URLSearchParams(this.lastSender.getAttribute('href'));
            const planetID = urlParams.get('cp').split('#')[0];
            const name = this.lastSender.querySelector('.icon-moon').getAttribute('alt');
            const data = this.ogl.db.myPlanets[planetID];
            const div = Util.addDom('div', { class:'ogl_planetTooltip' });
            const links = this.tooltip.querySelectorAll('a');

            if(!data) return;

            div.appendChild(this.lastSender.querySelector('.icon-moon').cloneNode());
            Util.addDom('h3', { parent:div, child:`<span data-galaxy="${data.coords}">[${data.coords}]</span><br>${name}` });
            Util.addDom('div', { class:'ogl_textCenter', parent:div, child:`${data.fieldUsed}/${data.fieldMax}` });
            Util.addDom('hr', { parent:div });
            if(this.ogl._topbar?.PlanetBuildingtooltip[planetID])
            {
                div.appendChild(this.ogl._topbar?.PlanetBuildingtooltip[planetID]);
            }
            links.forEach(e => div.appendChild(e));

            this.tooltip.innerText = '';
            this.tooltip.appendChild(div);
        }
    }

    update(content, sender)
    {
        sender = sender || this.lastSender;

        const isClick = sender.classList.contains('tooltipClick');
        const isCustom = sender.classList.contains('tooltipCustom');
        const isClose = sender.classList.contains('tooltipClose');
        const isRel = sender.classList.contains('tooltipRel');
        const isUpdate = sender.classList.contains('tooltipUpdate');
        const isFlagPicker = sender.getAttribute('data-flagpicker');

        this.tooltip.innerText = '';
        this.tooltip.appendChild(content);

        if((isClick || isFlagPicker || isClose) && !this.tooltip.querySelector('.ogl_close')) this.closeBtn = Util.addDom('div', { class:'material-icons ogl_close', child:'close-thick', parent:this.tooltip, onclick:() => this.close() });
        if(!this.tooltip.querySelector('.ogl_tooltipTriangle')) this.triangle = Util.addDom('div', { class:'ogl_tooltipTriangle', parent:this.tooltip });

        const position = this.recalcPosition(sender, this);
        if(position == 0) this.close();
    }

    recalcPosition(sender, self)
    {
        let senderRect = sender.getBoundingClientRect();
        let tooltipRect = self.tooltip.getBoundingClientRect();
        let offset = 10;
        let triangleOffset = 6;

        let x = 0;
        let y = 0;

        if(sender.classList.contains('tooltipLeft'))
        {
            x = parseInt(senderRect.left - tooltipRect.width + window.scrollX);
            y = parseInt(senderRect.bottom - (tooltipRect.height / 2 + senderRect.height / 2 - window.scrollY));

            x = Math.min(Math.max(x, offset + window.scrollX), window.innerWidth - offset + window.scrollX - tooltipRect.width);
            y = Math.min(Math.max(y, offset + window.scrollY), window.innerHeight - offset + window.scrollY - tooltipRect.height);

            self.tooltip.setAttribute('data-direction', 'left');
            self.tooltip.style.transform = `translateX(${Math.ceil(x)}px) translateY(${Math.ceil(y)}px)`;

            self.triangle.style.top = senderRect.top + senderRect.height/2 - y - offset - triangleOffset + window.scrollY + 'px';
            self.triangle.style.right = '-5px';
        }
        else if(sender.classList.contains('tooltipRight'))
        {
            x = parseInt(senderRect.left + senderRect.width + window.scrollX);
            y = parseInt(senderRect.bottom - (tooltipRect.height / 2 + senderRect.height / 2 - window.scrollY));

            x = Math.min(Math.max(x, offset + window.scrollX), window.innerWidth - offset + window.scrollX - tooltipRect.width);
            y = Math.min(Math.max(y, offset + window.scrollY), window.innerHeight - offset + window.scrollY - tooltipRect.height);

            if(sender.classList.contains('moonlink') && x == window.innerWidth - offset + window.scrollX - tooltipRect.width)
            {
                x = senderRect.left + senderRect.width + window.scrollX;
                //x += (- window.scrollX + tooltipRect.width);
            }

            self.tooltip.setAttribute('data-direction', 'right');
            self.tooltip.style.transform = `translateX(${Math.floor(x)}px) translateY(${Math.floor(y)}px)`;
            
            self.triangle.style.top = senderRect.top + senderRect.height/2 - y - offset - triangleOffset + window.scrollY + 'px';
            self.triangle.style.left = '-5px';
        }
        else if(sender.classList.contains('tooltipBottom'))
        {
            x = parseInt(senderRect.left + window.scrollX - (tooltipRect.width / 2 - senderRect.width / 2));
            y = parseInt(senderRect.bottom + window.scrollY);

            x = Math.min(Math.max(x, offset + window.scrollX), window.innerWidth - offset + window.scrollX - tooltipRect.width);
            y = Math.min(Math.max(y, offset + window.scrollY), window.innerHeight - offset + window.scrollY - tooltipRect.height);

            self.tooltip.setAttribute('data-direction', 'bottom');
            self.tooltip.style.transform = `translateX(${Math.floor(x)}px) translateY(${Math.floor(y)}px)`;

            self.triangle.style.top = '-5px';
            self.triangle.style.left = senderRect.left - x - offset - triangleOffset + senderRect.width/2 + window.scrollX + 'px';
        }
        else
        {
            x = parseInt(senderRect.left + window.scrollX - (tooltipRect.width / 2 - senderRect.width / 2));
            y = parseInt(senderRect.top - (tooltipRect.height - window.scrollY));

            x = Math.min(Math.max(x, offset + window.scrollX), window.innerWidth - offset + window.scrollX - tooltipRect.width);
            y = Math.min(Math.max(y, offset + window.scrollY), window.innerHeight - offset + window.scrollY - tooltipRect.height);

            self.tooltip.setAttribute('data-direction', 'top');
            self.tooltip.style.transform = `translateX(${Math.ceil(x)}px) translateY(${Math.ceil(y)}px)`;

            self.triangle.style.bottom = '-5px';
            self.triangle.style.left = senderRect.left - x - offset - triangleOffset + senderRect.width/2 + window.scrollX + 'px';
        }

        return x+y;
    }
}


class NotificationManager extends Manager
{
    load()
    {
        this.data = {};
        this.blocks = [];
        this.interval;
        this.hideTimer = 5000;
        this.step = 200;
        this.currentValue = this.hideTimer;
        
        this.start = 0;
        this.timeLeft = this.hideTimer;
        this.elapsedInterval;
        this.notification = Util.addDom('div', { class:'ogl_notification', parent:document.body,
        onmouseenter:() =>
        {
            clearInterval(this.interval);
        },
        onmouseleave:() =>
        {
            this.interval = setInterval(() => this.updateClock(), this.step);
        },
        onclick:() =>
        {
            this.close();
        }});

        this.clock = Util.addDom('progress', { parent:this.notification, min:0, max:this.hideTimer, value:this.currentValue });
        this.content = Util.addDom('div', { parent:this.notification });
    }

    open()
    {
        this.content.innerText = '';
        if(this.ogl._message.events?.mission) this.ogl._message.events.mission = 0;

        const data = {};
        let blockCount = 0;

        this.blocks.forEach(block =>
        {
            let icon = Util.addDom('i');
            if(block.success > 0) icon = Util.addDom('i', { class:'material-icons ogl_ok', child:'done' });
            else if(block.success < 0) icon = Util.addDom('i', { class:'material-icons ogl_danger', child:'alert' });

            if(block.data)
            {
                Object.entries(block.data).forEach(entry =>
                {
                    data[entry[0]] = (data[entry[0]] || 0) + (entry[1] || 0);
                });
            }

            if(block.message)
            {
                const line = Util.addDom('div', { class:'ogl_notificationLine', child:`${icon.outerHTML}<b class="ogl_notificationTimer">[${this.ogl._time.timeToHMS(this.ogl._time.getClientTime(block.time))}]</b>` + block.message, prepend:this.content });
                if(block.success < 0) line.classList.add('ogl_danger');
            }
            else
            {
                blockCount++;
            }
        });

        if(blockCount > 0)
        {
            Util.addDom('div', { class:'ogl_notificationLine', child:`<b class="ogl_notificationTimer">[${this.ogl._time.timeToHMS(this.ogl._time.getClientTime())}]</b>` + `${blockCount} mission(s) added`, prepend:this.content });
        }

        if(Object.keys(data).length > 0)
        {
            let hasResources = false;
            let hasShips = false;
            let hasLifeforms = false;
            let hasExpeditions = false;

            const grid = Util.addDom('div', { class:'ogl_grid', prepend:this.content });

            ['metal', 'crystal', 'deut', 'dm'].forEach(type =>
            {
                if(data[type])
                {
                    Util.addDom('div', { class:`ogl_icon ogl_${type}`, child:Util.formatToUnits(data[type]), parent:grid });
                    hasResources = true;
                }
            });

            if(hasResources) Util.addDom('hr', { parent:grid });

            this.ogl.shipsList.forEach(type =>
            {
                if(data[type])
                {
                    Util.addDom('div', { class:`ogl_icon ogl_${type}`, child:Util.formatToUnits(data[type]), parent:grid });
                    hasShips = true;
                }
            });

            if(hasShips) Util.addDom('hr', { parent:grid });

            ['artefact', 'lifeform1', 'lifeform2', 'lifeform3', 'lifeform4'].forEach(type =>
            {
                if(data[type])
                {
                    Util.addDom('div', { class:`ogl_icon ogl_${type}`, child:Util.formatToUnits(data[type]), parent:grid });
                    hasLifeforms = true;
                }
            });

            if(hasLifeforms) Util.addDom('hr', { parent:grid });

            ['blackhole', 'trader', 'early', 'late', 'pirate', 'alien'].forEach(type =>
            {
                if(data[type])
                {
                    Util.addDom('div', { 'data-resultType':type, class:`ogl_icon ogl_${type}`, child:Util.formatToUnits(data[type]), parent:grid });
                    hasExpeditions = true;
                }
            });

            if(hasExpeditions) Util.addDom('hr', { parent:grid });
        }

        this.currentValue = this.hideTimer;
        this.notification.classList.add('ogl_active');
        clearInterval(this.interval);
        this.interval = setInterval(() => this.updateClock(), this.step);
    }

    addToQueue(message, success, data)
    {
        this.blocks.push({ time:serverTime.getTime(), message:message, data:data, success:(success = success === true ? 1 : success === false ? -1 : 0) });
        this.blocks.sort((a, b) => a.time - b.time);
        this.blocks = this.blocks.filter(e => serverTime.getTime() < e.time + this.hideTimer);
    
        this.open();
    }

    updateClock()
    {
        this.currentValue -= this.step;
        this.clock.value = this.currentValue;
        if(this.currentValue < 0) this.close();
    }

    close()
    {
        clearInterval(this.interval);
        this.notification.classList.remove('ogl_active');
    }
}


class PopupManager extends Manager
{
    load()
    {
        this.popup = Util.addDom('div', {class:'ogl_popup', parent:document.body});

        this.popup.addEventListener('click', event =>
        {
            if(event.target === this.popup) this.close();
        });
    }

    open(dom, canShare)
    {
        if(this.ogl._tooltip) this.ogl._tooltip.close();
        this.popup.innerText = '';

        if(!dom) return;

        Util.addDom('div',
        {
            class:'ogl_close material-icons',
            child:'close-thick',
            prepend:dom,
            onclick:() =>
            {
                this.close();
            }
        });

        if(canShare)
        {
            Util.addDom('div',
            {
                class:'ogl_share material-icons',
                child:'camera',
                prepend:dom,
                onclick:event =>
                {
                    event.target.classList.add('ogl_disabled');
                    Util.takeScreenshot(this.popup.querySelector('div'), event.target, `ogl_${this.ogl.server.id}_${this.ogl.server.lang}_empire_${serverTime.getTime()}`);
                }
            });
        }

        this.popup.appendChild(dom);
        this.popup.classList.add('ogl_active');
    }

    close()
    {
        this.popup.classList.remove('ogl_active');
    }
}


class MessageManager extends Manager
{
    load()
    {
        this.ogl.cache.reports = this.ogl.cache.reports || {};
        this.ogl.cache.raids = this.ogl.cache.raids || {};
        this.ogl.cache.counterSpies = this.ogl.cache.counterSpies || [];

        this.checkBoard();

        if(this.ogl.page !== 'messages') return;

        this.tokenReady = true;
        this.deleteQueue = [];
        this.updateStatsTimeout;
        this.loopQueueTimeout;
        this.events = { mission:0 };
        this.hasNewEntry = false;

        const tempStorage = localStorage.getItem('ogl_tempExpe');
        this.expeResults = tempStorage ? JSON.parse(tempStorage) : Datafinder.getAllExpeditionsText();

        Util.overWrite('doInitAction', unsafeWindow.ogame.messages, false, () =>
        {
            const tabID = ogame.messages.getCurrentMessageTab();

            if(this.spytable)
            {
                if(tabID == 20)
                {
                    this.spytable.classList.remove('ogl_hidden');
                }
            }

            if(unsafeWindow.ogame.messages.getCurrentEarliestMessage())
            {
                this.check();
            }
        });

        setTimeout(() => this.loopDeleteQueue(), 500);
    }

    loopDeleteQueue()
    {
        (this.deleteQueue.length > 0)
        {
            this.deleteMessage();
        }

        setTimeout(() => this.loopDeleteQueue(), 300);
    }

    check()
    {
        // ignore default delete button
        let messages = document.querySelectorAll('.msg:not(.ogl_killReady)');
        messages.forEach(message =>
        {
            message.classList.add('.ogl_killReady');

            const id = message.getAttribute('data-msg-id');

            if(!message.querySelector('.icon_refuse')) return;

            if(message.querySelector('.icon_refuse').classList.contains('js_actionKill'))
            {
                message.querySelector('.icon_refuse').className = 'icon_nf icon_refuse';
                message.querySelector('.icon_refuse').addEventListener('click', () =>
                {
                    this.addToDeleteQueue(id);
                });
            }

            this.ogl._time.update(false, message.querySelector('.msg_date:not(.ogl_updated)'));
        });

        let tabID = ogame.messages.getCurrentMessageTab();

        if(tabID == 20 || tabID == 11) this.checkReports(tabID);
        else if(tabID == 21) this.checkRaids(tabID);
        else if(tabID == 22)
        {
            this.checkExpeditions();
            this.checkDiscovery();
        }
        else if(tabID == 24) this.checkRR();
        else if(tabID == 12) this.checkRaids(tabID, true);
        /*else if(tabID == 23) this.checkTransports();
        else if(tabID == 24) this.checkDebris();
        else if(tabID == 25) this.checkTrash();*/
    }

    checkReports(tabID)
    {
        if(document.querySelector('#subtabs-nfFleetTrash.ui-state-active')) return;

        const activeSubtab = document.querySelector(`.ui-tabs-tab[data-tabid="${tabID}"]`).getAttribute('aria-labelledby');
        const tabContent = document.querySelector(`.ui-tabs-panel[aria-labelledby="${activeSubtab}"]`);
        const exist = this.spytable && tabContent.parentNode.querySelector('.ogl_spytable') ? true : false;

        this.spytable = document.querySelector('.ogl_spytable') || Util.addDom('div', { class:'ogl_spytable ogl_hidden' });
        if(tabID == 20) this.spytable.classList.remove('ogl_hidden');

        if(!exist && !this.spytable.querySelector('.ogl_spyHeader'))
        {
            const pagination = tabContent.querySelector('.pagination').cloneNode(true);

            pagination.querySelectorAll('[data-page]').forEach((li, index) =>
            {
                li.classList.remove('paginator');

                li.addEventListener('click', () =>
                {
                    tabContent.querySelectorAll('.pagination [data-page]')[index].click();
                });
            });

            this.spytable.appendChild(pagination);
            Util.addDom('hr', { parent:this.spytable });

            Util.addDom('div',
            {
                class:'ogl_spyHeader',
                parent:this.spytable,
                child:
                `
                    <b class="ogl_textCenter">#</b>
                    <b class="material-icons" data-filter="date">schedule</b>
                    <b class="ogl_textCenter">*</b>
                    <b class="ogl_textCenter">&nbsp;</b>
                    <b data-filter="rawCoords">coords</b>
                    <b data-filter="name">name</b>
                    <b data-filter="totalDESC">loot</b>
                    <b class="material-icons" data-filter="fleetDESC">rocket_launch</b>
                    <b class="material-icons" data-filter="defDESC">security</b>
                    <b></b>
                `,
                onclick:event =>
                {
                    let filter = event.target.getAttribute('data-filter');
                    if(!filter) return;

                    document.querySelectorAll('.ogl_spyHeader .ogl_active').forEach(e => e.classList.remove('ogl_active'));
                    event.target.classList.add('ogl_active');
    
                    this.ogl.db.spytableSort = this.ogl.db.spytableSort !== filter ? filter : filter.indexOf('DESC') < 0 ? filter+'DESC' : filter.replace('DESC', '');
                    this.buildTable();
                }
            });

            document.querySelectorAll('.ogl_spyHeader [data-filter]').forEach(e =>
            {
                if(this.ogl.db.spytableSort.startsWith(e.getAttribute('data-filter'))) e.classList.add('ogl_active');
            });
        }
        
        // clean button
        if(!document.querySelector('#fleetsgenericpage .ogl_trashCounterSpy'))
        {
            Util.addDom('div', { class:'btn_blue ogl_trashCounterSpy material-icons', child:'broom', parent:document.querySelector('#fleetsgenericpage'), onclick:() =>
            {
                document.querySelectorAll('.espionageDefText').forEach(e => this.addToDeleteQueue(e.closest('.msg').getAttribute('data-msg-id')));

                this.spytable.querySelectorAll('[data-id]').forEach(line =>
                {
                    const id = line.getAttribute('data-id');
                    const totalValue = parseInt(line.querySelector('.ogl_reportTotal').getAttribute('data-value'));
                    const fleetValue = parseInt(line.querySelector('.ogl_reportFleet').getAttribute('data-value'));

                    if(totalValue + fleetValue < this.ogl.db.options.resourceTreshold) this.addToDeleteQueue(id);
                });
            }}); 
        }

        let ptreActivities = {}; // ptre activities data

        let messages = tabContent.querySelectorAll('.msg:not(.ogl_ready)');
        messages.forEach(message =>
        {
            let report = {};
            report.id = message.getAttribute('data-msg-id');

            if(message.querySelector('.espionageDefText .player'))
            {
                const target = message.querySelector('.espionageDefText .player');
                const content = target.getAttribute('title') || target.getAttribute('data-title');
                const tmpDiv = Util.addDom('div', { child:content });
                const uid = tmpDiv.querySelector('div')?.getAttribute('id')?.replace('player', '') || tmpDiv.querySelector('[data-playerid]')?.getAttribute('data-playerid');

                if(this.ogl.ptreKey)
                {
                    if(this.ogl.cache.counterSpies.indexOf(report.id) == -1)
                    {
                        const a = message.querySelector('.espionageDefText a');
                        const params = new URLSearchParams(a.getAttribute('href'));
                        const coords = [params.get('galaxy') || "0", params.get('system') || "0", params.get('position') || "0"];
                        const type = a.querySelector('figure.moon') ? 3 : 1;
                        const timestamp = message.querySelector('.msg_date.ogl_updated').getAttribute('data-time-server');
        
                        ptreActivities[report.id] = {};
                        ptreActivities[report.id].player_id = uid;
                        ptreActivities[report.id].teamkey = this.ogl.ptreKey;
                        ptreActivities[report.id].galaxy = coords[0];
                        ptreActivities[report.id].system = coords[1];
                        ptreActivities[report.id].position = coords[2];
                        ptreActivities[report.id].spy_message_ts = timestamp;
                        ptreActivities[report.id].moon = {};
        
                        if(type == 1)
                        {
                            ptreActivities[report.id].activity = '*';
                            ptreActivities[report.id].moon.activity = '60';
                        }
                        else
                        {
                            ptreActivities[report.id].activity = '60';
                            ptreActivities[report.id].moon.activity = '*';
                        }
                    }
                    else
                    {
                        const parent = document.querySelector(`.msg[data-msg-id="${report.id}"] .msg_title`);
                        if(parent && !document.querySelector(`.msg[data-msg-id="${report.id}"] .ogl_checked`)) Util.addDom('div', { class:'material-icons ogl_checked tooltipLeft ogl_ptre', child:'ptre', title:this.ogl._lang.find('ptreActivityAlreadyImported'), parent:parent });
                    }
                }

                this.ogl._ui.turnIntoPlayerLink(uid, target, target.innerText);
            }

            if(!message.querySelector('.compacting') || message.querySelector('.msg_title').innerText.indexOf(':16]') > -1) return;

            const apiButton = message.querySelector('.icon_apikey');
            let compacting = message.querySelectorAll('.compacting');
            let params = new URLSearchParams(message.querySelector('.msg_head a')?.href);

            //let cleaned = message.innerText.replace(new RegExp(' |\\'+LocalizationStrings.thousandSeperator, 'g'), '').toLowerCase();
            let cleaned = message.querySelector('.msg_content').innerHTML.replace(/: | :/g, ':');

            //Object.keys(this.ogl.resourcesKeys).concat(['loot']).forEach(res =>
            Object.keys(this.ogl.resourcesKeys).forEach(res =>
            {
                const regex = new RegExp(this.ogl._lang.find(res).toLowerCase()+':([0-9'+LocalizationStrings.decimalPoint+LocalizationStrings.thousandSeperator+']+['+LocalizationStrings.unitMilliard+'|'+LocalizationStrings.unitMega+'|'+LocalizationStrings.unitKilo+']*)', 'i');
                report[res] = Util.formatFromUnits(cleaned.match(regex)?.[1] || '0');
            });

            report.date = this.ogl._time.dateStringToTime(message.querySelector('.msg_date').innerText);
            report.activity = compacting[0].querySelectorAll('span.fright')[0].innerText ? compacting[0].querySelectorAll('span.fright')[0].innerText.indexOf('<') >= 0 ? 1 : parseInt(compacting[0].querySelectorAll('span.fright')[0].innerText.match(/\d+/)[0]) : -1;
            report.name = compacting[0].querySelectorAll('span[class^="status"]')[0].innerText.replace(/&nbsp;/g,'').trim();
            report.status = compacting[0].querySelectorAll('span[class^="status"]')[0].className;
            report.coords = [params.get('galaxy') || "0", params.get('system') || "0", params.get('position') || "0"];
            report.rawCoords = Util.coordsToID(report.coords);
            report.type = message.querySelector('.msg_head figure.moon') ? 'moon' : 'planet';
            report.typeID = message.querySelector('.msg_head figure.moon') ? 3 : 1;
            report.loot = parseInt(compacting[4].querySelector('.ctn').innerText.replace(/\D/g, ''));
            report.allResources = Math.floor(report.metal + report.crystal + report.deut);
            report.total = Math.floor((report.metal + report.crystal + report.deut) * report.loot / 100);
            report.fleet = compacting[5].querySelector('.ctn') ? Util.formatFromUnits(compacting[5].querySelector('.ctn').innerText.split(':')[1]) : -1;
            report.def = compacting[5].querySelector('.ctn.fright') ? Util.formatFromUnits(compacting[5].querySelector('.ctn.fright').innerText.split(':')[1]) : -1;
            report.attacked = message.querySelector('.msgAttackIconContainer .fleetHostile') ? true : false;
            report.deleted = this.ogl.cache.reports[report.id]?.deleted ? true : false;
            report.more = this.ogl.cache.reports[report.id]?.more ? true : false;
            report.api = (apiButton.getAttribute('title') || apiButton.getAttribute('data-title') || apiButton.getAttribute('data-api-code')).match(/sr-[a-z0-9-]*/)[0];
            report.isShared = tabID == 11;

            apiButton.setAttribute('data-api-code', report.api);

            if(report.deleted || (report.total + report.fleet < this.ogl.db.options.resourceTreshold && this.ogl.db.options.autoCleanReports))
            {
                this.addToDeleteQueue(report.id);
                return;
            }

            if(!message.querySelector('.ogl_tagPicker'))
            {
                const colorButton = Util.addDom('div',
                {
                    class:'ogl_messageButton',
                    parent:message.querySelector('.msg_actions message-footer-actions')
                });
    
                this.ogl._ui.addTagButton(colorButton, report.coords);
            }

            if(!message.querySelector('.ogl_trashsim'))
            {
                Util.addDom('div',
                {
                    class:'ogl_messageButton material-icons ogl_trashsim',
                    parent:message.querySelector('.msg_actions message-footer-actions'),
                    child:'letter_s',
                    onclick:() =>  window.open(Util.genTrashsimLink(report.api), '_blank')
                });
            }

            if(!message.querySelector('.ogl_ptre') && this.ogl.ptreKey)
            {
                Util.addDom('div',
                {
                    class:'ogl_messageButton material-icons',
                    parent:message.querySelector('.msg_actions message-footer-actions'),
                    child:'ptre',
                    onclick:() => PTRE.postSpyReport(report.api)
                });
            }

            //if(this.spytable?.querySelector(`[data-id="${report.id}"]`) || this.ogl.cache.reports[report.id]) return;

            this.ogl.cache.reports[report.id] = report;
        });

        if(this.ogl.db.options.displaySpyTable)
        {
            this.buildTable();
            tabContent.parentNode.insertBefore(this.spytable, tabContent);
        }

        if(Object.keys(ptreActivities).length > 0) PTRE.postActivities(ptreActivities);
    }

    addToDeleteQueue(id)
    {
        if(this.ogl.cache.reports[id]) this.ogl.cache.reports[id].deleted = true;
        if(this.spytable?.querySelector(`[data-id="${id}"]`)) this.spytable.querySelector(`[data-id="${id}"]`).remove();
        if(document.querySelector(`.msg[data-msg-id="${id}"]`)) document.querySelector(`.msg[data-msg-id="${id}"]`).remove();
        delete this.ogl.cache.reports[id];

        this.deleteQueue.push(id);
    }

    deleteMessage()
    {
        let tokenInput = document.querySelector('[name="token"]');
        if(!this.tokenReady || !tokenInput) return;

        let ids = Array.from(new Set(this.deleteQueue));
        if(ids.length <= 0) return;

        this.tokenReady = false;

        let data =
        {
            ajax:1,
            standalone:1,
            messageId:JSON.stringify(ids),
            token:tokenInput.value,
            action:103
        };

        $.ajax(
        {
            type:'POST',
            url:'?page=messages',
            dataType:'json',
            data:data,
            success:result =>
            {
                tokenInput.value = result.newAjaxToken;
                token = result.newAjaxToken;
                this.tokenReady = true;

                ids.forEach(id =>
                {
                    this.deleteQueue?.splice(this.deleteQueue.indexOf(id), 1);
                });
            },
            error:e =>
            {
                console.log(e);
            }
        });
    }

    buildTable()
    {
        this.spytable.querySelectorAll('[data-id]').forEach(e => e.remove());

        if(document.querySelector('[name="token"]'))
        {
            Util.observe(document.querySelector('[name="token"]'), {attributes:true}, () =>
            {
                setTimeout(() => this.tokenReady = true, 1);
            });
        }

        this.nextTarget = false;
        const isDesc = this.ogl.db.spytableSort?.indexOf('DESC') >= 0;
        const filterKey = this.ogl.db.spytableSort?.replace('DESC', '');

        if(Object.keys(this.ogl.cache.reports).length < 1)
        {
            this.spytable.remove();
            return;
        }

        Object.values(this.ogl.cache.reports).sort(function(a, b)
        {
            return (isDesc && isNaN(a[filterKey])) ? b[filterKey].localeCompare(a[filterKey]) :
            (!isDesc && isNaN(a[filterKey])) ? a[filterKey].localeCompare(b[filterKey]) :
            (isDesc && !isNaN(a[filterKey])) ? b[filterKey] - a[filterKey] :
            a[filterKey] - b[filterKey]
        }).forEach(report =>
        {
            if((this.spytable && this.spytable.querySelector(`[data-id="${report.id}"]`)) || report.isShared) return;

            let age = 0;
            const delta = serverTime.getTime() - report.date;
            if(delta > 86400000) age = Math.floor(delta / (1000 * 3600 * 24)) + LocalizationStrings.timeunits.short.day;
            else if(delta > 3600000) age = Math.floor(delta / (1000 * 3600)) + LocalizationStrings.timeunits.short.hour;
            else age = Math.floor(delta / (1000 * 60)) + LocalizationStrings.timeunits.short.minute;

            let bonusFleetSpeed = this.ogl.server.warFleetSpeed == 1 ? 0.42 : 0;
            let bonusCargo = 1 + (Math.ceil(delta / 3600000) * .042) + bonusFleetSpeed; // +4.2% cargo per hour (100% per 24h)

            const requiredShips = this.ogl._fleet.shipsForResources(this.ogl.db.options.defaultShip, report.total * bonusCargo);

            let spyLine = Util.addDom('div', { class:'ogl_spyLine', parent:this.spytable, 'data-id':report.id });

            let div = Util.addDom('div',
            {
                parent:spyLine,
                child:
                `
                    <span class="ogl_textCenter"></span>
                    <span class="ogl_textCenter tooltip" data-title="${this.ogl._time.convertTimestampToDate(report.date, true).innerHTML}">${age}</span>
                    <span class="ogl_activity ogl_textCenter">${report.activity < 15 ? '*' : report.activity}</span>
                    <span class="ogl_type"></span>
                    <span class="ogl_destination"><span data-galaxy="${report.coords.join(':')}">${report.coords.join(':')}</span></span>
                    <a class="${report.status} tooltip overlay" data-title="${report.name}" href="https://${window.location.host}/game/index.php?page=messages&messageId=${report.id}&tabid=20&ajax=1">${report.name}</a>
                    <a class="ogl_reportTotal ogl_textRight tooltip" data-title="${ogl._lang.find(this.ogl.db.options.defaultShip)}: ${Util.formatNumber(requiredShips)}<div class='ogl_sidenote'>+4.2% cargo per hour since the spy</div>" href="https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&galaxy=${report.coords[0]}&system=${report.coords[1]}&position=${report.coords[2]}&type=${report.typeID}&mission=1&am${this.ogl.db.options.defaultShip}=${requiredShips}&oglmode=4" data-value="${report.total}">${Util.formatToUnits(report.total)}</a>
                    <span class="ogl_reportFleet ogl_textRight" data-value="${report.fleet}" style="${report.fleet != 0 ? 'background:linear-gradient(192deg, #622a2a, #3c1717 70%)' : ''}">${report.fleet >= 0 ? Util.formatToUnits(report.fleet, 0) : '?'}</span>
                    <span class="ogl_textRight" style="${report.def != 0 ? 'background:linear-gradient(192deg, #622a2a, #3c1717 70%)' : ''}">${report.def >= 0 ? Util.formatToUnits(report.def, 0) : '?'}</span>
                    <span class="ogl_actions"></span>
                `
            });

            if(report.activity <= 15) div.querySelector('.ogl_activity').classList.add('ogl_danger');
            else if(report.activity < 60) div.querySelector('.ogl_activity').classList.add('ogl_warning');

            if(report.total >= this.ogl.db.options.resourceTreshold) div.querySelector('.ogl_reportTotal').classList.add('ogl_important');

            

            // spy action
            this.addSpyIcons(div.querySelector('.ogl_type'), report.coords, report.type);

            if(document.querySelector(`.msg[data-msg-id="${report.id}"]`))
            {
                const message = document.querySelector(`.msg[data-msg-id="${report.id}"]`);
                report.attacked = message.querySelector('.msgAttackIconContainer .fleetHostile') ? true : false;
                this.ogl.cache.reports[report.id].attacked = report.attacked;
            }

            if(report.attacked)
            {
                Util.addDom('div', {class:'material-icons ogl_fleetIcon ogl_mission1', parent:div.querySelector('.ogl_type')});
            }

            if(!report.attacked && report.def === 0 && report.fleet === 0 && !this.nextTarget) this.nextTarget = report;

            this.ogl._ui.addTagButton(div.querySelector('.ogl_destination'), report.coords.join(':'));

            // details action
           /* Util.addDom('a',
            {
                class:'ogl_button material-icons msg_action_link overlay',
                parent:div.querySelector('.ogl_actions'),
                child:'expand_content',
                href:`https://${window.location.host}/game/index.php?page=messages&messageId=${report.id}&tabid=20&ajax=1`
            });*/

            // more action
            const moreBtn = Util.addDom('div',
            {
                class:'ogl_button material-icons ogl_moreButton',
                parent:div.querySelector('.ogl_actions'),
                child:'more_horiz',
                onclick:() =>
                {
                    if(spyLine.querySelector('.ogl_more'))
                    {
                        spyLine.querySelector('.ogl_more').remove();
                        delete report.more;
                    }
                    else
                    {
                        document.querySelectorAll('.ogl_more').forEach(e =>
                        {
                            e.parentNode.querySelector('.ogl_moreButton').click();
                        });

                        let currentRes = report.allResources;
                        let currentRenta = 0;

                        const moreDiv = Util.addDom('div', { class:'ogl_more', parent:spyLine });

                        for(let i=0; i<6; i++)
                        {
                            currentRenta = Math.floor(currentRes * report.loot / 100);
                            currentRes = currentRes - currentRenta;

                            const subLine = Util.addDom('div', { parent:moreDiv, child:`<div>${Util.formatToUnits(currentRenta)}</div>` });

                            this.ogl.fretShips.forEach(shipID =>
                            {
                                const shipsCount = this.ogl._fleet.shipsForResources(shipID, Math.round(currentRenta * 1.07)); // +7%
                                Util.addDom('a',
                                {
                                    class:`ogl_icon ogl_${shipID}`,
                                    parent:subLine,
                                    child:shipsCount.toLocaleString('de-DE') || '0',
                                    href:`https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&galaxy=${report.coords[0]}&system=${report.coords[1]}&position=${report.coords[2]}&type=${report.typeID}&mission=1&am${shipID}=${shipsCount}&oglmode=4&oglLazy=true`
                                });
                            });

                            report.more = true;
                        }
                    }
                }
            });
            if(report.more) moreBtn.click();

            // attack action
            const attackBtn = Util.addDom('a',
            {
                class:'ogl_button material-icons',
                parent:div.querySelector('.ogl_actions'),
                child:'target',
                href:`https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&galaxy=${report.coords[0]}&system=${report.coords[1]}&position=${report.coords[2]}&type=${report.typeID}&mission=1`
                //onclick:() => document.querySelector(`.msg[data-msg-id="${report.id}"] .icon_attack`).click()
            });
            if(report.attacked) attackBtn.classList.add('ogl_mission1');

            // trashsim action
            Util.addDom('div',
            {
                class:'ogl_button material-icons',
                parent:div.querySelector('.ogl_actions'),
                child:'letter_s',
                onclick:() =>  window.open(Util.genTrashsimLink(report.api), '_blank')
            });

            if(this.ogl.ptreKey)
            {
                // ptre action
                Util.addDom('div',
                {
                    class:'ogl_button material-icons',
                    parent:div.querySelector('.ogl_actions'),
                    child:'ptre',
                    onclick:() => PTRE.postSpyReport(report.api)
                });
            }

            // delete action
            Util.addDom('div',
            {
                class:'ogl_button material-icons',
                parent:div.querySelector('.ogl_actions'),
                child:'close',
                onclick:() => this.addToDeleteQueue(report.id)
            });

            /*if(report.total < this.ogl.db.options.resourceTreshold && report.fleet < this.ogl.db.options.resourceTreshold)
            {
                this.addToDeleteQueue(report.id)
            }*/
        });

        let total = 0;
        this.spytable.querySelectorAll('.ogl_reportTotal').forEach(e => total += parseInt(e.getAttribute('data-value')));
        this.spytable.setAttribute('data-total', 'Total: '+Util.formatNumber(total));
    }

    checkRaids(tabID, ignored)
    {
        const activeSubtab = document.querySelector(`.ui-tabs-tab[data-tabid="${tabID}"]`).getAttribute('aria-labelledby');
        const tabContent = document.querySelector(`.ui-tabs-panel[aria-labelledby="${activeSubtab}"]`);
        const messages = tabContent.querySelectorAll('.msg');

        messages.forEach(message =>
        {
            if(message.querySelector('.ogl_battle') || !message.querySelector('.combatLeftSide')) return;

            const id = message.getAttribute('data-msg-id');
            const apiButton = message.querySelector('.icon_apikey');
            const api = (apiButton.getAttribute('title') || apiButton.getAttribute('data-title') || apiButton.getAttribute('data-api-code')).match(/cr-[a-z0-9-]*/)[0];

            apiButton.setAttribute('data-api-code', api);

            Util.addDom('div',
            {
                class:'ogl_battle',
                before:message.querySelector('.msg_actions'),
                child:'<div class="ogl_loading"></div>'
            });
            
            if(this.ogl.cache.raids[id])
            {
                this.buildRecap(this.ogl.cache.raids[id], message);
            }
            else
            {
                this.ogl._fetch.pending.push(
                {
                    url:`https://${window.location.host}/game/index.php?page=messages&messageId=${id}&tabid=21&ajax=1`,
                    callback:data =>
                    {
                        const result = JSON.parse(data.match(/{(.*)}/g));

                        if(!result?.event_time)
                        {
                            return; // fix error 503
                        }

                        const battle = {};
                        battle.id = id;
                        battle.isExpe = result.coordinates.position === 16;
                        battle.messageType = 'raid';
                        battle.resultType = 'raid';
                        battle.date = new Date(parseInt(message.querySelector('[data-time-server]').getAttribute('data-time-server')));
                        battle.type = battle.isExpe ? 'expe' : 'raid';
                        battle.fleetID = [];
                        battle.isAttacker = false;
                        battle.isDefender = false;
                        battle.probesOnly = false;
                        battle.debris = { metal:result.debris.metal, crystal:result.debris.crystal, deut:result.debris.deuterium };
                        battle.loss = {};
                        battle.recap = {};

                        Object.values(result.attackerJSON.member).forEach(v => { if(v && v.ownerID == this.ogl.account.id) { battle.fleetID.push(v.fleetID); battle.isAttacker = true; }});
                        Object.values(result.defenderJSON.member).forEach(v => { if(v && v.ownerID == this.ogl.account.id) { battle.fleetID.push(v.fleetID); battle.isDefender = true; }});

                        const sign = battle.isDefender ? -1 : 1;
                        battle.loot = { metal:result.loot.metal*sign, crystal:result.loot.crystal*sign, deut:result.loot.deuterium*sign, food:result.loot.food*sign };

                        let atkRounds = result.attackerJSON.combatRounds;
                        let defRounds = result.defenderJSON.combatRounds;

                        battle.fleetID.forEach(fleet =>
                        {
                            // probes only
                            if(Object.keys(Object.values(atkRounds[0].ships)[0]).length == 1 && Object.keys(Object.values(atkRounds[0].ships)[0])[0] == 210) battle.probesOnly = true;
                        
                            // defender losses
                            for(let [shipID, value] of Object.entries(defRounds[defRounds.length-1].losses?.[fleet] || {}))
                            {
                                battle.loss[-shipID] = (battle.loss[-shipID] || 0) + parseInt(value);
                            }
    
                            // attacker losses
                            for(let [shipID, value] of Object.entries(atkRounds[atkRounds.length-1].losses?.[fleet] || {}))
                            {
                                battle.loss[-shipID] = (battle.loss[-shipID] || 0) + parseInt(value);
                            }
                        });

                        // repaired
                        if(result.defender?.[0]?.ownerID == this.ogl.account.id)
                        {
                            for(let [shipID, value] of Object.entries(result.repairedDefense))
                            {
                                battle.loss[-shipID] = (battle.loss[-shipID] || 0) - parseInt(value);
                            }
                        }

                        for(let [shipID, value] of Object.entries(battle.loss))
                        {
                            Object.entries(Datafinder.getTech(Math.abs(shipID))).forEach(x => battle.recap[x[0]] += (x[1] * value))
                        }

                        this.ogl.cache.raids[id] = battle;
                        this.buildRecap(battle, message);
                        if(!battle.probesOnly && !ignored) this.updateStats(battle);
                    }
                });
            }

            Util.addDom('div',
            {
                class:'ogl_messageButton tooltip',
                'data-title':'Convert with OGotcha',
                parent:message.querySelector('.msg_actions message-footer-actions'),
                child:'O',
                onclick:() =>  window.open(Util.genOgotchaLink(api), '_blank')
            });

            Util.addDom('div',
            {
                class:'ogl_messageButton tooltip',
                'data-title':'Convert with TopRaider',
                parent:message.querySelector('.msg_actions message-footer-actions'),
                child:'T',
                onclick:() =>  window.open(Util.genTopRaiderLink(api), '_blank')
            });
        });
    }

    checkExpeditions()
    {
        const maxValue = this.ogl.calcExpeditionMax().max;

        let messages = document.querySelectorAll('#ui-id-2 div[aria-hidden="false"] .msg');
        messages.forEach(message =>
        {
            if(message.querySelector('.ogl_battle')) return;
            if(message.querySelector('.msg_title').innerText.indexOf(':16]') == -1) return;

            const result = {};
            result.id = message.getAttribute('data-msg-id');
            result.date = new Date(parseInt(message.querySelector('[data-time-server]').getAttribute('data-time-server')));
            result.messageType = 'expe';
            result.gain = {};

            const typeList = ['metal','crystal','deut','dm',202,203,204,205,206,207,208,209,210,211,213,214,215,217,218,219];
            const regex = new RegExp(/\.|,|\(|\)|:/, 'g');
            const regexSpace = new RegExp(/( de | de$)/, 'g')
            const content = message.querySelector('.msg_content').innerText.replace(regex, '').replace(regexSpace, ' ').toLowerCase();

            Util.addDom('div',
            {
                class:'ogl_battle',
                before:message.querySelector('.msg_actions'),
                child:'<div class="ogl_loading"></div>'
            });

            // check if report contains early/late/alien/pirate/trader/blackhole
            for(let [typeID, substrings] of Object.entries(this.expeResults || {}))
            {
                if(substrings.some(value => content.includes(value.replace(regex, '').replace(regexSpace, ' ').toLowerCase())))
                {
                    result.resultType = typeID;
                }
            }

            if(!result.resultType)
            {
                // check if report contains resources/ships
                typeList.forEach(typeID =>
                {
                    const typeRaw = this.ogl._lang.find(typeID).replace(regex, '').replace(regexSpace, ' ').toLowerCase();
                    const typeName = this.ogl._lang.find(typeID, true).replace(regex, '').replace(regexSpace, ' ').toLowerCase();
                    const regexBefore = new RegExp(`(\\d+) (?:${typeName}|${typeRaw})`, 'g');
                    const regexAfter = new RegExp(`(?:${typeName}|${typeRaw}) (\\d+)`, 'g');
                    const foundValue = parseInt(regexBefore.exec(content)?.[1]?.replace(/\D/g,'') || regexAfter.exec(content)?.[1]?.replace(/\D/g,''));
    
                    if(foundValue || foundValue == 0)
                    {
                        result.resultType = !isNaN(typeID) ? 'ship' : typeID == 'dm' ? 'darkmatter' : 'resource';
                        result.gain[typeID] = foundValue;
    
                        if(typeID == 'metal')
                        {
                            result.percentage = 100 - Math.round(((maxValue - parseInt(foundValue)) / maxValue) * 100);
                        }
                        else if(typeID == 'crystal')
                        {
                            result.percentage = 100 - Math.round(((maxValue - parseInt(foundValue) * 2) / maxValue) * 100);
                        }
                        else if(typeID == 'deut')
                        {
                            result.percentage = 100 - Math.round(((maxValue - parseInt(foundValue) * 3) / maxValue) * 100);
                        }
                    }
                });
    
                // item
                if(message.querySelector('.msg_content a[href*="page=shop"]'))
                {
                    result.resultType = 'item';
                }
            }

            if(this.ogl.db.options.debugMode)
            {
                this.ogl.cache.expeFix = this.ogl.cache.expeFix || {};
    
                if(this.ogl.account.lang == 'fr')
                {
                    this.ogl.cache.expeFix[result.id] = result.resultType;
                }
            }

            // nothing
            if(!result.resultType)
            {
                console.log('OGL: unkown expedition type');

                if(this.ogl.db.options.debugMode && this.ogl.cache.expeFix[result.id] && this.expeResults[this.ogl.cache.expeFix[result.id]])
                {
                    this.expeResUpdated = true;
                    this.expeResults[this.ogl.cache.expeFix[result.id]].push(content.slice(0, 40));
                }

                return;
            }
            else
            {
                message.querySelector('.msg_content').classList.add('ogl_hidden');
            }

            message.setAttribute('data-msgType', 'expe');

            this.buildRecap(result, message);
            this.updateStats(result);

            document.cookie = `oglocale=${this.ogl.account.lang}`;
        });

        if(this.expeResUpdated)
        {
            localStorage.setItem('ogl_tempExpe', JSON.stringify(this.expeResults));
        }
    }

    checkDiscovery()
    {
        let messages = document.querySelectorAll('#ui-id-2 div[aria-hidden="false"] .msg');
        messages.forEach(message =>
        {
            if(message.querySelector('.ogl_battle')) return;

            Util.addDom('div',
            {
                class:'ogl_battle',
                before:message.querySelector('.msg_actions'),
                child:'<div class="ogl_loading"></div>'
            });

            const result = {};
            result.id = message.getAttribute('data-msg-id');
            result.date = new Date(parseInt(message.querySelector('[data-time-server]').getAttribute('data-time-server')));
            result.messageType = 'discovery';
            result.gain = {};

            if(message.querySelector('.lifeform-item-icon'))
            {
                result.resultType = message.querySelector('.lifeform-item-icon').className.replace('lifeform-item-icon ', '');
                result.gain[result.resultType] = '?';
            }
            else
            {
                let amount = message.querySelector('.msg_content').innerHTML.replace(/<a(.*)<\/a>/g, '').replace(LocalizationStrings.thousandSeperator, '').match(/\d+/g) || [0];
                amount = parseInt(amount[amount.length-1]);

                if(amount)
                {
                    result.resultType = 'artefact';
                    result.gain[result.resultType] = amount;
                }
                else
                {
                    result.resultType = 'nothing';
                }
            }

            message.querySelector('.msg_content').classList.add('ogl_hidden');
            message.setAttribute('data-msgType', 'discovery');

            this.buildRecap(result, message);
            this.updateStats(result);
        });
    }

    checkRR()
    {
        let messages = document.querySelectorAll('#ui-id-2 div[aria-hidden="false"] .msg');
        messages.forEach(message =>
        {
            if(message.querySelector('.ogl_battle')) return;

            const recapDiv = Util.addDom('div',
            {
                class:'ogl_battle',
                before:message.querySelector('.msg_actions'),
                child:'<div class="ogl_loading"></div>'
            });

            const apiButton = message.querySelector('.icon_apikey');
            if(apiButton)
            {
                const api = (apiButton.getAttribute('title') || apiButton.getAttribute('data-title') || apiButton.getAttribute('data-api-code')).match(/rr-[a-z0-9-]*/)[0];
                apiButton.setAttribute('data-api-code', api);
            }

            const regex = new RegExp(/\.|,|\(|\) | de |:/, 'g');
            const content = message.querySelector('.msg_content').innerText.replace(regex, '');
            const numberList = content.match(/\d+/g);
            const typeList = ['metal', 'crystal', 'deut'];

            const result = {};
            result.id = message.getAttribute('data-msg-id');
            result.date = new Date(parseInt(message.querySelector('[data-time-server]').getAttribute('data-time-server')));
            result.messageType = message.querySelector('.msg_title').innerText.indexOf(':16]') == -1 ? 'debris' : 'debris16';
            result.resultType = 'debris';
            result.gain = {};

            typeList.forEach((typeID, index) =>
            {
                if(!typeID || !apiButton) return;

                const foundValue = parseInt(numberList[numberList.length + index - 3]);
                result.gain[typeID] = foundValue;
            });

            if(Object.entries(result).length <= 0 || !apiButton)
            {
                recapDiv.remove();
                return;
            }

            this.buildRecap(result, message);
            this.updateStats(result);
        });
    }

    checkDialog()
    {
        if(serverTime.getTime() - this.dialogDelay < 500) return;
        this.dialogDelay = serverTime.getTime();

        const dialog = document.querySelector('.ui-dialog');
        const id = dialog.querySelector('.detail_msg')?.getAttribute('data-msg-id');
        const isCombat = dialog.querySelector('[data-combatreportid]');
        const isSpy = dialog.querySelector('[data-message-type="10"]');

        if(id && isCombat)
        {
            const apiButton = dialog.querySelector('.icon_apikey');
            const api = (apiButton.getAttribute('title') || apiButton.getAttribute('data-title') || apiButton.getAttribute('data-api-code')).match(/cr-[a-z0-9-]*/)[0];
            apiButton.setAttribute('data-api-code', api);

            Util.addDom('div',
            {
                class:'ogl_messageButton tooltip',
                'data-title':'Convert with OGotcha',
                parent:dialog.querySelector('.msg_actions'),
                child:'O',
                onclick:() =>  window.open(Util.genOgotchaLink(api), '_blank')
            });

            Util.addDom('div',
            {
                class:'ogl_messageButton tooltip',
                'data-title':'Convert with TopRaider',
                parent:dialog.querySelector('.msg_actions'),
                child:'T',
                onclick:() =>  window.open(Util.genTopRaiderLink(api), '_blank')
            });
        }
        else if(id && isSpy)
        {
            const params = new URLSearchParams(dialog.querySelector('.msg_title a')?.href);
            const coords = [params.get('galaxy') || "0", params.get('system') || "0", params.get('position') || "0"];
            const apiButton = dialog.querySelector('.icon_apikey');
            const api = (apiButton.getAttribute('title') || apiButton.getAttribute('data-title') || apiButton.getAttribute('data-api-code')).match(/sr-[a-z0-9-]*/)[0];
            apiButton.setAttribute('data-api-code', api);

            if(!dialog.querySelector('.ogl_tagPicker'))
            {
                const colorButton = Util.addDom('div',
                {
                    class:'ogl_messageButton',
                    parent:dialog.querySelector('.msg_actions')
                });
    
                this.ogl._ui.addTagButton(colorButton, coords);
            }

            if(!dialog.querySelector('.ogl_trashsim'))
            {
                Util.addDom('div',
                {
                    class:'ogl_messageButton material-icons ogl_trashsim',
                    parent:dialog.querySelector('.msg_actions'),
                    child:'letter_s',
                    onclick:() =>  window.open(Util.genTrashsimLink(api), '_blank')
                });
            }

            if(!dialog.querySelector('.ogl_ptre') && this.ogl.ptreKey)
            {
                Util.addDom('div',
                {
                    class:'ogl_messageButton material-icons',
                    parent:dialog.querySelector('.msg_actions'),
                    child:'ptre',
                    onclick:() => PTRE.postSpyReport(api)
                });
            }
        }
    }

    buildRecap(data, message)
    {
        const domRecap = message.querySelector('.ogl_battle');
        domRecap.setAttribute('data-resultType', data.resultType || 'unknown');
        domRecap.innerText = '';

        if(!message.querySelector(`.ogl_checked`)) Util.addDom('div', { class:'material-icons ogl_checked ogl_mainIcon tooltipLeft', child:'oglight_simple', title:this.ogl._lang.find('oglMessageDone'), parent:message.querySelector('.msg_title') });

        if(document.querySelector('#ogame-tracker-menu'))
        {
            domRecap.classList.add('ogl_hidden');
            message.querySelector('.msg_content').classList.remove('ogl_hidden');
            return;
        }

        if(message.querySelector('.msg_content').classList.contains('ogl_hidden'))
        {
            domRecap.classList.add('ogl_clickable');
            domRecap.addEventListener('click', () => { message.querySelector('.msg_content').classList.toggle('ogl_hidden') });
        }

        const recap = {};
        
        if(data.percentage)
        {
            domRecap.setAttribute('data-title', `${data.percentage}% max.`);
            domRecap.classList.add('tooltip');
        }

        if(data.messageType == 'raid')
        {
            // fight loot
            for(let [res, amount] of Object.entries(data.loot || {}))
            {
                recap[res] = (recap[res] || 0) + amount;
            }
    
            // fight loss
            for(let [shipID, amount] of Object.entries(data.loss || {}))
            {
                for(let [res, value] of Object.entries(Datafinder.getTech(Math.abs(shipID)) || {}))
                {
                    recap[res] = (recap[res] || 0) - value * amount;
                }
            }
    
            // recap div
            ['metal', 'crystal', 'deut'].forEach(res =>
            {
                const loot = recap[res];
                const debris = data.debris?.[res] || 0;

                if(loot + debris !== 0) Util.addDom('span', { class:`ogl_icon ogl_${res}`, child:`<span class="${loot >= 0 ? '': 'ogl_danger'}">${Util.formatNumber(loot)}</span><span>${Util.formatNumber(debris)}</span>`, parent:domRecap });
            });

            // hide empty recap
            if(domRecap.innerText == '') domRecap.classList.add('ogl_hidden');
        }
        else if(data.messageType == 'expe' || data.messageType == 'discovery' || data.messageType == 'debris' || data.messageType == 'debris16')
        {
            if(Object.keys(data.gain || {}).length > 0)
            {
                for(let [id, amount] of Object.entries(data.gain || {}))
                {
                    Util.addDom('span', { class:`ogl_icon ogl_${id}`, child:`${amount != '?' ? Util.formatNumber(amount) : ''}`, parent:domRecap });
                }
            }
            else
            {
                Util.addDom('span', { class:`ogl_icon`, child:this.ogl._lang.find(data.resultType), parent:domRecap });
            }
        }
    }

    updateStats(data)
    {
        const stats = this.ogl._stats.getDayStats(data.date.getTime());
        if(stats.ids?.indexOf(data.id) > -1) return;

        if(data.id) // no data.id for blackholes
        {
            stats.ids = stats.ids || [];
            stats.ids.push(data.id);
        }

        const type = data.messageType == 'raid' && data.type == 'expe' ? data.type : data.messageType;

        // expe, raid, discovery, debris, debris16, blackhole
        stats[type] = stats[type] || {};

        // count
        stats[type].count = (stats[type].count || 0) + 1;

        if(data.messageType == 'raid' && data.type == 'expe') // raid p16 occurences
        {
            stats[type].count = (stats[type].count || 0) - 1;
        }
        else if(type == 'expe' || type == 'discovery') // expe & discovery occurences
        {
            stats[type].occurence = stats[type].occurence || {};
            stats[type].occurence[data.resultType] = (stats[type].occurence[data.resultType] || 0) + 1;
        }

        // gain
        for(let [gainID, amount] of Object.entries(data.gain || {}))
        {
            if(amount > 0)
            {
                stats[type].gain = stats[type].gain || {};
                stats[type].gain[gainID] = (stats[type].gain[gainID] || 0) + (amount == '?' ? 1 : amount);
            }
        }

        // loot
        for(let [lootID, amount] of Object.entries(data.loot || {}))
        {
            if(amount > 0)
            {
                stats[type].gain = stats[type].gain || {};
                stats[type].gain[lootID] = (stats[type].gain[lootID] || 0) + (amount == '?' ? 1 : amount);
            }
        }

        // loss
        for(let [lossID, amount] of Object.entries(data.loss || {}))
        {
            if(amount > 0)
            {
                stats[type].gain = stats[type].gain || {};
                stats[type].gain[lossID] = (stats[type].gain[lossID] || 0) + (amount == '?' ? 1 : amount);
            }
        }

        this.ogl._stats.miniStats();

        // notify the player with gains / losses
        const notificationData = {};

        ['loot', 'loss', 'gain'].forEach(gainType =>
        {
            for(let [gainID, amount] of Object.entries(data[gainType] || {}))
            {
                const sign = !isNaN(gainID) && gainID < 0 ? -1 : 1;
                const gid = !isNaN(gainID) ? Math.abs(gainID) : gainID;
                notificationData[gid] = (notificationData[gid] || 0) + amount * sign;
            }
        });

        if(data.resultType && data.resultType != 'artefact')
        {
            notificationData[data.resultType] = (notificationData[data.resultType] || 0) + 1;
        }

        if(!document.querySelector('#ogame-tracker-menu')) this.ogl._notification.addToQueue(false, undefined, notificationData);
    }

    addBoardTab()
    {
        const div = Util.addDom('div', { id:'oglBoardTab', parent:document.querySelector('.js_tabs') });
        const ctn = Util.addDom('div', { class:'tab_ctn', parent:div });
        const inner = Util.addDom('div', { class:'tab_inner', parent:ctn }); 
        const li = Util.addDom('li', { class:'list_item ui-tabs-tab ui-corner-top ui-state-default ui-tab ogl_boardMessageTab', parent:document.querySelector('ul.tabs_btn'), onclick:() =>
        {
            if(li.querySelector('.new_msg_count')) li.querySelector('.new_msg_count').remove();

            if(div.innerText != '') return;

            inner.innerHTML = '<div class="ogl_wrapperloading"><div class="ogl_loading"></div></div>';

            GM_xmlhttpRequest(
            {
                method:'GET',
                url:'https://board.fr.ogame.gameforge.com/index.php?board-feed/101/',
                onload:result =>
                {
                    const xml = new DOMParser().parseFromString(result.responseText, 'text/xml');
                    const items = xml.querySelectorAll('item');

                    inner.innerHTML = '';

                    items.forEach((item, index) =>
                    {
                        const rawDate = new Date(item.querySelector('pubDate').textContent);
                        const date = rawDate.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'});
                        const time = rawDate.toLocaleTimeString('de-DE');
                        const msg = Util.addDom('div', { class:'msg', parent:inner });

                        Util.addDom('span', { class:'msg_title blue_txt', parent:msg, child:`${item.querySelector('title').textContent}<br><i>@${item.getElementsByTagName('dc:creator')[0].textContent}</i>`, onclick:() =>
                        {
                            window.open(item.querySelector('link').textContent, '_blank');
                        }});

                        Util.addDom('span', { class:'msg_date fright ogl_CustomMessagedate', parent:msg, child:`${date} ${time}` });
                        Util.addDom('div', { class:'msg_content', parent:msg, child:item.getElementsByTagName('content:encoded')[0].textContent });

                        if(index == 0) this.ogl.db.lastBoardPosts[1] = rawDate.getTime();
                    });

                    this.ogl._time.updateList.push('.ogl_CustomMessagedate');

                    this.ogl.db.lastBoardPosts[0] = 0;
                    this.ogl.db.lastBoardPosts[2] = Date.now();
                }
            });
        }});

        li.innerHTML =
        `
            <a href="#oglBoardTab" class="tabs_btn_img" role="presentation" tabindex="-1">
                <div class="material-icons">menu_book</div>
                <span class="icon_caption">Board.fr</span>
                <div class="marker"></div>
            </a>
        `;

        if(this.ogl.db.lastBoardPosts[0] > 0) Util.addDom('span', { class:'new_msg_count', child:this.ogl.db.lastBoardPosts[0], parent:li.querySelector('a') });

        $('.js_tabs').tabs("refresh");
    }

    checkBoard()
    {
        if(typeof GM_xmlhttpRequest === 'undefined' || this.ogl.server.lang != 'fr' || !this.ogl.db.options.boardTab) return;

        this.ogl.db.lastBoardPosts = this.ogl.db.lastBoardPosts || [0, 0, 0]; // count, last post, last check

        if(Date.now() > this.ogl.db.lastBoardPosts[2] + 3600000) // 1h
        {
            GM_xmlhttpRequest(
            {
                method:'GET',
                url:'https://board.fr.ogame.gameforge.com/index.php?board-feed/101/',
                onload:result =>
                {
                    const xml = new DOMParser().parseFromString(result.responseText, 'text/xml');
                    this.ogl.db.lastBoardPosts[0] = 0;
        
                    const items = xml.querySelectorAll('item');
                    items.forEach((item, index) =>
                    {
                        const date = new Date(item.querySelector('pubDate').textContent).getTime();
        
                        if(date > this.ogl.db.lastBoardPosts[1])
                        {
                            this.ogl.db.lastBoardPosts[0]++;
                        }

                        if(index == 0) this.ogl.db.lastBoardPosts[1] = date;
                    });
        
                    if(this.ogl.db.lastBoardPosts[0] > 0)
                    {
                        const count = document.querySelector('.comm_menu.messages .new_msg_count') || Util.addDom('span', { class:'new_msg_count totalMessages news' });
                        count.innerText = parseInt((count?.innerText || 0)) + this.ogl.db.lastBoardPosts[0];
                    }

                    this.ogl.db.lastBoardPosts[2] = Date.now();
        
                    if(this.ogl.page == 'messages') this.addBoardTab();
                }
            });
        }
        else
        {
            if(this.ogl.db.lastBoardPosts[0] > 0)
            {
                const count = document.querySelector('.comm_menu.messages .new_msg_count') || Util.addDom('span', { class:'new_msg_count totalMessages news', parent:document.querySelector('.comm_menu.messages') });
                count.innerText = parseInt((count?.innerText || 0)) + this.ogl.db.lastBoardPosts[0];
            }

            if(this.ogl.page == 'messages') this.addBoardTab();
        }
    }

    addSpyIcons(parent, coords, uniqueType, displayActivity)
    {
        coords = typeof coords == typeof '' ? coords = coords.split(':') : coords;

        if(uniqueType == 'planet' || !uniqueType)
        {
            const planetIcon = Util.addDom('div', { class:'material-icons ogl_spyIcon tooltip', 'data-title':this.ogl._lang.find('spyPlanet'), 'data-spy-coords':`${coords[0]}:${coords[1]}:${coords[2]}:1`, child:'language', parent:parent, onclick:e => this.ogl._fleet.addToSpyQueue(6, coords[0], coords[1], coords[2], 1) });
            const lastPlanetSpy = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.spy?.[0] || 0;
            if(serverTime.getTime() - lastPlanetSpy < this.ogl.db.options.spyIndicatorDelay)
            {
                planetIcon.setAttribute('data-spy', 'recent');
                planetIcon.setAttribute('data-title', 'recently spied');
            }

            if(displayActivity)
            {
                const activity = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.acti || [];
                const isRecent = serverTime.getTime() - activity[2] < 3600000;
                const activityDom = Util.addDom('span', { parent:planetIcon, child:isRecent ? activity[0] : '?' });
                (activity[0] == '*' && isRecent) ? activityDom.classList.add('ogl_danger') : (activity[0] == 60 && isRecent) ? activityDom.classList.add('ogl_ok') : activityDom.classList.add('ogl_warning');
            }
        }
        
        if(uniqueType == 'moon' || (!uniqueType && this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.mid))
        {
            const moonIcon = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.mid > 0 ? Util.addDom('div', { class:'material-icons ogl_spyIcon tooltip', 'data-title':this.ogl._lang.find('spyMoon'), 'data-spy-coords':`${coords[0]}:${coords[1]}:${coords[2]}:3`,child:'bedtime', parent:parent, onclick:e => this.ogl._fleet.addToSpyQueue(6, coords[0], coords[1], coords[2], 3)}) : Util.addDom('div', { parent:parent });
            const lastMoontSpy = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.spy?.[1] || 0;
            if(serverTime.getTime() - lastMoontSpy < this.ogl.db.options.spyIndicatorDelay)
            {
                moonIcon.setAttribute('data-spy', 'recent');
                moonIcon.setAttribute('data-title', 'recently spied');
            }

            if(displayActivity && this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.mid > -1)
            {
                const activity = this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.acti || [];
                const isRecent = serverTime.getTime() - activity[2] < 3600000;
                const activityDom = Util.addDom('span', { parent:moonIcon, child:isRecent ? activity[1] : '?' });
                (activity[1] == '*' && isRecent) ? activityDom.classList.add('ogl_danger') : (activity[1] == 60 && isRecent) ? activityDom.classList.add('ogl_ok') : activityDom.classList.add('ogl_warning');
            }
        }

        if(!uniqueType && ! this.ogl.db.pdb[`${coords[0]}:${coords[1]}:${coords[2]}`]?.mid)
        {
            Util.addDom('div', { parent:parent });
        }
    }
}


class MovementManager extends Manager
{
    load(reload)
    {
        this.ogl.cache.movements = this.ogl.cache.movements || {};

        if(!reload)
        {
            refreshFleetEvents = force =>
            {
                if(!eventlistLink) return;
    
                document.querySelector('#eventboxContent').innerHTML = '<img height="16" width="16" src="//gf3.geo.gfsrv.net/cdne3/3f9884806436537bdec305aa26fc60.gif" />';
    
                fetch(eventlistLink, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                .then(response => response.text())
                .then(data =>
                {
                    $('#eventboxContent').html(data);
                    toggleEvents.loaded = true;
    
                    let movements = {};
                    let ignored = [];
    
                    let xml = new DOMParser().parseFromString(data, 'text/html');
                    xml.querySelectorAll('#eventContent tbody tr').forEach(line =>
                    {
                        const tooltip = Util.addDom('div', {child:(line.querySelector('.icon_movement .tooltip') || line.querySelector('.icon_movement_reserve .tooltip'))?.getAttribute('title')});
                        const movement = {};
                        movement.id = parseInt(line.getAttribute('id').replace('eventRow-', ''));
                        movement.mission = line.getAttribute('data-mission-type');
                        movement.isBack = line.getAttribute('data-return-flight') === 'true';
                        movement.arrivalTime = parseInt(line.getAttribute('data-arrival-time')) * 1000;
    
                        ignored.push(movement.id + 1);
                        if(ignored.indexOf(movement.id) > -1) return;
    
                        movement.from = {};
                        movement.from.anotherPlayer = !Boolean(Array.from(document.querySelectorAll('#planetList .planet-koords')).find(p => p.innerText === line.querySelector('.coordsOrigin').innerText.trim().slice(1, -1)));
                        movement.from.isMoon = Boolean(line.querySelector('.originFleet figure.moon'));
                        movement.from.coords = line.querySelector('.coordsOrigin').innerText.trim().slice(1, -1);
    
                        movement.to = {};
                        movement.to.anotherPlayer = !Boolean(Array.from(document.querySelectorAll('#planetList .planet-koords')).find(p => p.innerText === line.querySelector('.destCoords').innerText.trim().slice(1, -1)));
                        movement.to.isMoon = Boolean(line.querySelector('.destFleet figure.moon'));
                        movement.to.coords = line.querySelector('.destCoords').innerText.trim().slice(1, -1);
    
                        if((movement.mission == 1 || movement.mission == 6) && movement.from.anotherPlayer)
                        {
                            const dest = Array.from(document.querySelectorAll('#planetList .planet-koords')).find(p => p.innerText === line.querySelector('.destCoords').innerText.trim().slice(1, -1));
                            
                            if(dest)
                            {
                                const destSmallPlanet = dest.closest('.smallplanet');
                                const destTarget = movement.to.isMoon ? destSmallPlanet.querySelector('.moonlink') : destSmallPlanet.querySelector('.planetlink');
                                destTarget.classList.add('ogl_attacked');
                            }
                        }
    
                        tooltip.querySelectorAll('.fleetinfo tr').forEach(subline =>
                        {
                            if(subline.querySelector('td') && subline.querySelector('.value'))
                            {
                                let name = subline.querySelector('td').innerText.replace(':', '');
                                let key = Object.entries(this.ogl.db.serverData).find(entry => entry[1] === name)?.[0];
                                let value = subline.querySelector('.value').innerText.replace(/\.|,| /g, '');
    
                                if(key) movement[key] = Number(value);
                            }
                        });
    
                        let target;
                        if(movement.isBack) target = movement.from.coords + ':B';
                        else if(movement.to.anotherPlayer) target = movement.from.coords;
                        else if(movement.from.anotherPlayer) target = movement.to.coords + ':B';
                        else target = movement.to.coords;
    
                        if(target)
                        {
                            movements[target] = movements[target] || [];
                            movements[target].push(movement);
                        }
                    });
    
                    this.ogl.cache.movements = movements;
                    
                    document.querySelectorAll('.smallplanet').forEach(planet =>
                    {
                        const coords = planet.querySelector('.planet-koords').innerText;
                        planet.querySelectorAll('.ogl_fleetIcon').forEach(e => e.remove());
            
                        if(this.ogl.cache?.movements?.[coords])
                        {
                            this.addFleetIcon(this.ogl.cache.movements[coords], planet);
                        }
            
                        if(this.ogl.cache?.movements?.[coords+':B'])
                        {
                            this.addFleetIcon(this.ogl.cache.movements[coords+':B'], planet, true);
                        }
                    });
            
                    Util.runAsync(() =>
                    {
                        this.ogl._ui.displayResourcesRecap();
                        this.ogl._tech.checkTodolist();
                        this.ogl._time.updateMovements(); // /!\ time.updateMovements != this.updateMovements
                    });
                });
            }
        }

        refreshFleetEvents();

        if(this.ogl.page == 'movement' && !reload)
        {
            unsafeWindow['timerHandler'].pageReloadAlreadyTriggered = true; // prevent auto reload
            this.updateMovement();
        }
    }

    addFleetIcon(data, parent, reversed)
    {
        const targetClass = reversed ? 'ogl_sideIconBottom' : 'ogl_sideIconTop';
        const targetDom = parent.querySelector(`.${targetClass}`) || Util.addDom('div', { class:targetClass, parent:parent });

        const icon = Util.addDom('div', { class:`material-icons ogl_fleetIcon ogl_mission${data[0].mission}`, parent:targetDom, 'data-list':data.length, onclick:() =>
        {
            const container = Util.addDom('div', { class:'ogl_sideFleetTooltip' });
            let cumul = { metal:0, crystal:0, deut:0 };

            data.forEach(line =>
            {
                const fleetImg = reversed ? 'https://gf2.geo.gfsrv.net/cdn47/014a5d88b102d4b47ab5146d4807c6.gif' : 'https://gf2.geo.gfsrv.net/cdnd9/f9cb590cdf265f499b0e2e5d91fc75.gif';

                let shipAmount = 0;
                Object.keys(line).filter(element => parseInt(element)).forEach(shipID => shipAmount += line[shipID]);

                const domLine = Util.addDom('div', { class:`ogl_mission${line.mission} ogl_sideFleetIcon`, child:`<div class="material-icons">${line.from.isMoon ? 'bedtime' : 'language'}</div><div>[${line.from.coords}]</div><span>${Util.formatToUnits(shipAmount)}</span><img src="${fleetImg}"><div class="material-icons">${line.mission == 8 ? 'debris' : line.to.isMoon ? 'bedtime' : 'language'}</div><div>[${line.to.coords}]</div>`, parent:container });
            
                ['metal', 'crystal', 'deut'].forEach(res =>
                {
                    Util.addDom('div', { class:`ogl_icon ogl_${res}`, parent:domLine, child:Util.formatToUnits(line[res] || 0) });
                    cumul[res] += line[res]
                });

                domLine.prepend(this.ogl._time.convertTimestampToDate(this.ogl._time.serverToClient(line.arrivalTime)));
            });

            const total = Util.addDom('div', { class:`ogl_sideFleetIcon`, child:`<span></span><span></span><span></span><span></span><span></span><span></span><span></span>`, parent:container });
            ['metal', 'crystal', 'deut'].forEach(res => Util.addDom('div', { class:`ogl_icon ogl_${res}`, parent:total, child:Util.formatToUnits(cumul[res] || 0) }));

            this.ogl._popup.open(container);
        }});
    }

    updateMovement()
    {
        if(document.querySelectorAll('#movementcomponent .reversal a').length > 0)
        {
            document.querySelectorAll('#movementcomponent .reversal a')[0].setAttribute('data-key-color', 'orange');

            Array.from(document.querySelectorAll('#movementcomponent .reversal a')).sort((a, b) => parseInt(b.closest('.fleetDetails').getAttribute('id').replace('fleet', '')) - parseInt(a.closest('.fleetDetails').getAttribute('id').replace('fleet', '')))[0].setAttribute('data-key-color', 'violet');
        }

        document.querySelectorAll('.route a').forEach((route, index) =>
        {
            route.classList.add('tooltipRight');

            const parent = route.closest('.fleetDetails');
            const resourcesBlock = Util.addDom('div', { class:'ogl_resourcesBlock' });
            const timeBlock = Util.addDom('div', { class:'ogl_timeBlock' });
            const actionsBlock = Util.addDom('div', { class:'ogl_actionsBlock' });

            const htmlData = document.querySelector(`#${route.getAttribute('rel')}`);

            // get fleet compo
            htmlData.querySelectorAll('.fleetinfo tr').forEach(subline =>
            {
                if(subline.querySelector('td') && subline.querySelector('.value'))
                {
                    const name = subline.querySelector('td').innerText.replace(':', '');
                    const key = Object.entries(this.ogl.db.serverData).find(entry => entry[1] === name)[0];
                    const value = parseInt(subline.querySelector('.value').innerText.replace(/\.|,| /g, ''));
                    const formattedValue = Util.formatToUnits(value, 0);

                    if(!value) return;

                    if(!isNaN(key))
                    {
                        Util.addDom('div', { class:`ogl_icon ogl_${key}`, child:formattedValue, parent:resourcesBlock });
                    }
                    else
                    {
                        if(key == 'metal') Util.addDom('div', { class:`ogl_icon ogl_${key}`, child:formattedValue, prepend:resourcesBlock });
                        else if(key == 'crystal') Util.addDom('div', { class:`ogl_icon ogl_${key}`, child:formattedValue, after:resourcesBlock.querySelector('.ogl_metal') });
                        else if(key == 'deut') Util.addDom('div', { class:`ogl_icon ogl_${key}`, child:formattedValue, after:resourcesBlock.querySelector('.ogl_crystal') });
                        else if(key == 'food') Util.addDom('div', { class:`ogl_icon ogl_${key}`, child:formattedValue, after:resourcesBlock.querySelector('.ogl_deut') });
                    }
                }
            });

            if(parent.getAttribute('data-mission-type') == 18) // discoveries
            {
                Util.addDom('div', { class:`ogl_icon ogl_metal`, child:0, prepend:resourcesBlock });
                Util.addDom('div', { class:`ogl_icon ogl_crystal`, child:0, prepend:resourcesBlock });
                Util.addDom('div', { class:`ogl_icon ogl_deut`, child:0, prepend:resourcesBlock });
                Util.addDom('div', { class:`ogl_icon ogl_food`, child:0, prepend:resourcesBlock });
            }

            const timeBlockLeft = Util.addDom('div', { class:'ogl_timeBlockLeft', parent:timeBlock });
            const timeBlockRight = Util.addDom('div', { class:'ogl_timeBlockRight', parent:timeBlock });
            timeBlockLeft.appendChild(parent.querySelector('.timer'));
            timeBlockLeft.appendChild(parent.querySelector('.absTime'));
            timeBlockLeft.appendChild(parent.querySelector('.originData'));
            timeBlockLeft.querySelector('.originData').appendChild(timeBlockLeft.querySelector('.originCoords'));
            timeBlockRight.appendChild(parent.querySelector('.destinationData'));
            timeBlockRight.querySelector('.destinationData').appendChild(timeBlockRight.querySelector('.destinationPlanet'));
            if(parent.querySelector('.nextabsTime')) timeBlockRight.appendChild(parent.querySelector('.nextabsTime'));
            else Util.addDom('div', { child:'-', parent:timeBlockRight });
            if(parent.querySelector('.nextTimer')) timeBlockRight.appendChild(parent.querySelector('.nextTimer'));
            else Util.addDom('div', { child:'-', parent:timeBlockRight });
            
            Util.addDom('div', { class:`ogl_icon ogl_mission${parent.getAttribute('data-mission-type')}`, prepend:actionsBlock });
            actionsBlock.appendChild(parent.querySelector('.route a'));
            //if(parent.querySelector('.openDetails')) actionsBlock.appendChild(parent.querySelector('.openDetails'));
            if(parent.querySelector('.fedAttack')) actionsBlock.appendChild(parent.querySelector('.fedAttack'));
            if(parent.querySelector('.sendMail')) actionsBlock.appendChild(parent.querySelector('.sendMail'));

            parent.prepend(resourcesBlock);
            parent.prepend(timeBlock);
            parent.prepend(actionsBlock);
        });

        this.ogl._time.updateMovements();
    }
}


class ShortcutManager extends Manager
{
    load()
    {
        document.querySelector('.ogl_shortCutWrapper')?.remove();
        
        this.keyList = {};
        this.shortCutWrapper = Util.addDom('div', { class:'ogl_shortCutWrapper', child:'<div></div>' });
        this.shortcutDiv = Util.addDom('div', { class:'ogl_shortcuts', parent:this.shortCutWrapper });
        this.locked = false;
        //this.discoveryReady = true;

        if(!this.loaded)
        {
            document.addEventListener('keydown', event =>
            {
                let activeElement = document.activeElement.tagName;

                if(activeElement == 'INPUT' || activeElement == 'TEXTAREA') return;
                else if(this.keyList[event.key.toLowerCase()] && !this.locked && !event.ctrlKey && !event.shiftKey) // can use !event.repeat instead of this.locked
                {
                    //if(event.key.toLowerCase() != this.ogl.db.options.keyboardActions.discovery) this.locked = true;
                    this.locked = true;
                    this.keyList[event.key.toLowerCase()]();
                }
                else if(!isNaN(event.key) && this.keyList['2-9'] && !this.locked && !event.ctrlKey && !event.shiftKey) // can use !event.repeat instead of this.locked
                {
                    this.locked = true;
                    this.keyList['2-9'](event.key);
                }

                if(!event.repeat && event.key.toLowerCase() == 'enter' && this.ogl._tooltip.tooltip.classList.contains('ogl_active') && this.ogl._tooltip.tooltip.querySelector('.ogl_formValidation'))
                {
                    this.ogl._tooltip.tooltip.querySelector('.ogl_formValidation').click();
                }
            });

            document.addEventListener('keyup', () => this.locked = false);

            visualViewport.addEventListener('resize', () => this.updateShortcutsPosition());
            visualViewport.addEventListener('scroll', () => this.updateShortcutsPosition());
        }

        this.loaded = true;

        this.add('menu', () =>
        {
            if(document.querySelector('.ogl_side.ogl_active .ogl_config'))
            {
                this.ogl._ui.side.classList.remove('ogl_active');
                delete this.ogl.db.currentSide;
            }
            else this.ogl._topbar.openSettings();
        });

        this.add('showMenuResources', () =>
        {
            this.ogl.db.options.showMenuResources++;
            if(this.ogl.db.options.showMenuResources > 2) this.ogl.db.options.showMenuResources = 0;
            localStorage.setItem('ogl_menulayout', this.ogl.db.options.showMenuResources);
            document.body.setAttribute('data-menulayout', this.ogl.db.options.showMenuResources);
        });

        this.add('previousPlanet', () =>
        {
            localStorage.setItem('ogl-redirect', false);
            document.body.classList.remove('ogl_destinationPicker');

            if(this.ogl.mode === 1 || this.ogl.mode === 2 || this.ogl.mode === 5)
            {
                if(this.ogl._fleet.redirectionReady) window.location.href = this.ogl.prevRedirection;
            }
            else if(this.ogl.currentPlanet.obj.type == 'planet' || !this.ogl.currentPlanet.dom.prev.querySelector('.moonlink'))
            {
                this.ogl.currentPlanet.dom.prev.querySelector('.planetlink').click();
            }
            else
            {
                this.ogl.currentPlanet.dom.prev.querySelector('.moonlink').click();
            }
        });

        this.add('nextPlanet', () =>
        {
            localStorage.setItem('ogl-redirect', false);
            document.body.classList.remove('ogl_destinationPicker');
                
            if(this.ogl.mode === 1 || this.ogl.mode === 2 || this.ogl.mode === 5)
            {
                if(this.ogl._fleet.redirectionReady) window.location.href = this.ogl.nextRedirection;
            }
            else if(this.ogl.currentPlanet.obj.type == 'planet' || !this.ogl.currentPlanet.dom.next.querySelector('.moonlink'))
            {
                this.ogl.currentPlanet.dom.next.querySelector('.planetlink').click();
            }
            else
            {
                this.ogl.currentPlanet.dom.next.querySelector('.moonlink').click();
            }
        });

        if(!isNaN(this.ogl.db.currentSide) && document.querySelector('.ogl_side.ogl_active'))
        {
            this.add('nextPinnedPosition', () =>
            {
                if(!isNaN(this.ogl.db.currentSide) && document.querySelector('.ogl_side.ogl_active'))
                {
                    const arr = Array.from(document.querySelectorAll('.ogl_pinDetail [data-galaxy]'));
                    const index = arr.findLastIndex(e => e.classList.contains('ogl_active'));
                    const target = Util.reorderArray(arr, index)[1];
    
                    if(target) target.click();
                }
                else
                {
                    fadeBox(this.ogl._lang.find('noCurrentPin'), true);
                }
            });
        }

        if(this.ogl.page == 'fleetdispatch')
        {
            Util.addDom('div', {class:'ogl_separator', parent:this.shortcutDiv});

            this.add('expeditionSC', () => { if(fleetDispatcher.currentPage == 'fleet1') this.ogl._fleet.selectExpedition(202) }, 'fleet');
            this.add('expeditionLC', () => { if(fleetDispatcher.currentPage == 'fleet1') this.ogl._fleet.selectExpedition(203) }, 'fleet');
            this.add('expeditionPF', () => { if(fleetDispatcher.currentPage == 'fleet1') this.ogl._fleet.selectExpedition(219) }, 'fleet');

            this.add('fleetRepeat', () =>
            {
                if(fleetDispatcher.currentPage == 'fleet1')
                {
                    fleetDispatcher.resetShips();
                    Object.values(this.ogl.db.previousFleet.shipsToSend).forEach(ship => fleetDispatcher.selectShip(ship.id, ship.number));
                }

                this.ogl._fleet.setRealTarget(fleetDispatcher.realTarget,
                {
                    galaxy:this.ogl.db.previousFleet.targetPlanet.galaxy,
                    system:this.ogl.db.previousFleet.targetPlanet.system,
                    position:this.ogl.db.previousFleet.targetPlanet.position,
                    type:this.ogl.db.previousFleet.targetPlanet.type,
                    name:this.ogl.db.previousFleet.targetPlanet.name
                });

                fleetDispatcher.selectMission(this.ogl.db.previousFleet.mission);
                fleetDispatcher.cargoMetal = this.ogl.db.previousFleet.cargoMetal;
                fleetDispatcher.cargoCrystal = this.ogl.db.previousFleet.cargoCrystal;
                fleetDispatcher.cargoDeuterium = this.ogl.db.previousFleet.cargoDeuterium;
                fleetDispatcher.realSpeedPercent = this.ogl.db.previousFleet.speedPercent;
                fleetDispatcher.speedPercent = this.ogl.db.previousFleet.speedPercent;

                if(fleetDispatcher.currentPage == 'fleet2')
                {
                    fleetDispatcher.fetchTargetPlayerData();
                }

                if(fleetDispatcher.mission == 15)
                {
                    document.querySelector('#fleet2 #expeditiontime').value = this.ogl.db.previousFleet.expeditionTime;
                    document.querySelector('#fleet2 #expeditiontimeline .dropdown a').innerText = this.ogl.db.previousFleet.expeditionTime;
                    fleetDispatcher.updateExpeditionTime();
                }

                fleetDispatcher.setFleetPercent(fleetDispatcher.realSpeedPercent);

                Object.values(document.querySelector('#speedPercentage'))[0].percentageBarInstance.setValue(fleetDispatcher.realSpeedPercent);

                fleetDispatcher.refresh();
                fleetDispatcher.focusSubmitFleet1();
            }, 'fleet');

            this.add('fleetSelectAll', () =>
            {
                if(fleetDispatcher.currentPage == 'fleet1') fleetDispatcher.selectAllShips();
                else if(fleetDispatcher.currentPage == 'fleet2') fleetDispatcher.selectMaxAll();
                fleetDispatcher.refresh();
            }, 'fleet');

            if(this.ogl.db.quickRaidList && this.ogl.db.quickRaidList.length > 0)
            {
                this.add('quickRaid', () =>
                {
                    if(fleetDispatcher.currentPage == 'fleet1')
                    {
                        fleetDispatcher.resetShips();
    
                        this.ogl._fleet.isQuickRaid = true;
                        
                        const target = this.ogl.db.quickRaidList[0].match(/.{1,3}/g).map(Number);
                        const amount = this.ogl._fleet.shipsForResources(this.ogl.db.options.defaultShip, this.ogl.db.options.resourceTreshold);
                        fleetDispatcher.selectShip(this.ogl.db.options.defaultShip, amount);
    
                        fleetDispatcher.realTarget.galaxy = target[0];
                        fleetDispatcher.realTarget.system = target[1];
                        fleetDispatcher.realTarget.position = target[2];
                        fleetDispatcher.realTarget.type = 1;
                        fleetDispatcher.selectMission(1);
                        fleetDispatcher.targetPlanet.name = `Quick raid ${target.join(':')}`;
                        fleetDispatcher.cargoMetal = 0;
                        fleetDispatcher.cargoCrystal = 0;
                        fleetDispatcher.cargoDeuterium = 0;
                        fleetDispatcher.mission = 1;
                        fleetDispatcher.speedPercent = 10;
    
                        fleetDispatcher.refresh();
                        fleetDispatcher.focusSubmitFleet1();
                    }
                }, 'fleet');
            }

            this.add('fleetReverseAll', () =>
            {
                if(fleetDispatcher.currentPage == 'fleet1')
                {
                    fleetDispatcher.shipsOnPlanet.forEach(ship =>
                    {
                        const delta = ship.number - (fleetDispatcher.findShip(ship.id)?.number || 0);
                        fleetDispatcher.selectShip(ship.id, delta);
                        fleetDispatcher.refresh();
                    });

                    fleetDispatcher.refresh();
                    fleetDispatcher.focusSubmitFleet1();
                }
                else if(fleetDispatcher.currentPage == 'fleet2')
                {
                    ['metal', 'crystal', 'deut', 'food'].forEach(type =>
                    {
                        fleetDispatcher[this.ogl._fleet.cargo[type]] = Math.min(fleetDispatcher[this.ogl._fleet.resOnPlanet[type]] - fleetDispatcher[this.ogl._fleet.cargo[type]], fleetDispatcher.getFreeCargoSpace());
                    });
                    
                    fleetDispatcher.refresh();
                }
            }, 'fleet');

            this.add('fleetResourcesSplit', keyNumber =>
            {
                this.keyNumberClickFleet1 = this.keyNumberClickFleet1 || 0;
                this.keyNumberClickFleet2 = this.keyNumberClickFleet2 || 0;

                if(fleetDispatcher.currentPage == 'fleet1')
                {
                    if(isNaN(keyNumber)) keyNumber = 2 + this.keyNumberClickFleet1;
                    this.keyNumberClickFleet2 = this.keyNumberClickFleet1;
                    this.keyNumberClickFleet1++;
                    if(this.keyNumberClickFleet1 > 7) this.keyNumberClickFleet1 = 0;

                    fleetDispatcher.shipsOnPlanet.forEach(ship => fleetDispatcher.selectShip(ship.id, Math.ceil(ship.number / keyNumber)));
                }
                else if(fleetDispatcher.currentPage == 'fleet2')
                {
                    if(isNaN(keyNumber)) keyNumber = 2 + this.keyNumberClickFleet2;
                    this.keyNumberClickFleet2++;
                    if(this.keyNumberClickFleet2 > 7) this.keyNumberClickFleet2 = 0;

                    let fleetDispatcherResources = ['metalOnPlanet', 'crystalOnPlanet', 'deuteriumOnPlanet'];

                    document.querySelectorAll('#fleet2 #resources .res_wrap').forEach((resource, index) =>
                    {
                        let cargoType = ['cargoMetal', 'cargoCrystal', 'cargoDeuterium'];

                        let currentMax = fleetDispatcher[fleetDispatcherResources[index]];
                        if(index == 2) currentMax -= fleetDispatcher.getConsumption();

                        fleetDispatcher[cargoType[index]] = Math.max(Math.ceil(currentMax / keyNumber), 0);
                        resource.querySelector('input').value = fleetDispatcher[cargoType[index]];

                        //fleetDispatcher.focusSendFleet();
                    });
                }

                fleetDispatcher.refresh();
            });

            Util.addDom('div', { class:'ogl_shortcut ogl_button', 'data-key':'enter', child:'<span class="material-icons">subdirectory_arrow_left</span>', parent:this.shortcutDiv, onclick:() =>
            {
                document.querySelector('#fleetdispatchcomponent').dispatchEvent(new KeyboardEvent('keypress', { keyCode:13 }));
            }});
        }
        else if(this.ogl.page == 'messages')
        {
            Util.addDom('div', {class:'ogl_separator', parent:this.shortcutDiv});

            this.add('enter', () =>
            {
                if(this.ogl._message.nextTarget)
                {
                    const report = this.ogl._message.nextTarget;
                    const shipsCount = this.ogl._fleet.shipsForResources(false, Math.round(report.total * 1.07)); // 7% more resources

                    window.location.href = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&galaxy=${report.coords[0]}&system=${report.coords[1]}&position=${report.coords[2]}&type=${report.type == 3 ? 3 : 1}&mission=1&am${this.ogl.db.options.defaultShip}=${shipsCount}&oglmode=4&oglmsg=${report.id}`;
                }
            });
        }
        else if(this.ogl.page == 'galaxy')
        {
            Util.addDom('div', {class:'ogl_separator', parent:this.shortcutDiv});

            this.add('galaxyUp', () => submitOnKey('ArrowUp'));
            this.add('galaxyLeft', () => submitOnKey('ArrowLeft'));
            this.add('galaxyDown', () => submitOnKey('ArrowDown'));
            this.add('galaxyRight', () => submitOnKey('ArrowRight'));
            this.add('galaxySpySystem', () => document.querySelector('.spysystemlink').click());
            this.add('discovery', () => sendSystemDiscoveryMission());
            /*{
                if(this.discoveryReady)
                {
                    this.discoveryReady = false;
                    const discoveryTarget = document.querySelector('a.planetDiscover');
                    if(discoveryTarget) discoveryTarget.click();
                }
            });*/
        }
        else if(this.ogl.page == 'movement')
        {
            Util.addDom('div', {class:'ogl_separator', parent:this.shortcutDiv});

            this.add('backFirstFleet', () =>
            {
                document.querySelector('#movementcomponent .reversal a[data-key-color="orange"]') && document.querySelector('#movementcomponent .reversal a[data-key-color="orange"]').click();
            }, false, 'orange');

            this.add('backLastFleet', () =>
            {
                document.querySelector('#movementcomponent .reversal a[data-key-color="violet"]') && document.querySelector('#movementcomponent .reversal a[data-key-color="violet"]').click();
            }, false, 'violet');
        }

        document.body.appendChild(this.shortCutWrapper);
        this.updateShortcutsPosition();
    }

    add(id, callback, type, color)
    {
        let key = this.ogl.db.options.keyboardActions[id];

        if(id == 'enter')
        {
            key = id;
            id = 'attackNext';
        }

        const btn = Util.addDom('div',
        {
            'data-key':key,
            'data-key-color':color,
            'data-key-id':id,
            class:'ogl_shortcut ogl_button tooltip',
            parent:this.shortcutDiv,
            title:this.ogl._lang.find(id),
            child:key.replace('enter', '<span class="material-icons">subdirectory_arrow_left</span>'),
            onclick:() => callback()
        });

        if(id == 'quickRaid') btn.innerText += ` (${this.ogl.db.quickRaidList.length})`;

        this.keyList[key] = params =>
        {
            if(type == 'fleet' && (!this.ogl._fleet.isReady || !unsafeWindow.fleetDispatcher || fleetDispatcher.fetchTargetPlayerDataTimeout)) return;
            callback(params);
        };
    }

    updateShortcutsPosition()
    {
        const div = this.shortCutWrapper;
        div.style.top = visualViewport.offsetTop + 'px';
        div.style.height = visualViewport.height - 25 + 'px';
        div.style.left = visualViewport.offsetLeft + 'px';
        div.style.width = visualViewport.width + 'px';
        div.querySelectorAll('.ogl_shortcut').forEach(e => e.style.zoom = 1 / visualViewport.scale);
        /*const div = this.shortcutDiv;

        div.style['max-width'] = visualViewport.width + 'px';
        div.style.top = visualViewport.height + visualViewport.offsetTop - this.shortcutDiv.offsetHeight - 30 + 'px';
        div.style.left = visualViewport.width / 2 + visualViewport.offsetLeft - this.shortcutDiv.offsetWidth / 2 + 'px';

        div.querySelectorAll('.ogl_shortcut').forEach(e => e.style.zoom = 1 / visualViewport.scale);*/
    }
}


class TechManager extends Manager
{
    load()
    {
        this.ogl.currentPlanet.obj.todolist = this.ogl.currentPlanet.obj.todolist || {};

        this.initialLevel = 0;
        this.levelOffset = 0;
        this.detailCumul = {};

        if(unsafeWindow['technologyDetails'])
        {
            technologyDetails.show = technologyId =>
            {
                if(this.xhr)
                {
                    this.xhr.abort();
                }
    
                const wrapper = document.querySelector('#technologydetails_wrapper');
                const content = wrapper.querySelector('#technologydetails_content');
    
                if(!content.querySelector('.ogl_loading'))
                {
                    content.innerHTML = '<div class="ogl_wrapperloading"><div class="ogl_loading"></div></div>';
                }
                
                wrapper.classList.add('ogl_active');
    
                this.xhr = $.ajax(
                {
                    url:technologyDetails.technologyDetailsEndpoint,
                    data: { technology:technologyId }
                })
                .done(data =>
                {
                    const json = JSON.parse(data);
    
                    if(json.status === 'failure') technologyDetails.displayErrors(json.errors);
                    else
                    {
                        content.innerText = '';
                        $('#technologydetails_content').append(json.content[json.target]);
                        this.check(technologyId, wrapper);
                    }
                });
            }
    
            technologyDetails.hide = () =>
            {
                const wrapper = document.querySelector('#technologydetails_wrapper');
                wrapper.classList.remove('ogl_active');

                technologyDetails.id = false;
                technologyDetails.lvl = false;
            }
    
            const urlTech = new URLSearchParams(window.location.search).get('openTech');
            if(urlTech) technologyDetails.show(urlTech);
        }

        this.checkProductionBoxes();

        document.querySelectorAll('#technologies .technology[data-technology]').forEach(tech =>
        {
            const id = tech.getAttribute('data-technology');
            this.ogl.db.serverData[id] = tech.getAttribute('aria-label') || id;
        });

        this.ogl._topbar.checkUpgrade();
    }

    check(id, details)
    {
        const actions = Util.addDom('div', { parent:details.querySelector('.sprite') || details.querySelector('.sprite_large'), class:'ogl_actions' });
        const data = Datafinder.getTech(id);

        this.levelOffset = 0;
        this.initialLevel = parseInt(details.querySelector('.information .level')?.getAttribute('data-value') || 0);
        let amount = details.querySelector('#build_amount');

        if(document.querySelector(`#technologies .technology[data-technology="${id}"] .targetlevel`)?.getAttribute('data-value') >= this.initialLevel)
        {
            this.initialLevel += 1;
        }

        if(!amount)
        {
            if(id != 407 && id != 408) // defense shieds
            {
                Util.addDom('div', { parent:actions, class:'material-icons ogl_button', child:'chevron_left', onclick:() =>
                {
                    if(this.levelOffset > 1 - this.initialLevel)
                    {
                        this.levelOffset--;
                        this.displayLevel(id, this.initialLevel + this.levelOffset, data, details);
                    }
                }});
                
                Util.addDom('div', { parent:actions, class:'material-icons ogl_button', child:'close', onclick:() =>
                {
                    this.levelOffset = 0;
                    this.displayLevel(id, this.initialLevel, data, details);
                }});
        
                Util.addDom('div', { parent:actions, class:'material-icons ogl_button', child:'chevron_right', onclick:() =>
                {
                    this.levelOffset++;
                    this.displayLevel(id, this.initialLevel + this.levelOffset, data, details);
                }});
            }

            Util.addDom('div', { parent:actions, class:'material-icons ogl_button', child:'format_list_bulleted_add', onclick:e =>
            {
                if(this.levelOffset >= 0)
                {
                    //if(this.todoData) this.addToTodolist(tech, this.todoData);
                    e.target.classList.add('ogl_active');
                    this.todoData = {};

                    for(let i=this.initialLevel; i<=this.initialLevel+this.levelOffset;  i++)
                    {
                        const data = this.getTechData(id, i, this.ogl.currentPlanet.obj.id);

                        this.todoData[i] = {};
                        this.todoData[i].level = i;
                        this.todoData[i].id = id;
                        this.todoData[i].metal = data.target.metal;
                        this.todoData[i].crystal = data.target.crystal;
                        this.todoData[i].deut = data.target.deut;
                    }

                    this.addToTodolist(this.todoData);
                }
                else
                {
                    this.ogl._notification.addToQueue('Cannot lock previous levels', false);
                }
            }});
        }
        else
        {
            amount.addEventListener('input', () =>
            {
                setTimeout(() =>
                {
                    const value = parseInt(amount.value) || 0;
                    amount.value = Math.min(99999, value);
    
                    if(amount.value)
                    {
                        setTimeout(() => this.displayLevel(id, value, data, details));
                    }
                }, 100);
            });

            amount.setAttribute('onkeyup', 'checkIntInput(this, 1, 99999);event.stopPropagation();');
            if(amount.parentNode.querySelector('.maximum')) amount.parentNode.querySelector('.maximum').addEventListener('click', () => amount.dispatchEvent(new Event('input')));

            Util.addDom('div', { parent:actions, class:'material-icons ogl_button', child:'format_list_bulleted_add', onclick:e =>
            {
                this.todoData = {};

                const number = amount.value && amount.value > 0 ? amount.value : 1;
                const data = this.getTechData(id, number, this.ogl.currentPlanet.obj.id);

                this.todoData[id] = {};
                this.todoData[id].amount = parseInt(number) || 0;
                this.todoData[id].id = id;
                this.todoData[id].metal = data.target.metal;
                this.todoData[id].crystal = data.target.crystal;
                this.todoData[id].deut = data.target.deut;

                this.addToTodolist(this.todoData);
            }});

            const queueDiv = Util.addDom('div', { parent:details.querySelector('.build_amount'), class:'ogl_queueShip' });

            const btn10 = Util.addDom('div', { parent:queueDiv, 'data-title':this.ogl._lang.find('repeatQueue'), class:'ogl_button ogl_queue10 tooltip', child:'Repeat x', onclick:() =>
            {
                btn10.classList.add('ogl_disabled');
                input10.classList.add('ogl_disabled');

                const upgrade = () =>
                {
                    fetch(scheduleBuildListEntryUrl+`&technologyId=${id}&amount=${amount.value || 1}&mode=1&token=${token}`,
                    {
                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    })
                    .then(response => response.json())
                    .then(result =>
                    {
                        const buildLeft = parseInt(input10.value?.replace(/\D/g,'') || 0) - 1;
                        input10.value = buildLeft;

                        token = result.newAjaxToken;
                        window.stop();

                        if(buildLeft > 0) upgrade();
                        else
                        {
                            btn10.classList.remove('ogl_disabled');
                            input10.classList.remove('ogl_disabled');
                        }
                    });
                }

                upgrade();
            }});

            const input10 = Util.addDom('input', { type:'number', min:0, max:100, value:1, parent:queueDiv, oninput:() =>
            {
                const value = parseInt(input10.value?.replace(/\D/g,'') || 0);
                const min = parseInt(input10.getAttribute('min'));
                const max = parseInt(input10.getAttribute('max'));

                input10.value = Math.min(Math.max(value, min), max);
            }});

            if(details.querySelector('.build-it_wrap .upgrade[disabled]'))
            {
                btn10.classList.add('ogl_disabled');
                input10.classList.add('ogl_disabled');
            }
        }

        this.displayLevel(id, this.initialLevel, data, details);
    }

    displayLevel(id, lvl, data, details)
    {
        const techData = this.getTechData(id, lvl, this.ogl.currentPlanet.obj.id);
        const cumul = {};

        this.detailCumul[id] = this.detailCumul[id] || {};
        this.detailCumul[id][lvl] = this.detailCumul[id][lvl] || {};

        for(let [costID, cost] of Object.entries(techData.target || {}))
        {
            this.detailCumul[id][lvl][costID] = cost;
        }
        
        for(let [cumulLvl, cumulCost] of Object.entries(this.detailCumul[id] || {}))
        {
            if(cumulLvl >= this.initialLevel && cumulLvl <= this.initialLevel + this.levelOffset)
            {
                Object.entries(cumulCost).forEach(entry =>
                {
                    if(entry[0] == 'energy' || entry[0] == 'population') cumul[entry[0]] = entry[1];
                    else cumul[entry[0]] = (cumul[entry[0]] || 0) + entry[1];
                });
            }
        }

        if(unsafeWindow['technologyDetails'])
        {
            technologyDetails.id = id;
            technologyDetails.lvl = lvl;
        }

        if(this.ogl.db.options.debugMode && !details.querySelector('[data-debug]'))
        {
            details.querySelector('.build_duration time').setAttribute('data-debug', details.querySelector('.build_duration time').innerText);
            if(details.querySelector('.information .level')) details.querySelector('.information .level').setAttribute('data-debug', details.querySelector('.information .level').innerText);
            if(details.querySelector('.costs .metal')) details.querySelector('.costs .metal').setAttribute('data-debug', details.querySelector('.costs .metal').innerText);
            if(details.querySelector('.costs .crystal')) details.querySelector('.costs .crystal').setAttribute('data-debug', details.querySelector('.costs .crystal').innerText);
            if(details.querySelector('.costs .deuterium')) details.querySelector('.costs .deuterium').setAttribute('data-debug', details.querySelector('.costs .deuterium').innerText);
            if(details.querySelector('.costs .energy')) details.querySelector('.costs .energy').setAttribute('data-debug', details.querySelector('.costs .energy').innerText);
            if(details.querySelector('.costs .population')) details.querySelector('.costs .population').setAttribute('data-debug', details.querySelector('.costs .population').innerText);
            if(details.querySelector('.additional_energy_consumption .value')) details.querySelector('.additional_energy_consumption .value').setAttribute('data-debug', details.querySelector('.additional_energy_consumption .value').innerText);
            if(details.querySelector('.energy_production .value')) details.querySelector('.energy_production .value').setAttribute('data-debug', details.querySelector('.energy_production .value').innerText);
        }

        const costsWrapper = details.querySelector('.ogl_costsWrapper') || Util.addDom('div', { class:'ogl_costsWrapper', parent:details.querySelector('.costs') });
        costsWrapper.innerText = '';

        
        details.querySelector('.build_duration time').innerText = techData.target.timeresult;
        if(details.querySelector('.additional_energy_consumption .value'))
        {
            const element = details.querySelector('.additional_energy_consumption .value');
            element.classList.add('tooltip');

            if(id == 217) // crawler
            {
                techData.target.conso = parseInt(element.getAttribute('data-value')) * (lvl || 1);
            }

            element.setAttribute('data-title', Util.formatNumber(techData.target.conso));
            element.innerHTML = Util.formatToUnits(techData.target.conso, false, true);
        }
        if(details.querySelector('.energy_production .value')) details.querySelector('.energy_production .value').innerHTML = `<span class="bonus">+${Util.formatToUnits(techData.target.prodEnergy, false, true)}</span>`;

        if(details.querySelector('.information .level'))
        {
            details.querySelector('.information .level').innerHTML = `${lvl-1} <i class="material-icons">east</i> <b>${lvl}</b>`;

            if(this.ogl.currentPlanet.obj.todolist[id]?.[lvl])
            {
                details.querySelector('.ogl_actions .ogl_button:last-child').classList.add('ogl_active');
            }
            else
            {
                details.querySelector('.ogl_actions .ogl_button:last-child').classList.remove('ogl_active');
            }
        }

        if(details.querySelector('.required_population'))
        {
            details.querySelector('.required_population span').setAttribute('data-formatted', Util.formatToUnits(details.querySelector('.required_population span').getAttribute('data-value'), 0).replace(/<[^>]+>/g, ''));
        }

        const header = Util.addDom('div', { class:'ogl_icon', parent:costsWrapper });
        Util.addDom('div', { parent:header });
        Util.addDom('div', { parent:header, child:Math.max(lvl, 1) });
        if(!details.querySelector('.build_amount') && id != 407 && id != 408) Util.addDom('div', { parent:header, child:`${this.initialLevel-1} <i class="material-icons">east</i> ${this.initialLevel + this.levelOffset}`});
        Util.addDom('div', { parent:header, class:'material-icons', child:'globe' });

        ['metal', 'crystal', 'deut', 'energy', 'population'].forEach(resource =>
        {
            if(details.querySelector(`.costs .${resource.replace('deut', 'deuterium')}`))
            {
                const diff = details.querySelector('.build_amount') ? (this.ogl.currentPlanet.obj[resource] || 0) - (techData.target[resource] || 0) : (this.ogl.currentPlanet.obj[resource] || 0) - (cumul[resource] || 0);
                const line = Util.addDom('div', { class:`ogl_icon ogl_${resource}`, parent:costsWrapper });
                line.setAttribute('data-title', Util.formatNumber(techData.target[resource]));

                // cost
                Util.addDom('div', { class:'tooltip', 'data-title':Util.formatNumber(techData.target[resource]), parent:line, child:Util.formatToUnits(techData.target[resource], 2) });

                // cumul
                if(!details.querySelector('.build_amount')) Util.addDom('div', { parent:line, class:'ogl_text tooltip', 'data-title':Util.formatNumber(cumul[resource]), child:Util.formatToUnits(cumul[resource], 2) });

                // diff
                if(diff < 0) Util.addDom('div', { parent:line, class:'ogl_danger tooltip', 'data-title':Util.formatNumber(diff), child:Util.formatToUnits(diff, 2) });
                else Util.addDom('div', { parent:line, class:'ogl_ok material-icons', child:'check' });
            }
        });

        const msuValue = this.ogl.db.options.msu.split(':');
        const msuline = Util.addDom('div', { class:`ogl_icon ogl_msu`, parent:costsWrapper });
        const msu = techData.target.metal * msuValue[0] + techData.target.crystal * msuValue[1] + techData.target.deut * msuValue[2];
        Util.addDom('div', { class:'tooltip', 'data-title':Util.formatNumber(msu), parent:msuline, child:Util.formatToUnits(msu, 2) });

        const cumulMsu = cumul.metal * msuValue[0] + cumul.crystal * msuValue[1] + cumul.deut * msuValue[2];
        if(!details.querySelector('.build_amount')) Util.addDom('div', { parent:msuline, class:'ogl_text tooltip', 'data-title':Util.formatNumber(cumulMsu), child:Util.formatToUnits(cumulMsu, 2) });
    }

    addToTodolist(data)
    {
        this.ogl.currentPlanet.obj.todolist = this.ogl.currentPlanet.obj.todolist || {};

        Object.values(data).forEach(entry =>
        {
            const todolist = this.ogl.currentPlanet.obj.todolist;
            const entryLvl = entry.level || Date.now() + performance.now();
    
            todolist[entry.id] = todolist[entry.id] || {};
            todolist[entry.id][entryLvl] = todolist[entry.id][entryLvl] || {};
            todolist[entry.id][entryLvl].id = entry.id;
            todolist[entry.id][entryLvl].amount = entry.amount || 0;
            todolist[entry.id][entryLvl].level = entryLvl;
            todolist[entry.id][entryLvl].cost =
            {
                metal:entry.metal,
                crystal:entry.crystal,
                deut:entry.deut,
            }
        });

        this.checkTodolist();
    }

    checkTodolist()
    {
        document.querySelectorAll('.planetlink, .moonlink').forEach(planet =>
        {
            // remove old icon
            const isMoon = planet.classList.contains('moonlink');

            if(isMoon) planet.parentNode.querySelectorAll('.ogl_todoIcon.ogl_moon').forEach(i => i.remove());
            else planet.parentNode.querySelectorAll('.ogl_todoIcon.ogl_planet').forEach(i => i.remove());

            const urlParams = new URLSearchParams(planet.getAttribute('href'));
            const id = urlParams.get('cp').split('#')[0];
            let len = 0;
            let icon;

            Object.values(this.ogl.db.myPlanets[id]?.todolist || {}).forEach((building, index) =>
            {
                if(index == 0)
                {
                    icon = Util.addDom('div', { class:'material-icons ogl_todoIcon', child:'format_list_bulleted', onclick:() =>
                    {
                        this.openTodolist(this.ogl.db.myPlanets[id].todolist, `${planet.parentNode.querySelector('.planet-koords').innerText}:${isMoon ? 3 : 1}`, id);
                    }});
                }

                Object.values(building).forEach(line =>
                {
                    len++;
                    if((line.cost?.metal || 0) + (line.cost?.crystal || 0) + (line.cost?.deut || 0) <= 0) icon.classList.add('ogl_ok');
                });
            });

            if(icon)
            {
                const targetClass = isMoon ? 'ogl_sideIconBottom' : 'ogl_sideIconTop';
                const targetDom = planet.parentNode.querySelector(`.${targetClass}`) || Util.addDom('div', { class:targetClass, parent:planet.parentNode });

                isMoon ? icon.classList.add('ogl_moon') : icon.classList.add('ogl_planet');
                icon.setAttribute('data-list', len);
                targetDom.appendChild(icon);
            }
        });

        let requireUpdate = false;

        // remove element from todolist if already done
        document.querySelectorAll('.technology[data-technology]').forEach(techDom =>
        {
            let techID = techDom.getAttribute('data-technology');
            let techLvL = techDom.querySelector('.targetlevel') || techDom.querySelector('.level');

            if(!techLvL) return;

            techLvL = parseInt(techLvL.getAttribute('data-value'));

            Object.keys(this.ogl.currentPlanet.obj.todolist?.[techID] || {}).forEach(key =>
            {
                if(techLvL >= parseInt(key))
                {
                    delete this.ogl.currentPlanet.obj.todolist[techID][key];

                    if(Object.values(this.ogl.currentPlanet.obj.todolist[techID]).length < 1)
                    {
                        delete this.ogl.currentPlanet.obj.todolist[techID];
                        requireUpdate = true;
                    }
                }
            });
        });

        if(requireUpdate)
        {
            this.checkTodolist();
        }
    }

    openTodolist(data, coords, id)
    {
        let toSend = {};
        const splitted = coords.split(':');

        const container = Util.addDom('div', {class:'ogl_todoList', child:`<h2>Todolist ${splitted[3] == 1 ? 'planet' : 'moon'} [${splitted[0]}:${splitted[1]}:${splitted[2]}]</h2>`});
        const leftDiv = Util.addDom('div', { parent:container });
        const rightDiv = Util.addDom('div', { parent:container, class:'ogl_actions' });

        let updateHeader = (blockData, header, content, footer, block) =>
        {
            setTimeout(() =>
            {
                const checkedCount = content.querySelectorAll('input:checked').length;
                const maxCount = Object.keys(blockData).length;
                const blockID = Object.values(blockData)[0]?.id;

                if(!maxCount)
                {
                    block.remove();
                    Object.keys(toSend).filter(k => k.startsWith(blockID+'_')).forEach(k => delete toSend[k]);
                    delete this.ogl.db.myPlanets[id].todolist[blockID];
                    this.checkTodolist();
                    return;
                }
    
                header.innerHTML = this.ogl.db.serverData[blockID];
                header.innerHTML += ` (<b>${checkedCount}</b>/${maxCount})`;
    
                if(checkedCount != maxCount && footer && footer.querySelector('input:checked')) footer.querySelector('input:checked').checked = false;
                
                if(Object.entries(toSend).length > 0) sendButton.classList.remove('ogl_disabled');
                else sendButton.classList.add('ogl_disabled');
            });
        }

        let updateFooter = (footer, content, cumul) =>
        {
            setTimeout(() =>
            {
                footer.innerHTML = '';

                let line = Util.addDom('div', { class:'ogl_line ogl_blockRecap', parent:footer, child:
                `
                    <div>all</div>
                    <div class="ogl_icon ogl_metal">${Util.formatToUnits(cumul.metal, 2)}</div>
                    <div class="ogl_icon ogl_crystal">${Util.formatToUnits(cumul.crystal, 2)}</div>
                    <div class="ogl_icon ogl_deut">${Util.formatToUnits(cumul.deut, 2)}</div>
                    <label></label>
                ` });

                // select block
                let input = Util.addDom('input', { type:'checkbox', parent:line.querySelector('label'), oninput:() =>
                {
                    if(input.checked) content.querySelectorAll('input').forEach(input => { if(input.checked != true) input.click(); });
                    else content.querySelectorAll('input').forEach(input => { if(input.checked == true) input.click(); });
                }});

                // send block
                Util.addDom('button', { class:'material-icons', parent:line, child:'cube-send', onclick:() =>
                {
                    content.querySelectorAll('input').forEach(input => { if(input.checked != true) input.click(); });
                    setTimeout(() => container.querySelector('.ogl_button').click(), 50);
                }});

                // remove block
                Util.addDom('button', { class:'material-icons ogl_removeTodo', parent:line, child:'close', onclick:() =>
                {
                    content.querySelectorAll('.ogl_removeTodo').forEach(button => { button.click(); });
                }});
            });
        }

        Object.values(data).forEach(blockData =>
        {
            const block = Util.addDom('div', { class:'ogl_tech', parent:leftDiv });
            const header = Util.addDom('h3', { parent:block, onclick:() => block.classList.toggle('ogl_active') });
            const content = Util.addDom('div', { parent:block });
            const footer = Util.addDom('footer', { parent:block });
            const cumul = {};

            Object.values(blockData).forEach(todo =>
            {
                const displayedCell = todo.amount || todo.level;
                const key = `${todo.id}_${todo.level}`;

                let line = Util.addDom('div', { class:'ogl_line', 'data-parent':this.ogl.db.serverData[todo.id], parent:content, child:
                `
                    <div>${displayedCell}</div><div class="ogl_icon ogl_metal">${Util.formatToUnits(todo.cost?.metal, 2)}</div>
                    <div class="ogl_icon ogl_crystal">${Util.formatToUnits(todo.cost?.crystal, 2)}</div>
                    <div class="ogl_icon ogl_deut">${Util.formatToUnits(todo.cost?.deut, 2)}</div>
                    <label></label>
                ` });

                cumul.metal = (cumul.metal || 0) + (todo.cost?.metal || 0);
                cumul.crystal = (cumul.crystal || 0) + (todo.cost?.crystal || 0);
                cumul.deut = (cumul.deut || 0) + (todo.cost?.deut || 0);

                // select line
                let input = Util.addDom('input', { type:'checkbox', parent:line.querySelector('label'), oninput:() =>
                {
                    if(input.checked)
                    {
                        toSend[key] = todo;
                        input.setAttribute('data-clicked', performance.now());
                    }
                    else
                    {
                        delete toSend[key];
                        input.removeAttribute('data-clicked');
                    }

                    leftDiv.querySelectorAll('label').forEach(e => e.removeAttribute('data-order'));

                    Array.from(leftDiv.querySelectorAll('.ogl_tech > div input:checked')).sort((a, b) => a.getAttribute('data-clicked') - b.getAttribute('data-clicked')).forEach((e, index) =>
                    {
                        e.parentNode.setAttribute('data-order', index+1);
                    });

                    updateHeader(blockData, header, content, footer, block);
                }});

                // send line
                Util.addDom('button', { class:'material-icons', parent:line, child:'cube-send', onclick:() =>
                {
                    input.click();
                    setTimeout(() => container.querySelector('.ogl_button').click(), 50);
                }});

                // remove line
                Util.addDom('button', { class:'material-icons ogl_removeTodo', parent:line, child:'close', onclick:() =>
                {
                    line.remove();

                    cumul.metal = (cumul.metal || 0) - (todo.cost?.metal || 0);
                    cumul.crystal = (cumul.crystal || 0) - (todo.cost?.crystal || 0);
                    cumul.deut = (cumul.deut || 0) - (todo.cost?.deut || 0);

                    delete toSend[key];
                    delete this.ogl.db.myPlanets[id].todolist[todo.id][todo.level];

                    if(Object.keys(this.ogl.db.myPlanets[id].todolist[todo.id] || {}).length <= 0)
                    {
                        delete this.ogl.db.myPlanets[id].todolist[todo.id];
                        block.remove();
                    }

                    if(Object.keys(ogl.db.myPlanets[id].todolist || {}).length <= 0)
                    {
                        this.ogl.db.myPlanets[id].todolist = {};
                        this.ogl._popup.close();
                    }

                    Array.from(leftDiv.querySelectorAll('.ogl_tech > div input:checked')).sort((a, b) => a.getAttribute('data-clicked') - b.getAttribute('data-clicked')).forEach((e, index) =>
                    {
                        e.parentNode.setAttribute('data-order', index+1);
                    });

                    if(unsafeWindow['technologyDetails'])
                    {
                        if(id == this.ogl.currentPlanet.obj.id && document.querySelector('#technologydetails .ogl_actions .ogl_active'))
                        {
                            document.querySelector('#technologydetails .ogl_actions .ogl_active').classList.remove('ogl_active');
                        }
                    }

                    updateHeader(blockData, header, content, footer, block);
                    updateFooter(footer, content, cumul);
                    this.checkTodolist();
                }});
            });

            updateHeader(blockData, header, content, footer, block);
            updateFooter(footer, content, cumul);
        });

        let url = `https://${window.location.host}/game/index.php?page=ingame&component=fleetdispatch&galaxy=${splitted[0]}&system=${splitted[1]}&position=${splitted[2]}&oglmode=3&targetid=${id}&type=${splitted[3]}`;

        let sendButton = Util.addDom('button', { class:'ogl_button ogl_disabled', parent:rightDiv, child:'Send selection <i class="material-icons">cube-send</i>', onclick:() =>
        {
            this.ogl.cache.toSend = Object.values(toSend);
            if(substractButton.querySelector('input').checked) url += '&substractMode=true';
            window.location.href = url;
            rightDiv.querySelectorAll('.ogl_button').forEach(e => e.classList.add('ogl_disabled'));
        }});

        Util.addDom('button', { class:'ogl_button', parent:rightDiv, child:'Send all <i class="material-icons">cube-send</i>', onclick:() =>
        {
            leftDiv.querySelectorAll('input').forEach(input => { if(input.checked != true) input.click(); });

            setTimeout(() =>
            {
                this.ogl.cache.toSend = Object.values(toSend);
                rightDiv.querySelectorAll('.ogl_button').forEach(e => e.classList.add('ogl_disabled'));
                if(substractButton.querySelector('input').checked) url += '&substractMode=true';
                window.location.href = url;
            }, 100);
        }});

        Util.addDom('button', { class:'ogl_button ogl_removeTodo', parent:rightDiv, child:'Remove all <i class="material-icons">close</i>', onclick:() =>
        {
            this.ogl.db.myPlanets[id].todolist = {};
            this.ogl._popup.close();
            this.checkTodolist();

            if(unsafeWindow['technologyDetails'])
            {
                if(id == this.ogl.currentPlanet.obj.id && document.querySelector('#technologydetails .ogl_actions .ogl_active'))
                {
                    document.querySelector('#technologydetails .ogl_actions .ogl_active').classList.remove('ogl_active');
                }
            }
        }});

        let substractButton = Util.addDom('label', { class:'ogl_button', parent:rightDiv, child:'<input type="checkbox">Substract planet resources' });

        this.ogl._popup.open(container);
    }

    getTechData(id, level, planetID)
    {
        if(!id) return;

        const data = Datafinder.getTech(id);
        const planetData = this.ogl.db.myPlanets[planetID] || {};

        let baseLabs = [];
        let bestLabs = 0;
        let labRequired =
        {
            // you can't use a lab with a too low level for the tech
            113:1, 120:1, 121:4, 114:7, 122:4, 115:1, 117:2, 118:7,
            106:3, 108:1, 124:3, 123:10, 199:12, 109:4, 110:6, 111:2,
        }

        document.querySelectorAll('.smallplanet').forEach(line =>
        {
            const coloID = line.getAttribute('id').replace('planet-', '');
            const colo = this.ogl.db.myPlanets[coloID];
            
            if(!colo) return;

            if(planetID != coloID && colo[31] >= labRequired[id]) baseLabs.push(colo[31]); // base labo
        });

        /*document.querySelectorAll('.smallplanet').forEach(line =>
        {
            const id = line.getAttribute('id').replace('planet-', '');
            const colo = this.ogl.db.myPlanets[id];
            
            if(!colo) return;
            colo.activeLFTechs = colo.activeLFTechs || [];

            if(planetID != id) baseLabs.push(colo[31]); // base labo

            // raceLevel boost building
            const techBonus11111 = (colo.lifeform == 1 ? (colo[11111] || 0) : 0) * Datafinder.getTech(11111).bonus1BaseValue / 100; // human metropolis
            const techBonus13107 = (colo.lifeform == 3 ? (colo[13107] || 0) : 0) * Datafinder.getTech(13107).bonus2BaseValue / 100; // meca tower
            const techBonus13111 = (colo.lifeform == 3 ? (colo[13111] || 0) : 0) * Datafinder.getTech(13111).bonus1BaseValue / 100; // meca cpu

            let bonusRaceLevel = (1 + this.ogl.db.lfBonuses?.[`lifeform${colo.lifeform}`]?.bonus / 100) || 1;
            bonusRaceLevel = bonusRaceLevel * (1 + techBonus11111 + techBonus13107 + techBonus13111);

            // human
            cumul[11204] = (cumul[11204] || 0) + (colo.activeLFTechs.indexOf('11204') > -1 ? (colo[11204] || 0) : 0) * bonusRaceLevel; // human espio boost I
            cumul[11206] = (cumul[11206] || 0) + (colo.activeLFTechs.indexOf('11206') > -1 ? (colo[11206] || 0) : 0) * bonusRaceLevel; // human research boost I
            cumul[11207] = (cumul[11207] || 0) + (colo.activeLFTechs.indexOf('11207') > -1 ? (colo[11207] || 0) : 0) * bonusRaceLevel; // human terra boost I
            cumul[11211] = (cumul[11211] || 0) + (colo.activeLFTechs.indexOf('11211') > -1 ? (colo[11211] || 0) : 0) * bonusRaceLevel; // human research boost II
            cumul[11212] = (cumul[11212] || 0) + (colo.activeLFTechs.indexOf('11212') > -1 ? (colo[11212] || 0) : 0) * bonusRaceLevel; // human terra boost II
            cumul[11213] = (cumul[11213] || 0) + (colo.activeLFTechs.indexOf('11213') > -1 ? (colo[11213] || 0) : 0) * bonusRaceLevel; // human espio boost II
            cumul[11217] = (cumul[11217] || 0) + (colo.activeLFTechs.indexOf('11217') > -1 ? (colo[11217] || 0) : 0) * bonusRaceLevel; // human research boost III
            cumul[11218] = (cumul[11218] || 0) + (colo.activeLFTechs.indexOf('11218') > -1 ? (colo[11218] || 0) : 0) * bonusRaceLevel; // human astro boost I

            // rocktal
            cumul[12209] = (cumul[12209] || 0) + (colo.activeLFTechs.indexOf('12209') > -1 ? (colo[12209] || 0) : 0) * bonusRaceLevel; // rocktal plasma boost I
            cumul[12214] = (cumul[12214] || 0) + (colo.activeLFTechs.indexOf('12214') > -1 ? (colo[12214] || 0) : 0) * bonusRaceLevel; // rocktal silo boost I
            cumul[12215] = (cumul[12215] || 0) + (colo.activeLFTechs.indexOf('12215') > -1 ? (colo[12215] || 0) : 0) * bonusRaceLevel; // rocktal energy boost I
            cumul[12217] = (cumul[12217] || 0) + (colo.activeLFTechs.indexOf('12217') > -1 ? (colo[12217] || 0) : 0) * bonusRaceLevel; // rocktal protection boost I

            // Meca
            cumul[13204] = (cumul[13204] || 0) + (colo.activeLFTechs.indexOf('13204') > -1 ? (colo[13204] || 0) : 0) * bonusRaceLevel; // meca depot boost I
            cumul[13207] = (cumul[13207] || 0) + (colo.activeLFTechs.indexOf('13207') > -1 ? (colo[13207] || 0) : 0) * bonusRaceLevel; // meca espio boost I
            cumul[13211] = (cumul[13211] || 0) + (colo.activeLFTechs.indexOf('13211') > -1 ? (colo[13211] || 0) : 0) * bonusRaceLevel; // meca energy boost I
            cumul[13217] = (cumul[13217] || 0) + (colo.activeLFTechs.indexOf('13217') > -1 ? (colo[13217] || 0) : 0) * bonusRaceLevel; // meca weapon boost I

            // kaelesh
            cumul[14207] = (cumul[14207] || 0) + (colo.activeLFTechs.indexOf('14207') > -1 ? (colo[14207] || 0) : 0); // kaelesh research boost I
            cumul[14213] = (cumul[14213] || 0) + (colo.activeLFTechs.indexOf('14213') > -1 ? (colo[14213] || 0) : 0); // kaelesh research boost II
            cumul[14217] = (cumul[14217] || 0) + (colo.activeLFTechs.indexOf('14217') > -1 ? (colo[14217] || 0) : 0); // kaelesh shield boost I
            cumul[14218] = (cumul[14218] || 0) + (colo.activeLFTechs.indexOf('14218') > -1 ? (colo[14218] || 0) : 0); // kaelesh class boost I
        });*/

        // raceLevel boost building
        /*const localBonus11111 = (planetData.lifeform == 1 ? (planetData[11111] || 0) : 0) * Datafinder.getTech(11111).bonus1BaseValue / 100; // human metropolis
        const localBonus13107 = (planetData.lifeform == 3 ? (planetData[13107] || 0) : 0) * Datafinder.getTech(13107).bonus2BaseValue / 100; // meca tower
        const localBonus13111 = (planetData.lifeform == 3 ? (planetData[13111] || 0) : 0) * Datafinder.getTech(13111).bonus1BaseValue / 100; // meca cpu

        let localBonusRaceLevel = (1 + this.ogl.db.lfBonuses?.[`lifeform${planetData.lifeform}`]?.bonus / 100) || 1;*/

        baseLabs.sort((a, b) => b - a);
        baseLabs = baseLabs.slice(0, Math.min(baseLabs.length, planetData[123]));
        if(baseLabs.length) bestLabs = baseLabs.reduce((a, b) => a + b);

        const planet = {};
        planet.lifeform = planetData.lifeform || 0;
        //planet.activeLF = planetData.activeLFTechs || [];

        const tech = {};

        tech.id = id;
        tech.isBaseBuilding = tech.id < 100;
        tech.isBaseResearch = tech.id > 100 && tech.id <= 199;
        tech.isBaseShip = tech.id > 200 && tech.id <= 299;
        tech.isBaseDef = tech.id > 400 && tech.id <= 599;
        tech.isLfBuilding = (tech.id > 11100 && tech.id <= 11199) || (tech.id > 12100 && tech.id <= 12199) || (tech.id > 13100 && tech.id <= 13199) || (tech.id > 14100 && tech.id <= 14199);
        tech.isLfResearch = (tech.id > 11200 && tech.id <= 11299) || (tech.id > 12200 && tech.id <= 12299) || (tech.id > 13200 && tech.id <= 13299) || (tech.id > 14200 && tech.id <= 14299);

        tech.base = {};
        tech.base.metal = data.metal || 0;
        tech.base.crystal = data.crystal || 0;
        tech.base.deut = data.deut || 0;
        tech.base.energy = data.energy || 0;
        tech.base.duration = data.durationbase || 0;
        tech.base.conso = data.conso || 0;
        tech.base.population = data.bonus1BaseValue || 0;

        tech.factor = {};
        tech.factor.price = data.priceFactor || 2;
        tech.factor.duration = data.durationfactor || 2;
        tech.factor.energy = data.energyFactor || data.energyIncreaseFactor || 2;
        tech.factor.population = data.bonus1IncreaseFactor || 2;

        tech.bonus = {};
        tech.bonus.price = 0;
        tech.bonus.duration = 0;
        tech.bonus.classDuration = 0;
        tech.bonus.eventDuration = 0;
        tech.bonus.technocrat = 0;
        tech.bonus.engineer = 0;
        tech.bonus.conso = 0;
        tech.bonus.prodEnergy = 0;

        if(this.ogl.account.class == 1) tech.bonus.prodEnergy += .1; // 10% rocktal energy bonus
        if(this.ogl.db.allianceClass == 2) tech.bonus.prodEnergy += .05; // 5% trader alliance bonus

        //tech.bonus.race = localBonusRaceLevel * (1 + localBonus11111 + localBonus13107 + localBonus13111);

        if(planet.lifeform == 2)
        {
            // rocktal chamber
            tech.bonus.prodEnergy += planetData[12107] * Datafinder.getTech(12107).bonus1BaseValue / 100;
            tech.bonus.conso += planetData[12107] * Datafinder.getTech(12107).bonus2BaseValue / 100;

            if(tech.isLfBuilding)
            {
                // rocktal monument
                tech.bonus.price += planetData[12108] * Datafinder.getTech(12108).bonus1BaseValue / 100;
                tech.bonus.duration += planetData[12108] * Datafinder.getTech(12108).bonus2BaseValue / 100;
            }
        }
        else if(planet.lifeform == 3)
        {
            tech.bonus.prodEnergy += planetData[13107] * Datafinder.getTech(13107).bonus1BaseValue / 100;

            if(tech.isBaseShip || tech.isBaseDef)
            {
                tech.bonus.duration += planetData[13106] * Datafinder.getTech(13106).bonus1BaseValue / 100; // meca center
            }
        }

        if(tech.isBaseResearch && document.querySelector('.technology .acceleration')) tech.bonus.eventDuration += parseInt(document.querySelector('.technology .acceleration').getAttribute('data-value')) / 100; // research speed event bonus
        //if(tech.isBaseResearch && this.ogl.account.class == 3) tech.bonus.classDuration += 0.25 * (1 + cumul[14218] * Datafinder.getTech(14218).bonus1BaseValue / 100 * tech.bonus.race); // explo class research speed bonus
        if(tech.isBaseResearch && this.ogl.account.class == 3) tech.bonus.classDuration += .25 * (1 + (this.ogl.db.lfBonuses?.Characterclasses3?.bonus || 0) / 100); // explo class research speed bonus
        if(tech.isBaseResearch && document.querySelector('#officers .technocrat.on')) tech.bonus.technocrat += 0.25; // technocrat research speed bonus
        if(document.querySelector('#officers .engineer.on')) tech.bonus.engineer += 0.10; // engineer energy prod bonus

        if(tech.isLfResearch)
        {
            if(planet.lifeform == 1) // human
            {
                tech.bonus.price += planetData[11103] * Datafinder.getTech(11103).bonus1BaseValue / 100;
                tech.bonus.duration += planetData[11103] * Datafinder.getTech(11103).bonus2BaseValue / 100;
            }
            else if(planet.lifeform == 2) // rocktal
            {
                tech.bonus.price += planetData[12103] * Datafinder.getTech(12103).bonus1BaseValue / 100;
                tech.bonus.duration += planetData[12103] * Datafinder.getTech(12103).bonus2BaseValue / 100;
            }
            else if(planet.lifeform == 3) // meca
            {
                tech.bonus.price += planetData[13103] * Datafinder.getTech(13103).bonus1BaseValue / 100;
                tech.bonus.duration += planetData[13103] * Datafinder.getTech(13103).bonus2BaseValue / 100;
            }
            else if(planet.lifeform == 4) // kaelesh
            {
                tech.bonus.price += planetData[14103] * Datafinder.getTech(14103).bonus1BaseValue / 100;
                tech.bonus.duration += planetData[14103] * Datafinder.getTech(14103).bonus2BaseValue / 100;
            }

            tech.bonus.price += (this.ogl.db.lfBonuses?.LfResearch?.cost || 0) / 100;
            tech.bonus.duration += (this.ogl.db.lfBonuses?.LfResearch?.duration || 0) / 100;
        }

        if(planet.lifeform == 2 && (tech.id == 1 || tech.id == 2 || tech.id == 3 || tech.id == 4 || tech.id == 12 || tech.id == 12101 || tech.id == 12102))
        {
            tech.bonus.price += planetData[12111] * Datafinder.getTech(12111).bonus1BaseValue / 100;
        }

        if(tech.isBaseResearch || tech.isBaseDef || tech.isBaseShip)
        {
            tech.bonus.price += (this.ogl.db.lfBonuses?.[tech.id]?.cost || 0) / 100;
            tech.bonus.duration += (this.ogl.db.lfBonuses?.[tech.id]?.duration || 0) / 100;
        }

        /*if(tech.isBaseResearch || tech.isLfResearch)
        {
            tech.bonus.duration += cumul[11206] * Datafinder.getTech(11206).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[11211] * Datafinder.getTech(11211).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[11217] * Datafinder.getTech(11217).bonus1BaseValue / 100;

            tech.bonus.duration += cumul[14207] * Datafinder.getTech(14207).bonus1BaseValue / 100 ;
            tech.bonus.duration += cumul[14213] * Datafinder.getTech(14213).bonus1BaseValue / 100;
        }
 
        if(planet.lifeform == 2 && (tech.id == 1 || tech.id == 2 || tech.id == 3 || tech.id == 4 || tech.id == 12 || tech.id == 12101 || tech.id == 12102))
        {
            tech.bonus.price += planetData[12111] * Datafinder.getTech(12111).bonus1BaseValue / 100;
        }
        else if(tech.id == 33) // terraformer
        {
            tech.bonus.price += cumul[11207] * Datafinder.getTech(11207).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[11207] * Datafinder.getTech(11207).bonus2BaseValue / 100;

            tech.bonus.price += cumul[11212] * Datafinder.getTech(11212).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[11212] * Datafinder.getTech(11212).bonus2BaseValue / 100;
        }
        else if(tech.id == 34) // depot
        {
            tech.bonus.price += cumul[13204] * Datafinder.getTech(13204).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[13204] * Datafinder.getTech(13204).bonus2BaseValue / 100;
        }
        else if(tech.id == 44) // silo
        {
            tech.bonus.price += cumul[12214] * Datafinder.getTech(11207).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[12214] * Datafinder.getTech(11207).bonus2BaseValue / 100;
        }
        else if(tech.id == 106) // espionage
        {
            tech.bonus.price += cumul[11204] * Datafinder.getTech(11204).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[11204] * Datafinder.getTech(11204).bonus2BaseValue / 100;

            tech.bonus.price += cumul[11213] * Datafinder.getTech(11213).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[11213] * Datafinder.getTech(11213).bonus2BaseValue / 100;

            tech.bonus.price += cumul[13207] * Datafinder.getTech(13207).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[13207] * Datafinder.getTech(13207).bonus2BaseValue / 100;
        }
        else if(tech.id == 109) // weapon
        {
            tech.bonus.price += cumul[13217] * Datafinder.getTech(13217).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[13217] * Datafinder.getTech(13217).bonus2BaseValue / 100;
        }
        else if(tech.id == 110) // shield
        {
            tech.bonus.price += cumul[14217] * Datafinder.getTech(14217).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[14217] * Datafinder.getTech(14217).bonus2BaseValue / 100;
        }
        else if(tech.id == 111) // protection
        {
            tech.bonus.price += cumul[12217] * Datafinder.getTech(12217).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[12217] * Datafinder.getTech(12217).bonus2BaseValue / 100;
        }
        else if(tech.id == 113) // energy
        {
            tech.bonus.price += cumul[12215] * Datafinder.getTech(12215).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[12215] * Datafinder.getTech(12215).bonus2BaseValue / 100;

            tech.bonus.price += cumul[13211] * Datafinder.getTech(13211).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[13211] * Datafinder.getTech(13211).bonus2BaseValue / 100;
        }
        else if(tech.id == 122) // plasma
        {
            tech.bonus.price += cumul[12209] * Datafinder.getTech(12209).bonus1BaseValue / 100;
            tech.bonus.duration += cumul[12209] * Datafinder.getTech(12209).bonus2BaseValue / 100;
        }
        else if(tech.id == 124) // astro
        {
            tech.bonus.duration += cumul[11218] * Datafinder.getTech(11218).bonus1BaseValue / 100;
        }*/

        tech.target = {};

        if(tech.isBaseBuilding || tech.isBaseResearch)
        {
            const rawMetal = Math.floor(tech.base.metal * Math.pow(tech.factor.price, level - 1));
            const rawCrystal =  Math.floor(tech.base.crystal * Math.pow(tech.factor.price, level - 1));
            const rawDeut =  Math.floor(tech.base.deut * Math.pow(tech.factor.price, level - 1));

            tech.target.metal = Math.floor(rawMetal * (1 - tech.bonus.price));
            tech.target.crystal =  Math.floor(rawCrystal * (1 - tech.bonus.price));
            tech.target.deut =  Math.floor(rawDeut * (1 - tech.bonus.price));
            tech.target.energy =  Math.floor(tech.base.energy * Math.pow(tech.factor.energy, level - 1));

            if(tech.id == 1 || tech.id == 2) tech.target.conso = Math.ceil(10 * level * Math.pow(1.1, level)) - Math.ceil(10 * (level-1) * Math.pow(1.1, level-1));
            if(tech.id == 3) tech.target.conso = Math.ceil(20 * level * Math.pow(1.1, level)) - Math.ceil(20 * (level-1) * Math.pow(1.1, level-1));
            if(tech.id == 4) tech.target.prodEnergy = Math.floor(20 * level * Math.pow(1.1, level)) - Math.floor(20 * (level-1) * Math.pow(1.1, level-1));
            if(tech.id == 12) tech.target.prodEnergy = Math.floor(30 * level * Math.pow((1.05 + (planetData[113] || 0) * 0.01), level)) - Math.floor(30 * (level-1) * Math.pow((1.05 + (planetData[113] || 0) * 0.01), level-1));

            if(tech.isBaseBuilding) tech.target.duration = (rawMetal + rawCrystal) / (2500 * Math.max((id == 41 || id == 42 || id == 43) ? 1 : 4 - level / 2, 1)  * (1 + (planetData[14] || 0)) * (Math.pow(2, planetData[15] || 0))) * 3600 * 1000;
            else tech.target.duration = (rawMetal + rawCrystal) / (1000 * (1 + (planetData[31] || 0) + bestLabs)) * 3600 * 1000;
        }
        else if(tech.isLfBuilding || tech.isLfResearch)
        {
            tech.target.metal = Math.floor(Math.floor(tech.base.metal * Math.pow(tech.factor.price, level - 1) * level) * (1 - tech.bonus.price));
            tech.target.crystal = Math.floor(Math.floor(tech.base.crystal * Math.pow(tech.factor.price, level - 1) * level) * (1 - tech.bonus.price));
            tech.target.deut =  Math.floor(Math.floor(tech.base.deut * Math.pow(tech.factor.price, level - 1) * level) * (1 - tech.bonus.price));
            tech.target.energy = Math.floor(Math.floor(level * tech.base.energy * Math.pow(tech.factor.energy, level) * (1 - tech.bonus.price)));
            tech.target.population = Math.floor(Math.floor(tech.base.population * Math.pow(tech.factor.population, level-1) * (1 - tech.bonus.price)));

            if(level < 2) tech.target.conso = Math.floor(level * tech.base.energy);
            else tech.target.conso = Math.floor(Math.floor(level * tech.base.energy * Math.pow(tech.factor.energy, level) - (level-1) * tech.base.energy * Math.pow(tech.factor.energy, level-1)));

            if(tech.isLfBuilding) tech.target.duration = Math.floor(level * tech.base.duration * 1000 * (1 / ((1 + (planetData[14] || 0)) * (Math.pow(2, planetData[15] || 0)))) * Math.pow(tech.factor.duration, level));
            else tech.target.duration = Math.floor(level * tech.base.duration * 1000 * Math.pow(tech.factor.duration, level));
        }
        else if(tech.isBaseShip || tech.isBaseDef)
        {
            const amount = level || 1;

            tech.target.metal = tech.base.metal * amount;
            tech.target.crystal =  tech.base.crystal * amount;
            tech.target.deut =  tech.base.deut * amount;
            tech.target.duration = ((tech.base.metal + tech.base.crystal) / 5000) * (2 / (1 + planetData[21] || 0)) * Math.pow(0.5, (planetData[15] || 0)) * 3600 * 1000;
            if(tech.id == 212) tech.target.prodEnergy = Math.floor(((planetData.temperature + 40 + planetData.temperature) / 2 + 160) / 6) * amount;
        }

        if(this.ogl.db.options.debugMode)
        {
            const debugString = JSON.stringify(tech);
            console.log(debugString);
        }

        tech.target.prodEnergy = Math.floor(tech.target.prodEnergy * (1 + tech.bonus.prodEnergy + tech.bonus.engineer)) || 0;
        tech.target.conso = -Math.ceil(tech.target.conso * (1 - tech.bonus.conso)) || 0;
        tech.target.duration = tech.target.duration / (this.ogl.server.economySpeed * (tech.isBaseResearch ? this.ogl.db.serverData.researchSpeed : 1)) * (1 - tech.bonus.eventDuration) * (1 - tech.bonus.classDuration) * (1 - tech.bonus.technocrat) * (1 - Math.min(tech.bonus.duration, .99));
        tech.target.duration = Math.max(tech.target.duration, 1000);

        if(tech.isBaseShip || tech.isBaseDef)
        {
            tech.target.duration = Math.floor(tech.target.duration / 1000) * 1000;
            tech.target.duration = Math.max(tech.target.duration, 1000) * (level || 1);
        }

        let seconds = tech.target.duration / 1000;
        let w = Math.floor(seconds / (3600*24*7));
        let d = Math.floor(seconds % (3600*24*7) / (3600*24));
        let h = Math.floor(seconds % (3600*24) / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 60);

        let displayed = 0;

        tech.target.timeresult = '';

        if(w > 0 && displayed < 3) { tech.target.timeresult += `${w}${LocalizationStrings.timeunits.short.week} `; displayed++; }
        if(d > 0 && displayed < 3) { tech.target.timeresult += `${d}${LocalizationStrings.timeunits.short.day} `; displayed++; }
        if(h > 0 && displayed < 3) { tech.target.timeresult += `${h}${LocalizationStrings.timeunits.short.hour} `; displayed++; }
        if(m > 0 && displayed < 3) { tech.target.timeresult += `${m}${LocalizationStrings.timeunits.short.minute} `; displayed++; }
        if(s > 0 && displayed < 3) { tech.target.timeresult += `${s}${LocalizationStrings.timeunits.short.second}`; displayed++; }

        return tech;
    }

    checkProductionBoxes()
    {
        this.ogl.currentPlanet.obj.upgrades = this.ogl.currentPlanet.obj.upgrades || {};
        const time = serverTime.getTime();

        Object.entries(this.ogl._time.productionBoxes).forEach(box =>
        {
            if(unsafeWindow[box[0]])
            {
                const techType = box[0] == 'restTimebuilding' ? 'baseBuilding' : box[0] == 'restTimeresearch' ? 'baseResearch' : box[0] == 'restTimeship2' ? 'ship' : box[0] == 'restTimelfbuilding' ? 'lfBuilding' : box[0] == 'restTimelfresearch' ? 'lfResearch' : 'unknown';
                const coords = document.querySelector(`#${[box[1]]} .first .queuePic`).parentNode.getAttribute('onclick')?.match(/[([0-9:]+]/)?.[0]?.slice(1, -1);

                if(!coords || (coords == this.ogl.currentPlanet.obj.coords && this.ogl.currentPlanet.obj.type != 'moon'))
                {
                    this.ogl.currentPlanet.obj.upgrades[techType] = [];

                    let itemEndTime = 0;

                    document.querySelectorAll(`#${[box[1]]} .queuePic`).forEach((item, index) =>
                    {
                        const urlParams = new URLSearchParams(item.parentNode.href);
                        const id = urlParams.get('openTech') || item.parentNode?.getAttribute('onclick')?.match(/([0-9]+)/)[0];

                        if(!id) return; //can't detect def

                        const lvl = item.closest('.first')?.parentNode?.querySelector('.level')?.innerText.match(/\d+/)[0] || item.closest('.first')?.querySelector('.shipSumCount')?.innerText || item.parentNode.innerText;
                        const data = this.getTechData(id, lvl, this.ogl.currentPlanet.obj.id);
                        const endTime = index == 0 ? unsafeWindow[box[0]] * 1000 : data.target.duration;

                        itemEndTime += endTime;

                        const upgrade = {};
                        upgrade.id = id;
                        upgrade.lvl = lvl;
                        upgrade.end = time + itemEndTime;
                        upgrade.type = techType;

                        this.ogl.currentPlanet.obj.upgrades[techType].push(upgrade);
                    });
                }
            }
            else if(document.querySelector(`#${[box[1]]}`))
            {
                const techType = box[1] == 'productionboxbuildingcomponent' ? 'baseBuilding' : box[1] == 'productionboxresearchcomponent' ? 'baseResearch' : box[1] == 'productionboxshipyardcomponent' ? 'ship' : box[1] == 'productionboxlfbuildingcomponent' ? 'lfBuilding' : 'lfResearch';
                this.ogl.currentPlanet.obj.upgrades[techType] = [];
            }
        });
    }
}


class StatsManager extends Manager
{
    load()
    {
        this.ogl.db.stats = this.ogl.db.stats || {};
        this.types = ['raid', 'expe', 'discovery', 'debris', 'debris16', 'blackhole'];
        this.data = {};

        this.miniStats();
    }

    getKey(time)
    {
        const date = new Date(time);
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`; // YYYY-mm-dd
    }

    getKeyDay(oldKey, newDay)
    {
        const date = new Date(oldKey);
        return this.getKey(new Date(date.getFullYear(), date.getMonth(), newDay, 0, 0, 0));
    }

    getKeysPrevMonth(oldKey)
    {
        const date = new Date(oldKey);
        return [this.getKey(new Date(date.getFullYear(), date.getMonth()-1, 1, 0, 0, 0)), this.getKey(new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59))];
    }

    getKeysNextMonth(oldKey)
    {
        const date = new Date(oldKey);
        return [this.getKey(new Date(date.getFullYear(), date.getMonth()+1, 1, 0, 0, 0)), this.getKey(new Date(date.getFullYear(), date.getMonth()+2, 0, 23, 59, 59))];
    }

    getDayStats(time)
    {
        const key = this.getKey(time);
        this.ogl.db.stats[key] = this.ogl.db.stats[key] || {};
        return this.ogl.db.stats[key];
    }

    getData(key)
    {
        const data = this.ogl.db.stats[key];

        const ids = ['metal','crystal','deut','dm','artefact','blackhole',202,203,204,205,206,207,208,209,210,211,212,213,214,215,217,218,219,401,402,403,404,405,406,407,408];
        const result = {};
        result.total = { metal:0, crystal:0, deut:0, dm:0, artefact:0, msu:0 };
        result.expe = {};
        result.raid = {};

        this.types.forEach(type =>
        {
            result[type] = result[type] || {};

            for(let [gainID, amount] of Object.entries(data?.[type]?.gain || {}))
            {
                if(ids.findIndex(e => e == gainID || e == -gainID) > -1)
                {
                    if(isNaN(gainID)) // resource
                    {
                        result.total[gainID] = (result.total[gainID] || 0) + amount;
                        if(type == 'raid' || type == 'debris') result.raid[gainID] = (result.raid[gainID] || 0) + amount;
                        if(type == 'expe' || type == 'debris16' || type == 'blackhole') result.expe[gainID] = (result.expe[gainID] || 0) + amount;
                    }
                    else // ship
                    {
                        const shipData = Datafinder.getTech(Math.abs(gainID));
                        const shipFactor = type == 'expe' ? this.ogl.db.options.expeditionShipRatio / 100 : 1;
                        const sign = parseInt(gainID) > 0 ? 1 : -1;
                        const isIgnored = sign < 0 && (type == 'expe' || type == 'blackhole') && this.ogl.db.options.ignoreExpeShipsLoss;

                        if(!isIgnored)
                        {
                            result.total.metal = (result.total.metal || 0) + (shipData.metal || 0) * amount * shipFactor * sign;
                            result.total.crystal = (result.total.crystal || 0) + (shipData.crystal || 0) * amount * shipFactor * sign;
                            result.total.deut = (result.total.deut || 0) + (shipData.deut || 0) * amount * shipFactor * sign;

                            if(type == 'expe' || type == 'blackhole')
                            {
                                result.expeShip = result.expeShip || {};
                                result.expeShip[Math.abs(gainID)] = (result.expeShip[Math.abs(gainID)] || 0) + amount * sign;
                            }

                            if(type == 'raid' || type == 'debris')
                            {
                                result.raid.metal = (result.raid.metal || 0) + (shipData.metal || 0) * amount * shipFactor * sign;
                                result.raid.crystal = (result.raid.crystal || 0) + (shipData.crystal || 0) * amount * shipFactor * sign;
                                result.raid.deut = (result.raid.deut || 0) + (shipData.deut || 0) * amount * shipFactor * sign;
                            }

                            if(type == 'expe' || type == 'debris16' || type == 'blackhole')
                            {
                                result.expe.metal = (result.expe.metal || 0) + (shipData.metal || 0) * amount * shipFactor * sign;
                                result.expe.crystal = (result.expe.crystal || 0) + (shipData.crystal || 0) * amount * shipFactor * sign;
                                result.expe.deut = (result.expe.deut || 0) + (shipData.deut || 0) * amount * shipFactor * sign;
                            }
                        }
                    }
                }
            }

            for(let [typeID, amount] of Object.entries(data?.[type]?.occurence || {}))
            {
                result[type+'Occurence'] = result[type+'Occurence'] || {};
                result[type+'Occurence'][typeID] = (result[type+'Occurence'][typeID] || 0) + amount;
            }

            result[type].count = (result[type].count || 0) + (data?.[type]?.count || 0);
        });

        result.conso = (result.conso || 0) + (data?.conso || 0);
        if(!this.ogl.db.options.ignoreConsumption) result.total.deut -= result.conso;

        const msu = this.ogl.db.options.msu.split(':');
        result.total.msu = (result.total.metal || 0) * msu[0] + (result.total.crystal || 0) * msu[1] + (result.total.deut || 0) * msu[2];
        result.expe.msu = (result.expe.metal || 0) * msu[0] + (result.expe.crystal || 0) * msu[1] + (result.expe.deut || 0) * msu[2];
        result.raid.msu = (result.raid.metal || 0) * msu[0] + (result.raid.crystal || 0) * msu[1] + (result.raid.deut || 0) * msu[2];

        return result;
    }

    miniStats()
    {
        const now = serverTime;
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const data = this.getData(this.getKey(startDate.getTime()));

        if(!this.miniDiv) this.miniDiv = Util.addDom('div', { class:'ogl_miniStats ogl_ogameDiv', parent:document.querySelector('#links'), onclick:event =>
        {
            if(!event.target.classList.contains('ogl_blackHoleButton'))
            {
                Util.runAsync(() => this.buildStats()).then(e => this.ogl._popup.open(e, true));
            }
        }});

        this.miniDiv.innerText = '';

        const start = new Date(startDate).toLocaleString('default', { day:'numeric', month:'long', year:'numeric' });
        const end = new Date(endDate).toLocaleString('default', { day:'numeric', month:'long', year:'numeric' });
        const title = start == end ? start : `${start}&#10140;<br>${end}`;

        Util.addDom('h3', { class:'ogl_header', child:title, parent:this.miniDiv });

        let content = Util.addDom('div', { parent:this.miniDiv });

        Object.entries(data.total).forEach(entry =>
        {
            Util.addDom('div', {class:`ogl_icon ogl_${entry[0]}`, parent:content, child:`<span>${Util.formatToUnits(entry[1])}</span>`});
        });

        if(!document.querySelector('.ogl_blackHoleButton')) this.addBlackHoleButton();
    }

    buildStats(keyStart, keyEnd)
    {
        const now = serverTime;
        keyStart = keyStart || this.getKey(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime());
        keyEnd = keyEnd || this.getKey(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime());

        const dayEnd = new Date(keyEnd);
        const monthEnd = new Date(dayEnd.getFullYear(), dayEnd.getMonth()+1, 0, 23, 59, 59);

        const container = Util.addDom('div', { class:'ogl_stats' });
        const month = Util.addDom('div', { parent:container, class:'ogl_statsMonth' });

        Util.addDom('div', { parent:month, class:'ogl_button', child:LocalizationStrings?.timeunits?.short?.day || 'D', onclick:() =>
        {
            Util.runAsync(() => this.buildStats()).then(e => this.ogl._popup.open(e, true));
        }});

        Util.addDom('div', { parent:month, class:'ogl_button', child:LocalizationStrings?.timeunits?.short?.week || 'W', onclick:() =>
        {
            const currentMonthStart = this.getKey(new Date(now.getFullYear(), now.getMonth(), now.getDate()-6, 0, 0, 0).getTime());
            const currentMonthEnd = this.getKey(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime());

            Util.runAsync(() => this.buildStats(currentMonthStart, currentMonthEnd)).then(e => this.ogl._popup.open(e, true));
        }});

        Util.addDom('div', { parent:month, class:'ogl_button', child:LocalizationStrings?.timeunits?.short?.month || 'M', onclick:() =>
        {
            const currentMonthStart = this.getKey(new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).getTime());
            const currentMonthEnd = this.getKey(new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59, 59).getTime());

            Util.runAsync(() => this.buildStats(currentMonthStart, currentMonthEnd)).then(e => this.ogl._popup.open(e, true));
        }});

        Util.addDom('div', { parent:month, class:'ogl_separator' });

        Util.addDom('div', { parent:month, class:'ogl_button material-icons', child:'arrow-left-thick', onclick:() =>
        {
            const prevMonth = this.getKeysPrevMonth(keyEnd);
            Util.runAsync(() => this.buildStats(prevMonth[0], prevMonth[1])).then(e => this.ogl._popup.open(e, true));
        }});

        Util.addDom('div', { parent:month, child:monthEnd.toLocaleString('default', { month:'short', year:'numeric' }) });

        Util.addDom('div', { parent:month, class:'ogl_button material-icons', child:'arrow-right-thick', onclick:() =>
        {
            const nextMonth = this.getKeysNextMonth(keyEnd);
            Util.runAsync(() => this.buildStats(nextMonth[0], nextMonth[1])).then(e => this.ogl._popup.open(e, true));
        }});

        let first, initial;
        const inRange = (num, num1, num2) => num >= Math.min(num1, num2) && num <= Math.max(num1, num2);
        const reset = () =>
        {
            if(initial && dateBar)
            {
                dateBar.querySelectorAll('[data-day]').forEach(e => e.classList.remove('ogl_selected'));
                initial.forEach(e => e.classList.add('ogl_selected'));
            }
        }

        const dataset = [];
        const subDataset = [];
        const bars = [];
        const dateBar = Util.addDom('div', { parent:container, class:'ogl_dateBar',
        onmouseup:()=>
        {
            this.isMoving=false;

            const selected = dateBar.querySelectorAll('[data-day].ogl_selected');

            if(!selected || selected.length < 2)
            {
                reset();
                initial.forEach(e => e.classList.add('ogl_selected'))
                return;
            }

            const start = this.getKeyDay(keyEnd, selected[0].getAttribute('data-day'));
            const end = this.getKeyDay(keyEnd, selected[selected.length - 1].getAttribute('data-day'));

            Util.runAsync(() => this.buildStats(start, end)).then(e => this.ogl._popup.open(e, true));
        },
        onmousedown:e =>
        {
            initial = dateBar.querySelectorAll('[data-day].ogl_selected');

            this.isMoving=true;
            dateBar.querySelectorAll('[data-day]').forEach(b => b.classList.remove('ogl_selected'));

            if(e.target.getAttribute('data-day'))
            {
                first = parseInt(e.target.getAttribute('data-day'));
            }

            if(e.target.parentNode.getAttribute('data-day'))
            {
                first = parseInt(e.target.parentNode.getAttribute('data-day'));
            }
        },
        onmouseleave:()=>
        {
            this.isMoving=false;
            first = false;
            reset();
        }});

        const details = Util.addDom('div', { parent:container, class:'ogl_statsDetails' });

        let highest = 0;
        let lowest = 0;

        for(let i=1; i<=monthEnd.getDate(); i++)
        {
            const barKey = this.getKeyDay(keyEnd, i);
            const data = this.getData(barKey);

            if(data.total?.msu < lowest) lowest = data.total?.msu || 0;
            if(data.total?.msu > highest) highest = data.total?.msu || 0;

            dataset.push(data);

            const bar = Util.addDom('div', { class:'ogl_item', parent:dateBar, 'data-day':i, 'data-value':data.total?.msu || 0,
            onclick:() =>
            {
                bars.forEach(e => e.classList.remove('ogl_selected'));
                bar.classList.add('ogl_selected');
                this.displayDetails([data], details, barKey, barKey);
                initial = dateBar.querySelectorAll('[data-day].ogl_selected');
            },
            onmouseenter:() =>
            {
                if(this.isMoving)
                {
                    if(!first) first = parseInt(bar.getAttribute('data-day'));

                    if(this.isMoving)
                    {
                        const current = parseInt(bar.getAttribute('data-day'));

                        dateBar.querySelectorAll('[data-day]').forEach(b =>
                        {
                            const dataDay = parseInt(b.getAttribute('data-day'));

                            if(inRange(dataDay, current, first))
                            {
                                b.classList.add('ogl_selected');
                            }
                            else
                            {
                                b.classList.remove('ogl_selected');
                            }
                        });
                    }
                }
            }});

            bars.push(bar);

            if(Date.parse(barKey) >= Date.parse(keyStart) && Date.parse(barKey) <= Date.parse(keyEnd))
            {
                bar.classList.add('ogl_selected');
            }
        }

        const timeStart = new Date(keyStart).getTime();
        const timeEnd = new Date(keyEnd).getTime();

        Object.keys(this.ogl.db.stats).filter(stat =>
        {
            const date = new Date(stat).getTime();

            if(date >= timeStart && date <= timeEnd)
            {
                subDataset.push(this.getData(stat));
            }
        });

        bars.forEach(bar =>
        {
            const value = parseInt(bar.getAttribute('data-value'));
            let height = Math.ceil(Math.abs(value) / (Math.max(Math.abs(highest), Math.abs(lowest)) / 100));
            height = height > 0 ? Math.max(height, 5) : 0;
            const color = value > 0 ? '#35cf95' : '#e14848';
            
            const content = Util.addDom('div', { parent:bar });
            content.style.background = `linear-gradient(to top, ${color} ${height}%, #0e1116 ${height}%)`;
            

            if(value != 0) bar.classList.add('ogl_active');
        });

        if(subDataset.length < 1)
        {
            const emptyData = {};
            this.types.forEach(type => emptyData[type] = {});
            emptyData.total = {};
            subDataset.push(emptyData);
        }

        this.displayDetails(subDataset, details, keyStart, keyEnd);

        return container;
    }

    displayDetails(dataset, parent, keyStart, keyEnd)
    {
        parent.innerText = '';

        const start = new Date(keyStart).toLocaleString('default', { day:'numeric', month:'long', year:'numeric' });
        const end = new Date(keyEnd).toLocaleString('default', { day:'numeric', month:'long', year:'numeric' });
        const title = keyStart == keyEnd ? start : `${start} -> ${end}`;

        Util.addDom('h3', { child:title, parent:parent });

        const data = dataset.reduce((acc, item) =>
        {
            Object.entries(item).forEach(([key, value]) =>
            {
                if(typeof value === 'object')
                {
                    acc[key] = acc[key] || {};
                    Object.entries(value).forEach(([k, v]) => acc[key][k] = (acc[key][k] || 0) + v);
                }
                else
                {
                    acc[key] = (acc[key] || 0) + value;
                }
            });

            return acc;
        }, {});

        parent.appendChild(this.buildPie(data.expeOccurence));

        const shipTable = Util.addDom('div', { parent:parent, class:'ogl_shipTable' });

        [202,203,204,205,206,207,208,209,210,211,213,214,215,218,219].forEach(shipId =>
        {
            Util.addDom('div', { class:`ogl_icon ogl_${shipId}`, parent:shipTable, child:Util.formatToUnits(data?.expeShip?.[shipId] || '-', false, true) });
        });

        const sumTable = Util.addDom('div', { parent:parent, class:'ogl_sumTable' });

        const header = Util.addDom('div', { parent:sumTable });
        ['', 'send', 'metal', 'crystal', 'deut', 'msu', 'dm', 'artefact'].forEach(resource =>
        {
            if(resource == 'send') Util.addDom('div', { class:`ogl_textCenter ogl_icon material-icons`, child:'send', parent:header });
            else Util.addDom('div', { class:`ogl_icon ogl_${resource}`, parent:header });
        });
        
        ['expe', 'raid', 'conso', 'u', 'total'].forEach(type =>
        {
            const typeLabel = type == 'u' ? 'average' : type;
            const line = Util.addDom('div', { parent:sumTable, child:`<div>${typeLabel}</div>` });

            const count = {}
            count.expe = data.expe.count + data.debris16.count;
            count.raid = data.raid.count + data.debris.count;
            count.total = data.debris.count + data.debris16.count + data.expe.count + data.raid.count + data.discovery.count;

            const missions = Util.addDom('div', { parent:line, child:Util.formatToUnits(count[type] || '-', false, true) });

            if(count[type])
            {
                const tooltip = 
                    type == 'expe' ? `<div>Expedition: ${data.expe.count}</div><div>Debris p16: ${data.debris16.count}</div>` :
                    type == 'raid' ? `<div>Raid: ${data.raid.count}</div><div>Debris: ${data.debris.count}</div>` :
                    type == 'total' ? `<div>Expedition: ${data.expe.count}</div>
                        <div>Debris p16: <span>${data.debris16.count}</span></div>
                        <div>Raid: <span>${data.raid.count}</span></div>
                        <div>Debris: <span>${data.debris.count}</span></div>
                        <div>Discovery: <span>${data.discovery.count}</span></div>` : '';

                missions.classList.add('tooltip');
                missions.setAttribute('data-title', tooltip);
            }

            const uResources = data.debris.count + data.debris16.count + data.expe.count + data.raid.count;
            const uDM = data.expe.count;
            const uArtefacts = data.discovery.count;

            ['metal', 'crystal', 'deut', 'msu', 'dm', 'artefact'].forEach(resource =>
            {
                if(type == 'u')
                {
                    let value = 0;

                    if(resource == 'metal' || resource == 'crystal' || resource == 'deut' || resource == 'msu')
                    {
                        value = data.total[resource] / uResources;
                    }
                    else if(resource == 'dm')
                    {
                        value = data.total[resource] / uDM;
                    }
                    else if(resource == 'artefact')
                    {
                        value = data.total[resource] / uArtefacts;
                    }

                    Util.addDom('div', { class:`ogl_${resource}`, parent:line, child:Util.formatToUnits(Math.floor(isFinite(value) ? value : 0), false, true) });
                }
                else if(type == 'conso' && resource == 'deut')
                {
                    Util.addDom('div', { class:`ogl_${resource}`, parent:line, child:Util.formatToUnits(-data.conso || 0, false, true) });
                }
                else if(type == 'conso' && resource == 'msu')
                {
                    Util.addDom('div', { class:`ogl_${resource}`, parent:line, child:Util.formatToUnits(-data.conso * this.ogl.db.options.msu.split(':')[2] || 0, false, true) });
                }
                else
                {
                    Util.addDom('div', { class:`ogl_${resource}`, parent:line, child:Util.formatToUnits(data[type]?.[resource] || 0, false, true) });
                }
            });
        });
    }

    buildPie(occurencesExpeDetail)
    {
        const pie = Util.addDom('div', { class:'ogl_pie' });

        if(!occurencesExpeDetail || Object.keys(occurencesExpeDetail || {}).length < 1)
        {
            pie.innerHTML = '<div class="ogl_noExpe"><span class="material-icons">compass</span>No expedition data</div>';
            return pie;
        }

        let lastSlice;
        let cumulAngle = 1.5 * Math.PI;
        let mouseXY = { x:0, y:0 };

        let colors =
        {
            nothing:'#ddd',
            resource:'#86edfd',
            darkmatter:'#b58cdb',
            ship:'#1dd1a1',
            battle:'#ffd60b',
            item:'#bf6c4d',
            blackhole:'#818181',
            duration:'#df5252',
            trader:'#ff7d30',
        }

        const pieData = {};
        pieData.resource = occurencesExpeDetail.resource || 0;
        pieData.darkmatter = occurencesExpeDetail.darkmatter || 0;
        pieData.ship = occurencesExpeDetail.ship || 0;
        pieData.nothing = occurencesExpeDetail.nothing || 0;
        pieData.blackhole = occurencesExpeDetail.blackhole || 0;
        pieData.trader = occurencesExpeDetail.trader || 0;
        pieData.item = occurencesExpeDetail.item || 0;
        pieData.battle = (occurencesExpeDetail.pirate || 0) + (occurencesExpeDetail.alien || 0);
        pieData.duration = (occurencesExpeDetail.early || 0) + (occurencesExpeDetail.late || 0);

        const size = 256;
        const center = size / 2;
        const radius = size / 2;
        const slices = [];
        const hoveredColor = '#ffffff';

        const rgbToHex = (r, g, b) =>
        {
            if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
            return ((r << 16) | (g << 8) | b).toString(16);
        }

        const drawPie = hoveredSlice =>
        {
            ctx.clearRect(0, 0, size, size);

            slices.forEach(slice =>
            {
                ctx.beginPath();
                ctx.arc(center, center, radius, slice.startAngle, slice.endAngle);
                ctx.lineTo(center, center);
                ctx.closePath();
                ctx.fillStyle = slice.title == hoveredSlice?.title ? 'white' : slice.color;
                ctx.fill();
            });

            // donut
            ctx.fillStyle = "rgba(0,0,0,.5)";
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2.7, 0, 2 * Math.PI, false);
            ctx.fill();
    
            ctx.fillStyle = "#1b212a";
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI, false);
            ctx.fill();

            pie.setAttribute('data-pie', `${hoveredSlice ? this.ogl._lang.find(hoveredSlice.title) + '\r\n' : ''}${hoveredSlice ? hoveredSlice.percent + '%' : total + '\r\nExpeditions'}`);

            legend.querySelectorAll('.ogl_active').forEach(e => e.classList.remove('ogl_active'));

            if(hoveredSlice)
            {
                legend.querySelector(`[data-entry="${hoveredSlice.title}"]`).classList.add('ogl_active');
            }
        }

        const canvas = Util.addDom('canvas', { parent:pie, width:size, height:size, onmouseout:() => { drawPie();canvas.classList.remove('ogl_interactive'); }, /*onmousemove:event =>
        {
            
            const rect = canvas.getBoundingClientRect();
            mouseXY = { x:event.clientX - rect.left, y:event.clientY - rect.top };

            const colorData = ctx.getImageData(mouseXY.x, mouseXY.y, 1, 1).data;
            const hex = "#" + ("000000" + rgbToHex(colorData[0], colorData[1], colorData[2])).slice(-6);
            const slice = slices.find(slice => slice.color == hex);

            if(lastSlice == slice) return;
            else if(hex != hoveredColor) lastSlice = slice;


            if(slice && hex != hoveredColor) drawPie(slice);
            else if(!slice && hex != hoveredColor) drawPie();
            
            if(slice || hex == hoveredColor) canvas.classList.add('ogl_interactive');
            else canvas.classList.remove('ogl_interactive');
            
        }*/});

        const ctx = canvas.getContext('2d', { willReadFrequently:true });
        const legend = Util.addDom('div', { parent:pie, class:'ogl_pieLegendContainer', onmouseleave:() => drawPie() });

        const dataArray = Object.entries(pieData || {});
        const total = Object.values(occurencesExpeDetail || {}).reduce((accumulator, e) => accumulator + Math.max(0, e), 0);

        pie.setAttribute('data-pie', total);

        for(let [title, value] of dataArray.sort((a, b) => b[1] - a[1]))
        {
            if(value > 0)
            {
                const slice = {};
                slice.title = title;
                slice.value = value;
                slice.percent = (value / total * 100).toFixed(2);
                slice.startAngle = cumulAngle;
                slice.angle = (value / total) * 2 * Math.PI;
                slice.endAngle = cumulAngle + slice.angle;
                slice.color = colors[title];
    
                slices.push(slice);
    
                cumulAngle = slice.endAngle;
    
                Util.addDom('div', { class:'ogl_pieLegend', 'data-resultType':slice.title, 'data-entry':slice.title, parent:legend, child:`<div>${this.ogl._lang.find(title)}</div><span>${Util.formatToUnits(value)}</span><i>${slice.percent}%</i>` });
            }
        }

        drawPie();

        legend.querySelectorAll('.ogl_pieLegend').forEach(line =>
        {
            line.addEventListener('mouseenter', () =>
            {
                const slice = slices.find(slice => slice.title == line.getAttribute('data-entry'));
                drawPie(slice);
            });
        });

        return pie;
    }

    addBlackHoleButton()
    {
        Util.addDom('button', { class:'ogl_button material-icons tooltip ogl_blackHoleButton', 'data-title':this.ogl._lang.find('reportBlackhole'), parent:this.miniDiv, child:'cyclone', onclick:() =>
        {
            this.ogl._popup.open(Util.addDom('div', { child:'<div class="ogl_loading"></div>' }));

            const container = Util.addDom('div', { class:'ogl_keeper ogl_blackhole' });
            Util.addDom('h2', { child:this.ogl._lang.find('reportBlackhole'), parent:container })
            const wrapper = Util.addDom('div', { class:'ogl_shipLimiter', parent:container });

            [202,203,204,205,206,207,208,209,210,211,213,214,215,218,219].forEach(shipID =>
            {
                const item = Util.addDom('div', { class:'ogl_icon ogl_'+shipID, parent:wrapper })
                Util.addDom('input', { class:'ogl_inputCheck', 'data-ship':shipID, parent:item });
            });

            Util.addDom('div', { class:'ogl_button', child:'Add', parent:container, onclick:() =>
            {
                if(confirm(this.ogl._lang.find('reportBlackholeLong')))
                {
                    const result = {};
                    result.date = new Date();
                    result.messageType = 'blackhole';
                    result.gain = {};

                    container.querySelectorAll('input').forEach(input =>
                    {
                        const shipID = parseInt(input.getAttribute('data-ship'));
                        const amount = parseInt(input.value.replace(/\D/g, '')) || 0;

                        if(!isNaN(shipID) && !isNaN(amount)) result.gain[-shipID] = amount;
                    });

                    this.ogl._message.updateStats(result);
                    this.ogl._popup.close();
                }
            }});

            this.ogl._popup.open(container);
        }});
    }
}


class EmpireManager extends Manager
{
    load()
    {
        this.getLFBonuses();
        this.getAllianceClass();

        if(this.ogl.page != 'empire') return;

        unsafeWindow.jumpGateLink = `https://${window.location.host}/game/index.php?page=ajax&component=jumpgate&overlay=1&ajax=1`;
        unsafeWindow.jumpGateLoca = { LOCA_STATION_JUMPGATE_HEADLINE: 'Jumpgate' };

        let updateDone = false;

        let planetData, planetName;

        Util.observe(document.body, {childList:true, subtree:true, attributes:true}, mutation =>
        {
            if(!updateDone && mutation.target.classList.contains('box-end') && mutation.target.closest('.summary') && mutation.target.closest('.groupresources'))
            {
                if(document.querySelector('#loading').style.display == 'none')
                {
                    updateDone = true;

                    this.update(document.querySelector('#mainContent script').innerText, new URLSearchParams(window.location.search).get('planetType'), true);

                    document.querySelectorAll('.planet').forEach(planet =>
                    {
                        const data = this.ogl.db.myPlanets[planet.id.replace('planet', '')];
                        if(!data) return;
    
                        Util.addDom('div', { class:'material-icons ogl_empireJumpgate', child:'jump_to_element', parent:planet.querySelectorAll('.row')[1], onclick:e =>
                        {
                            e.preventDefault();

                            planetData = data;
                            planetName = planet.querySelector('.planetname').getAttribute('title') || planet.querySelector('.planetname').innerText;
                            document.querySelector('.ui-dialog')?.remove();

                            setTimeout(() => openJumpgate(), 5);
                        }});
                    });
                }
            }
            else if(mutation.target.classList.contains('ui-dialog') && document.querySelector('#jumpgate'))
            {
                if(document.querySelector('#jumpgateNotReady')) return;

                if(document.querySelector('.currentlySelected'))
                {
                    const target = document.querySelector('.currentlySelected a');

                    target.setAttribute('data-value', planetData.planetID || planetData.moonID);
                    target.innerText = `${planetName} [${planetData.coords}]`;
                }
                else
                {
                    document.querySelector('#selecttarget select').value = this.ogl.db.myPlanets[planetData.planetID].moonID;
                }

                let resources = [planetData.metal, planetData.crystal, planetData.deut, planetData.food];

                if(this.ogl.db.fleetLimiter.resourceActive)
                {
                    resources[0] = Math.max(0, resources[0] - (this.ogl.db.fleetLimiter.data.metal || 0));
                    resources[1] = Math.max(0, resources[1] - (this.ogl.db.fleetLimiter.data.crystal || 0));
                    resources[2] = Math.max(0, resources[2] - (this.ogl.db.fleetLimiter.data.deut || 0));
                    resources[3] = Math.max(0, resources[3] - (this.ogl.db.fleetLimiter.data.food || 0));
                }

                const total = resources[0] + resources[1] + resources[2] + resources[3];

                document.querySelector(`[name="ship_${this.ogl.db.options.defaultShip}"]`).value = this.ogl._fleet.shipsForResources(this.ogl.db.options.defaultShip, Math.max(0, total));
            }
        });
    }

    update(data, type, fromEmpire)
    {
        this.ogl.db.lastEmpireUpdate = Date.now();
        let allowedEntries = ['id', 'metal', 'crystal', 'deuterium', 'energy', 'food', 'population', 'fieldUsed', 'fieldMax', 'planetID', 'moonID', 'temperature'];

        data = fromEmpire ? JSON.parse(data.match(/{(.*)}/g)[1]) : data;

        data.planets.forEach(planet =>
        {
            this.ogl.db.myPlanets[planet.id] = this.ogl.db.myPlanets[planet.id] || {};
            this.ogl.db.myPlanets[planet.id].type = type === 0 ? 'planet' : 'moon';

            Object.entries(planet).forEach(entry =>
            {
                if(entry[0].indexOf('html') >= 0) return;
                else if(Number(entry[0]) || entry[0].indexOf('Storage') >= 0 || allowedEntries.includes(entry[0])) this.ogl.db.myPlanets[planet.id][entry[0].replace('deuterium', 'deut')] = parseInt(entry[1]);
                else if(entry[0] === 'coordinates') this.ogl.db.myPlanets[planet.id].coords = entry[1].slice(1, -1);
                else if(entry[0] === 'production')
                {
                    this.ogl.db.myPlanets[planet.id].prodMetal = entry[1].hourly[0] / 3600;
                    this.ogl.db.myPlanets[planet.id].prodCrystal = entry[1].hourly[1] / 3600;
                    this.ogl.db.myPlanets[planet.id].prodDeut = entry[1].hourly[2] / 3600;
                }
            });
        });

        if(this.ogl.currentPlanet) this.ogl.currentPlanet.obj = this.ogl.db.myPlanets[document.querySelector('head meta[name="ogame-planet-id"]')?.getAttribute('content')];

        document.querySelectorAll('.planetlink, .moonlink').forEach(planet =>
        {
            const urlParams = new URLSearchParams(planet.getAttribute('href'));
            const id = urlParams.get('cp').split('#')[0];

            ['metal', 'crystal', 'deut'].forEach(resourceName =>
            {
                const resource = this.ogl.db.myPlanets[id]?.[resourceName] || 0;
                const storage = this.ogl.db.myPlanets[id]?.[resourceName+'Storage'] || 0;
                const selector = planet.querySelector('.ogl_available .ogl_'+resourceName);

                if(selector)
                {
                    selector.innerHTML = Util.formatToUnits(resource, 1);
                    if(resource >= storage && planet.classList.contains('planetlink')) selector.classList.add('ogl_danger');
                    else selector.classList.remove('ogl_danger');
                }
                else if(planet.querySelector('.ogl_available .ogl_'+resourceName)) planet.querySelector('.ogl_available .ogl_'+resourceName).innerHTML = Util.formatToUnits(resource, 1);
            });
        });

        if(this.ogl._ui) Util.runAsync(() => this.ogl._ui.displayResourcesRecap());
    }

    getLFBonuses(source)
    {
        const htmlSource = source || document;

        // lf bonuses
        if(source || this.ogl.page == 'lfbonuses')
        {
            this.ogl.db.lfBonuses = {};

            htmlSource.querySelectorAll('bonus-item-content-holder > [data-toggable]').forEach(item =>
            {
                const id = item.getAttribute('data-toggable').replace(/subcategory|Ships|Defenses|CostAndTime/g, '');
                const regex = new RegExp(`[0-9|-]+(${LocalizationStrings.decimalPoint}[0-9]+)?`, 'g');

                const isBaseBuilding = id < 100;
                const isBaseResearch = id > 100 && id <= 199;
                const isBaseShip = id > 200 && id <= 299;
                const isBaseDef = id > 400 && id <= 499;

                const lfBonuses = {};
                const bonuses = []; // bonuses [0]:value, [1]:max

                item.querySelectorAll('bonus-item').forEach(bonus =>
                {
                    const values = (bonus.innerText.match(regex) || []).map(e =>
                    {
                        if(e == '-') return 0;
                        else return parseFloat(e.replace(LocalizationStrings.decimalPoint, '.'));
                    });

                    bonuses.push(values);
                });

                if(bonuses.length == 0)
                {
                    let value = (item.innerText.match(regex) || [])[0];
                    if(!value || value == '-') value = 0;
                    else value = parseFloat(value.replace(LocalizationStrings.decimalPoint, '.'));

                    lfBonuses.bonus = value;
                }

                if(isBaseShip)
                {
                    lfBonuses.armor = bonuses[0][0];
                    lfBonuses.shield = bonuses[1][0];
                    lfBonuses.weapon = bonuses[2][0];
                    lfBonuses.speed = bonuses[3][0];
                    lfBonuses.cargo = bonuses[4][0];
                    lfBonuses.fuel = bonuses[5][0];
                }
                else if(isBaseDef)
                {
                    lfBonuses.armor = bonuses[0][0];
                    lfBonuses.shield = bonuses[1][0];
                    lfBonuses.weapon = bonuses[2][0];
                }
                else if(isBaseResearch || id == 'LfResearch')
                {
                    lfBonuses.cost = bonuses[0][0];
                    lfBonuses.duration = bonuses[1][0];
                }

                this.ogl.db.lfBonuses[id] = lfBonuses;
            });
        }

        // race level
        if(source || this.ogl.page == 'lfbonuses' || this.ogl.page == 'lfsettings')
        {
            this.ogl.db.lfBonuses = this.ogl.db.lfBonuses || {};
    
            htmlSource.querySelectorAll('lifeform-item, .lifeform-item').forEach(item =>
            {
                const lifeform = item.querySelector('.lifeform-item-icon').className.replace(/lifeform-item-icon| /g, '');
                const bonus = item.querySelector('.currentlevel').innerText.replace(/\D/g, '') / 10;
                this.ogl.db.lfBonuses[lifeform] = { bonus:bonus };
            });
        }
    }

    getAllianceClass()
    {
        if(this.ogl.page == 'alliance')
        {
            setTimeout(() =>
            {
                const sprite = alliance.allianceContent[0].querySelector('#allyData .allianceclass.sprite');

                if(!sprite)
                {
                    this.getAllianceClass();
                }
                else
                {
                    Object.entries(allianceClassArr).forEach(entry =>
                    {
                        if(sprite.classList.contains(entry[0])) this.ogl.db.allianceClass = entry[1];
                    });
                }
            }, 1000);
        }
    }
}


class Util
{
    static get ogl() { return unsafeWindow.ogl }
    static get simList()
    {
        return {
            battlesim:'https://battlesim.logserver.net/',
            obatsim:'https://obatsim.stevecohen.fr/',
            'ogame-tools':'https://simulator.ogame-tools.com/',
        }
    }

    static overWrite(fn, context, before, after, newParam1, newParam2)
    {
        const old = context[fn];
        let locked = false;

        context[fn] = function(param1, param2)
        {
            if(before && typeof before === typeof function(){}) locked = before(newParam1 || param1, newParam2 || param2);
            if(!locked) old.call(context, newParam1 || param1, newParam2 || param2);
            if(after && typeof after === typeof function(){} && !locked) after(newParam1 || param1, newParam2 || param2);
        }
    }

    static drawLine(svg, parent, element1, element2)
    {
        if(unsafeWindow.fleetDispatcher && fleetDispatcher.realTarget
        && (fleetDispatcher.targetPlanet.galaxy != fleetDispatcher.realTarget.galaxy
        || fleetDispatcher.targetPlanet.system != fleetDispatcher.realTarget.system
        || fleetDispatcher.targetPlanet.position != fleetDispatcher.realTarget.position
        || fleetDispatcher.targetPlanet.type != fleetDispatcher.realTarget.type)) return;

        svg.querySelector('line')?.remove();

        if(!element1 || !element2 || element1 == element2) return;

        element1 = element1.querySelector('.planetPic, .icon-moon');
        element2 = element2.querySelector('.planetPic, .icon-moon');

        let x1 = Math.round(element1.getBoundingClientRect().left + element1.getBoundingClientRect().width / 2 - parent.getBoundingClientRect().left) - 2;
        let y1 = Math.round(element1.getBoundingClientRect().top + element1.getBoundingClientRect().height / 2 - parent.getBoundingClientRect().top);
        let x2 = Math.round(element2.getBoundingClientRect().left + element2.getBoundingClientRect().width / 2 - parent.getBoundingClientRect().left) - 2;
        let y2 = Math.round(element2.getBoundingClientRect().top + element2.getBoundingClientRect().height / 2 - parent.getBoundingClientRect().top);

        parent.appendChild(svg);

        let line = document.createElementNS('http://www.w3.org/2000/svg','line');
        svg.appendChild(line);

        line.classList.add('ogl_line');
        line.setAttribute('x1',x1);
        line.setAttribute('y1',y1);
        line.setAttribute('x2',x2);
        line.setAttribute('y2',y2);
        line.setAttribute('stroke-dasharray', '7 5');
    }

    static coordsToID(arr)
    {
        if(typeof arr === typeof '') return arr.split(':').map(x => x.padStart(3, '0')).join('');
        else return arr.map(x => x.padStart(3, '0')).join('');
    }

    static removeFromArray(arr, index)
    {
        arr.splice(index, 1);
    }

    static formatNumber(number)
    {
        return (number || '0').toLocaleString('de-DE');
    }

    static formatToUnits(value, forced, colored)
    {
        value = Math.round(value || 0);
        value = (value || 0).toString().replace(/[\,\. ]/g, '');
        if(isNaN(value)) return value;

        let precision = 0;

        value = parseInt(value);

        if(value == 0 || forced === 0 || (value < 1000 && value > -1000)) precision = 0;
        else if(forced === 1 || (value < 1000000 && value > -1000000)) precision = 1;
        else precision = 2;

        const split = Intl.NumberFormat('fr-FR', { notation:'compact', minimumFractionDigits:precision, maximumFractionDigits:precision }).format(value).match(/[a-zA-Z]+|[0-9,-]+/g);
        const result = split[0].replace(/,/g, '.');
        const suffix = split[1]?.replace('Md', 'G').replace('Bn', 'T') || '';

        const resultDom = Util.addDom('span', { class:'ogl_unit', child:`<span>${result}</span><span class="ogl_suffix">${suffix}</span>` });
        if(value < 0 && colored) resultDom.classList.add('ogl_danger');

        return resultDom.outerHTML;
    }

    static formatFromUnits(value)
    {
        if(!value) return 0;
        value = value.toLowerCase();
        let offset = (value.split(LocalizationStrings.thousandSeperator).length - 1) * 3;

        if(LocalizationStrings.thousandSeperator == LocalizationStrings.decimalPoint) offset = 0;

        let splitted = value.match(/\d+/g)[0].length;

        if(value.indexOf(LocalizationStrings.unitMilliard.toLowerCase()) > -1)
        {
            value = value.replace(LocalizationStrings.unitMilliard.toLowerCase(), '');
            value = value.replace(/[\,\. ]/g, '');
            value = value.padEnd(9 + offset + splitted, '0');
        }
        else if(value.indexOf(LocalizationStrings.unitMega.toLowerCase()) > -1)
        {
            value = value.replace(LocalizationStrings.unitMega.toLowerCase(), '');
            value = value.replace(/[\,\. ]/g, '');
            value = value.padEnd(6 + offset + splitted, '0');
        }
        else if(value.indexOf(LocalizationStrings.unitKilo.toLowerCase()) > -1)
        {
            value = value.replace(LocalizationStrings.unitKilo.toLowerCase(), '');
            value = value.replace(/[\,\. ]/g, '');
            value = value.padEnd(3 + offset + splitted, '0');
        }
        else
        {
            value = value.replace(/[\,\. ]/g, '');
        }

        return parseInt(value);
    }

    static formatInput(input, callback, canBeEmpty)
    {
        setTimeout(() =>
        {
            if((!input.value || input.value == 0) && input.classList.contains('ogl_placeholder'))
            {
                input.value = '';
                return;
            }

            // firefox fix
            input.value = input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd);

            let oldLength = input.value.length;
            let mult = 1;
            if(input.value.toLowerCase().indexOf('k') >= 0) mult = 1000;
            else if(input.value.toLowerCase().indexOf('m') >= 0) mult = 1000000;
            else if(input.value.toLowerCase().indexOf('g') >= 0) mult = 1000000000;

            let cursorPosition = input.selectionStart;

            let formattedValue = (parseInt(input.value?.replace(/\D/g, '') || 0) * mult).toString();
            formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            input.value = formattedValue;

            cursorPosition += input.value.length > oldLength ? 1 : input.value.length < oldLength ? -1 : 0;
            input.setSelectionRange(cursorPosition, cursorPosition);

            if(input.value == 0 && canBeEmpty) input.value = '';

            if(callback) callback();
        }, 5);

        /*setTimeout(() =>
        {
            if((!input.value || input.value == 0) && input.classList.contains('ogl_placeholder'))
            {
                input.value = '';
                return;
            }

            // firefox fix
            input.value = input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd);

            let oldLength = input.value.length;
            let mult = 1;
            if(input.value.toLowerCase().indexOf('k') >= 0) mult = 1000;
            else if(input.value.toLowerCase().indexOf('m') >= 0) mult = 1000000;
            else if(input.value.toLowerCase().indexOf('g') >= 0) mult = 1000000000;

            let cursorPosition = input.selectionStart;
            input.value = (parseInt(input.value.replace(/\D/g, '') || 0) * mult).toLocaleString('fr-FR');

            cursorPosition += input.value.length > oldLength ? 1 : input.value.length < oldLength ? -1 : 0;
            input.setSelectionRange(cursorPosition, cursorPosition);

            if(callback) callback();
        });*/
    }

    static reorderArray(arr, index, reversed)
    {
        let newArray = arr.slice(index, arr.length).concat(arr.slice(0, index));;
        return reversed ? newArray.reverse() : newArray;
    }

    static observe(element, options, callback, oglObj)
    {
        options = options || {};

        let tooltipTimeout;
        let sendShipsTimeout;

        new MutationObserver(mutations =>
        {
            if(oglObj && mutations[0].target.tagName.toLowerCase() !== 'progress')
            {
                Util.runAsync(oglObj._time.update, oglObj._time);
                Util.runAsync(oglObj._time.observe, oglObj._time);

                if(document.querySelector('[class*="tooltip"]:not(.ogl_ready)'))
                {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = setTimeout(() =>
                    {
                        Util.runAsync(oglObj._tooltip.init, oglObj._tooltip);
                    }, 200);
                }

                if(document.querySelector('[onclick*="sendShips(6"]:not([data-spy-coords]), [onclick*="sendShipsWithPopup(6"]:not([data-spy-coords])'))
                {
                    clearTimeout(sendShipsTimeout);
                    sendShipsTimeout = setTimeout(() =>
                    {
                        Util.runAsync(oglObj._fleet.checkSendShips, oglObj._fleet);
                    }, 50);
                }
            }

            //console.log(mutations)
            //mutations.forEach(mutation => callback(mutation));
            for(let i=0; i<mutations.length; i++) callback(mutations[i]);

        }).observe(element, options);
    }

    static addDom(tag, params)
    {
        params = params || {};

        let element = document.createElement(tag);
        element.classList.add('ogl_addedElement');

        Object.entries(params).forEach(param =>
        {
            const isIgnored = param[0] === 'before' || param[0] === 'prepend' || param[0] === 'parent' || param[0] === 'after';
            const isContent = param[0] === 'child';
            const isListener = param[0].startsWith('on');
            const isAttribute = !isContent && !isListener && !isIgnored;

            if(isAttribute)
            {
                element.setAttribute(param[0], param[1]);

                if(param[0] == 'class' && param[1].indexOf('material-icons') > -1) element.classList.add('notranslate');
            }
            else if(isListener)
            {
                element.addEventListener(param[0].toLowerCase().slice(2), event => {param[1](event, element)});
            }
            else if(isContent)
            {
                if(typeof param[1] === typeof {})
                {
                    element.appendChild(param[1]);
                }
                else if(typeof param[1] === typeof '' || typeof param[1] === typeof 1)
                {
                    element.innerHTML = param[1].toString();
                }
            }
        });

        if(params.parent) params.parent.appendChild(element);
        else if(params.before) params.before.parentNode.insertBefore(element, params.before);
        else if(params.after) params.after.after(element);
        else if(params.prepend) params.prepend.prepend(element);

        return element;
    }

    static runAsync(fn, scope)
    {
        return new Promise(resolve =>
        {
            setTimeout(() =>
            {
                resolve(scope ? scope[fn.toString().split('(')[0]]() : fn(scope));
            });
        });
    }

    static takeScreenshot(element, button, name, retry)
    {
        if(typeof html2canvas === 'undefined')
        {
            fetch('https://cdn.jsdelivr.net/npm/html2canvas@1.0.0-rc.5/dist/html2canvas.min.js', {method:'get', headers:{'Accept':'application/json'}})
            .then(response => response.text())
            .then(result =>
            {
                retry = (retry || 0) + 1;
                if(retry > 3) return;

                document.head.appendChild(Util.addDom('script', { type:'text/javascript', child:result }));
                Util.takeScreenshot(element, button, name);
            });
        }
        else
        {
            const rect = element.getBoundingClientRect();

            html2canvas(element,
            {
                backgroundColor:null,
                useCORS:true,
                ignoreElements:e => e.classList.contains('ogl_close') || e.classList.contains('ogl_share'),
                x:rect.x,
                y:rect.y,
                scrollX:0,
                scrollY:0,
                width:rect.width,
                height:rect.height,
                windowWidth:document.documentElement.offsetWidth,
                windowHeight:document.documentElement.offsetHeight
            }).then(canvas =>
            {
                const dataURL = canvas.toDataURL();
                const link = Util.addDom('a', {'download':name, 'href':dataURL});
                link.click();
                button.classList.remove('ogl_disabled');
            });
        }
    }

    static hash(str)
    {
        return [...str].reduce((string, char) => Math.imul(31, string) + char.charCodeAt(0) | 0, 0);
    }

    static getPlayerScoreFD(score, type)
    {
        if(!score) return '?';

        const defense = Math.max(score.military - (score.global - score.economy - score.research - score.lifeform), 0);
        const fleet = score.military - defense;

        return type == 'defense' ? defense : fleet;
    }

    static genTrashsimLink(apiKey, attacker, defender, meAsDefender)
    {
        if(attacker)
        {
            ['metal', 'crystal', 'deut', 'food'].forEach(e =>  { if(attacker.ships?.[e]) delete attacker.ships?.[e] });
        }

        let coords = Util.ogl.currentPlanet.obj.coords.split(':');
        let jsonData =
        {
            0: // attacker
            [{
                planet:
                {
                    galaxy:coords[0],
                    system:coords[1],
                    position:coords[2],
                },
                class:Util.ogl.account.class,
                characterClassesEnabled:true,
                allianceClass:Util.ogl.db.allianceClass || 0,
                research:{},
                ships:attacker?.ships || {}
            }],
            1: // defender
            [{
                planet:defender?.planet || {},
                research:{},
                ships:defender?.ships || {}
            }]
        };

        [109, 110, 111, 114, 115, 117, 118].forEach(techID =>
        {
            jsonData[0][0].research[techID] = { level:Util.ogl.currentPlanet.obj[techID] }
        });

        if(!meAsDefender)
        {
            jsonData[0][0].lifeformBonuses = jsonData[0][0].lifeformBonuses || {};
            jsonData[0][0].lifeformBonuses.BaseStatsBooster = jsonData[0][0].lifeformBonuses.BaseStatsBooster || {};

            Util.ogl.shipsList.forEach(shipID =>
            {
                jsonData[0][0].lifeformBonuses.BaseStatsBooster[shipID] = jsonData[0][0].lifeformBonuses.BaseStatsBooster[shipID] || {};

                Object.entries(Util.ogl.db.lfBonuses?.[shipID] || {}).forEach(entry =>
                {
                    if(entry[0] == 'fuel' && entry[1] != 0) jsonData[0][0].lifeformBonuses.ShipFuelConsumption = Math.abs(entry[1] / 100);
                    else jsonData[0][0].lifeformBonuses.BaseStatsBooster[shipID][entry[0]] = entry[1] / 100;
                });
            });

            jsonData[0][0].lifeformBonuses.CharacterClassBooster = {};
            jsonData[0][0].lifeformBonuses.CharacterClassBooster[Util.ogl.account.class] = (ogl.db.lfBonuses?.['Characterclasses'+Util.ogl.account.class]?.bonus || 0) / 100;
        }

        jsonData = btoa(JSON.stringify(jsonData));
        let lang = Util.ogl.account.lang == 'us' ? 'en' : Util.ogl.account.lang == 'ar' ? 'es' : Util.ogl.account.lang;

        const link = Util.simList[Util.ogl.db.options.sim || Object.keys(Util.simList)[Math.floor(Math.random() * Object.keys(Util.simList).length)]];

        if(apiKey) return link + lang + '?SR_KEY=' + apiKey + '#prefill=' + jsonData;
        else return link + lang + '#prefill=' + jsonData;
    }

    static genOgotchaLink(apiKey)
    {
        let lang = Util.ogl.account.lang == 'us' ? 'en' : Util.ogl.account.lang == 'ar' ? 'es' : Util.ogl.account.lang;
        return `https://ogotcha.universeview.be/${lang}?CR_KEY=${apiKey}&utm_source=OGLight`;
    }

    static genTopRaiderLink(apiKey)
    {
        let lang = Util.ogl.account.lang == 'us' ? 'en' : Util.ogl.account.lang == 'ar' ? 'es' : Util.ogl.account.lang;
        return `https://topraider.eu/index.php?CR_KEY=${apiKey}&lang=${lang}`;
    }

    static genMmorpgstatLink(playerID)
    {
        let lang = ['fr', 'de', 'en', 'es', 'pl', 'it', 'ru', 'ar', 'mx', 'tr', 'fi', 'tw', 'gr', 'br', 'nl',
                    'hr', 'sk', 'cz', 'ro', 'us', 'pt', 'dk', 'no', 'se', 'si', 'hu', 'jp', 'ba'].indexOf(Util.ogl.server.lang);

        return `https://www.mmorpg-stat.eu/0_fiche_joueur.php?pays=${lang}&ftr=${playerID}.dat&univers=_${Util.ogl.server.id}`;
    }
}


class PTRE
{
    // const
    static get url() { return `https://ptre.chez.gg/scripts/` }
    static get ogl() { return unsafeWindow.ogl }
    static get playerPositionsDelay() { return 1000*60*60 }
    static get manageSyncedListUrl() { return `https://ptre.chez.gg/?page=players_list` }

    static request(page, init)
    {
        const params = {};
        const options = {};

        if(document.querySelector('.ogl_ptreActionIcon i'))
        {
            if(PTRE.ogl.ptreNotificationIconTimeout) clearTimeout(PTRE.ogl.ptreNotificationIconTimeout);
            document.querySelector('.ogl_ptreActionIcon i').className = 'material-icons ogl_warning';
            document.querySelector('.ogl_ptreActionIcon i').classList.add('ogl_active');
        }

        Object.entries(init).forEach(obj =>
        {
            if(obj[0].indexOf('_') === 0) options[obj[0].replace('_', '')] = obj[1];
            else params[obj[0]] = obj[1];
        });

        params.tool = 'oglight';
        params.team_key = PTRE.ogl.ptreKey;
        params.country = PTRE.ogl.server.lang;
        params.univers = PTRE.ogl.server.id;

        const strParams = !params ? '' : '?' + new URLSearchParams(params).toString();

        return fetch(`${PTRE.url}${page}${strParams}`, options)
        .then(response => response.json())
        .then(data =>
        {
            PTRE.ogl.ptreNotificationIconTimeout = setTimeout(() => PTRE.notify(data.message, data.code, data.message_verbose), 2000);
            return Promise.resolve(data);
        });
    }

    static notify(message, code, verbose)
    {
        if(!document.querySelector('.ogl_ptreActionIcon i')) return;

        document.querySelector('.ogl_ptreActionIcon i').className = 'material-icons';
        document.querySelector('.ogl_ptreActionIcon i').classList.remove('ogl_active');

        if(code != 1)
        {
            PTRE.log(code, verbose || message); // log errors
            document.querySelector('.ogl_ptreActionIcon i').classList.add('ogl_danger');
        }
        else
        {
            document.querySelector('.ogl_ptreActionIcon i').classList.add('ogl_ok');
        }
    }

    static log(code, message)
    {
        const id = serverTime.getTime();

        PTRE.ogl.cache.ptreLogs = PTRE.ogl.cache.ptreLogs || [];
        PTRE.ogl.cache.ptreLogs.push({code:code, message:message, id:id });

        if(PTRE.ogl.cache.ptreLogs.length > 10) PTRE.ogl.cache.ptreLogs.shift();
    }

    static displayLogs()
    {
        const container = Util.addDom('div', { class:'ogl_log' });

        if(PTRE.ogl.cache.ptreLogs?.length > 0)
        {
            PTRE.ogl.cache.ptreLogs.forEach(log =>
            {
                const time = PTRE.ogl._time.convertTimestampToDate(log.id);
    
                Util.addDom('div', { child:`<div>${time.outerHTML}</div><div>${log.code}</div><div>${log.message}</div>`, prepend:container });
            });
    
            Util.addDom('div', { child:`<div>time</div><div>error code</div><div>message</div>`, prepend:container });
        }
        else
        {
            Util.addDom('div', { child:'empty', parent:container });
        }

        Util.addDom('div', { child:`<h2>PTRE errors</h2>`, prepend:container });

        PTRE.ogl._popup.open(container, true);
    }

    static postPositions(postData)
    {
        PTRE.request('api_galaxy_import_infos.php',
        {
            _method:'POST',
            _body:JSON.stringify(postData)
        });
    }

    static postActivities(postData)
    {
        PTRE.request('oglight_import_player_activity.php',
        {
            _method:'POST',
            _body:JSON.stringify(postData)
        })
        .then(data =>
        {
            if(data.code == 1)
            {
                Object.keys(postData).forEach(id =>
                {
                    const parent = document.querySelector(`.msg[data-msg-id="${id}"] .msg_title`);
                    if(parent && !document.querySelector(`.msg[data-msg-id="${id}"] .ogl_checked`)) Util.addDom('div', { class:'material-icons ogl_checked tooltipLeft ogl_ptre', child:'ptre', title:PTRE.ogl._lang.find('ptreActivityImported'), parent:parent });
                
                    if(PTRE.ogl.page == 'messages') PTRE.ogl.cache.counterSpies.push(id);
                });
            }
        });
    }

    static postPTRECompatibility(postData)
    {
        PTRE.request('oglight_update_version.php',
        {
            _method:'POST',
            _body:JSON.stringify(postData)
        })
        .then(data =>
        {
            if(data.code == 1)
            {
                PTRE.ogl.id[1] = serverTime.getTime();
                GM_setValue('ogl_id', PTRE.ogl.id);
            }
        });
    }

    static postSpyReport(apiKey)
    {
        PTRE.request('oglight_import.php',
        {
            _method:'POST',
            sr_id:apiKey
        })
        .then(data =>
        {
            PTRE.ogl._notification.addToQueue(`PTRE: ${data.message_verbose}`, data.code == 1);
        });
    }

    // export targets with the "ptre" flag
    // import all ptre targets and give them the "ptre" flag
    static syncTargetList()
    {
        let json = [];
        Object.values(PTRE.ogl.db.udb).filter(u => u.pin == 'ptre').forEach(player => { json.push({ id:player.uid, pseudo:player.name }); });

        PTRE.request('api_sync_target_list.php',
        {
            _method:'POST',
            _body:JSON.stringify(json)
        })
        .then(data =>
        {
            if(data.code == 1)
            {
                data.targets_array.forEach(playerData =>
                {
                    const id = parseInt(playerData.player_id)
                    const player = PTRE.ogl.db.udb[id] || PTRE.ogl.createPlayer(id);

                    player.name = playerData.pseudo;

                    if(!player.pin) player.pin = 'ptre';
                });

                if(document.querySelector('.ogl_side.ogl_active') && PTRE.ogl.db.lastPinTab == 'ptre')
                {
                    PTRE.ogl._topbar.openPinned();
                }
            }

            PTRE.ogl._notification.addToQueue(`PTRE: ${data.message}`, data.code == 1);
        });
    }

    // player activities in frame
    static getPlayerInfo(player, frame)
    {
        const container = Util.addDom('div', { class:'ogl_ptreContent', child:'<div class="ogl_loading"></div>' });
        PTRE.ogl._popup.open(container);

        frame = frame || 'week';

        PTRE.request('oglight_get_player_infos.php',
        {
            _method:'GET',
            player_id:player.id,
            pseudo:player.name,
            input_frame:frame
        })
        .then(data =>
        {
            if(data.code == 1)
            {
                const arrData = JSON.parse(data.activity_array?.activity_array || '{}');
                const checkData = JSON.parse(data.activity_array?.check_array || '{}');

                container.innerHTML = `
                    <h3>${player.name}</h3>
                    <div class="ogl_ptreActivityBlock">
                        <div class="ogl_frameSelector"></div>
                        <div class="ogl_ptreActivities"><span></span><div></div></div>
                    </div>
                    <div class="ogl_ptreBestReport">
                        <div>${PTRE.ogl._lang.find('reportFound')} (${new Date(data.top_sr_timestamp * 1000).toLocaleDateString('fr-FR')})</div>
                        <div>
                            <div class="ogl_fleetDetail"></div>
                            <b><i class="material-icons">rocket_launch</i>${Util.formatToUnits(data.top_sr_fleet_points)} pts</b>
                        </div>
                        <div>
                            <a class="ogl_button" target="_blank" href="${data.top_sr_link}">${PTRE.ogl._lang.find('topReportDetails')}</a>
                            <a class="ogl_button" target="_blank" href="https://ptre.chez.gg/?country=${PTRE.ogl.server.lang}&univers=${PTRE.ogl.server.id}&player_id=${player.id}">${PTRE.ogl._lang.find('playerProfile')}</a>
                        </div>
                    </div>
                    <!--<ul class="ogl_ptreLegend">
                        <li><u>Green circle</u>: no activity detected & fully checked</li>
                        <li><u>Green dot</u>: no activity detected</li>
                        <li><u>Red dot</u>: multiple activities detected</li>
                        <li><u>Transparent dot</u>: not enough planet checked</li>
                    </ul>-->
                `;

                Object.entries({ 'last24h':'Last 24h', '2days':'2 days', '3days':'3 days', 'week':'Week', '2weeks':'2 weeks', 'month':'Month' }).forEach(range =>
                {
                    const button = Util.addDom('button', { class:'ogl_button', child:range[1], parent:container.querySelector('.ogl_frameSelector'), onclick:() =>
                    {
                        PTRE.getPlayerInfo(player, range[0]);
                    }});

                    if(range[0] == frame) button.classList.add('ogl_active');
                });

                if(data.activity_array.succes == 1)
                {
                    arrData.forEach((line, index) =>
                    {
                        if(!isNaN(line[1]))
                        {
                            let div = Util.addDom('div', { class:'tooltip', child:`<div>${line[0]}</div>` });
                            let span = div.appendChild(Util.addDom('span', { class:'ogl_ptreDotStats' }));
                            let dot = span.appendChild(Util.addDom('div', { 'data-acti':line[1], 'data-check':checkData[index][1] }));

                            let dotValue = line[1] / data.activity_array.max_acti_per_slot * 100 * 7;
                            dotValue = Math.ceil(dotValue / 30) * 30;

                            dot.style.color = `hsl(${Math.max(0, 100 - dotValue)}deg 75% 40%)`;
                            dot.style.opacity = checkData[index][1] + '%';

                            let title;
                            let checkValue = Math.max(0, 100 - dotValue);

                            if(checkValue === 100) title = '- No activity detected';
                            else if(checkValue >= 60) title = '- A few activities detected';
                            else if(checkValue >= 40) title = '- Some activities detected';
                            else title = '- A lot of activities detected';

                            if(checkData[index][1] == 100) title += '<br>- Perfectly checked';
                            else if(checkData[index][1] >= 75) title += '<br>- Nicely checked';
                            else if(checkData[index][1] >= 50) title += '<br>- Decently checked';
                            else if(checkData[index][1] > 0) title = 'Poorly checked';
                            else title = 'Not checked';

                            div.setAttribute('title', title);

                            if(checkData[index][1] === 100 && line[1] == 0) dot.classList.add('ogl_active');

                            container.querySelector('.ogl_ptreActivities > div').appendChild(div);
                        }
                    });
                }

                if(data.fleet_json)
                {
                    PTRE.ogl.shipsList.forEach(shipID =>
                    {
                        const shipData = data.fleet_json.find(e => e.ship_type == shipID);
                        if(shipData)
                        {
                            Util.addDom('div', { class:`ogl_icon ogl_${shipID}`, child:Util.formatToUnits(shipData.count), parent:container.querySelector('.ogl_fleetDetail') });
                        }
                    });
                }

                PTRE.ogl._popup.open(container, true);
            }
            else
            {
                container.innerHTML = `${data.message}<hr><a target="_blank" href="https://ptre.chez.gg/?page=splash">More informations here</a>`;
            }
        });
    }

    // check for new positions
    static getPlayerPositions(playerData)
    {
        const updateList = () =>
        {
            if(document.querySelector('.ogl_pinDetail') && PTRE.ogl.db.currentSide == playerData.id) // current pin
            {
                PTRE.ogl._topbar.openPinnedDetail(playerData.id, true);
            }
        }

        const player = PTRE.ogl.db.udb[playerData.id] || PTRE.ogl.createPlayer(playerData.player_id);

        PTRE.ogl._fetch.fetchPlayerAPI(playerData.id, playerData.name, () =>
        {
            if(PTRE.ogl.ptreKey && serverTime.getTime() - (player.ptre || 0) > PTRE.playerPositionsDelay)
            {
                PTRE.request('api_galaxy_get_infos.php',
                {
                    _method:'GET',
                    player_id:playerData.id,
                })
                .then(data =>
                {
                    if(data.code == 1)
                    {
                        updateList();
                        player.ptre = serverTime.getTime();

                        data.galaxy_array.forEach(ptrePlanet =>
                        {
                            const oglPlanet = PTRE.ogl.db.pdb[ptrePlanet.coords] || {};

                            if((oglPlanet.api || 0) < ptrePlanet.timestamp_ig)
                            {
                                oglPlanet.uid = ptrePlanet.player_id;
                                oglPlanet.pid = ptrePlanet.id;
                                oglPlanet.mid = ptrePlanet.moon?.id || -1;
                                oglPlanet.coo = ptrePlanet.coords;
                                oglPlanet.acti = ['60', '60', ptrePlanet.timestamp_ig];

                                // remove old planet owner
                                PTRE.ogl.removeOldPlanetOwner(ptrePlanet.coords, ptrePlanet.player_id);

                                // add new planet owner
                                if(player.planets && player.planets.indexOf(ptrePlanet.coords) < 0)
                                {
                                    player.planets.push(ptrePlanet.coords);
                                }

                                PTRE.ogl.db.pdb[ptrePlanet.coords] = oglPlanet;

                                if(document.querySelector('.ogl_pinDetail') && PTRE.ogl.db.currentSide == ptrePlanet.player_id)
                                {
                                    PTRE.ogl._topbar.openPinnedDetail(PTRE.ogl.db.currentSide);
                                }
                            }
                        });
                    }

                    PTRE.ogl._notification.addToQueue(`PTRE: ${data.message}`, data.code == 1);
                });
            }
            else
            {
                updateList();
            }
        });
    }
}


class Datafinder
{
    static getTech(id)
    {
        let tech =
        {
            // base building
            1: { metal:60, crystal:15, deut:0, priceFactor:1.5 },
            2: { metal:48, crystal:24, deut:0, priceFactor:1.6 },
            3: { metal:225, crystal:75, deut:0, priceFactor:1.5 },
            4: { metal:75, crystal:30, deut:0, priceFactor:1.5 },
            12: { metal:900, crystal:360, deut:180, priceFactor:1.8 },
            14: { metal:400, crystal:120, deut:200 },
            15: { metal:1000000, crystal:500000, deut:100000, durationFactor:1 },
            21: { metal:400, crystal:200, deut:100 },
            22: { metal:1000, crystal:0, deut:0 },
            23: { metal:1000, crystal:500, deut:0 },
            24: { metal:1000, crystal:1000, deut:0 },
            31: { metal:200, crystal:400, deut:200 },
            33: { metal:0, crystal:50000, deut:100000, energy:1000, energyFactor:2 },
            34: { metal:20000, crystal:40000, deut:0 },
            36: { metal:200, crystal:0, deut:50, energy:50, priceFactor:5, energyFactor:2.5 },
            41: { metal:20000, crystal:40000, deut:20000 },
            42: { metal:20000, crystal:40000, deut:20000 },
            43: { metal:2000000, crystal:4000000, deut:2000000 },
            44: { metal:20000, crystal:20000, deut:1000 },

            // base research
            106: { metal:200, crystal:1000, deut:200 },
            108: { metal:0, crystal:400, deut:600 },
            109: { metal:800, crystal:200, deut:0 },
            110: { metal:200, crystal:600, deut:0 },
            111: { metal:1000, crystal:0, deut:0 },
            113: { metal:0, crystal:800, deut:400 },
            114: { metal:0, crystal:4000, deut:2000 },
            115: { metal:400, crystal:0, deut:600 },
            117: { metal:2000, crystal:4000, deut:600 },
            118: { metal:10000, crystal:20000, deut:6000 },
            120: { metal:200, crystal:100, deut:0 },
            121: { metal:1000, crystal:300, deut:100 },
            122: { metal:2000, crystal:4000, deut:1000 },
            123: { metal:240000, crystal:400000, deut:160000 },
            124: { metal:4000, crystal:8000, deut:4000, priceFactor:1.75 },
            199: { metal:0, crystal:0, deut:0, energy:300000, priceFactor:3, energyFactor:3, durationFactor:1 },

            // ship
            202: { metal:2000,      crystal:2000,       deut:0 },
            203: { metal:6000,      crystal:6000,       deut:0 },
            204: { metal:3000,      crystal:1000,       deut:0 },
            205: { metal:6000,      crystal:4000,       deut:0 },
            206: { metal:20000,     crystal:7000,       deut:2000 },
            207: { metal:45000,     crystal:15000,      deut:0 },
            208: { metal:10000,     crystal:20000,      deut:10000 },
            209: { metal:10000,     crystal:6000,       deut:2000 },
            210: { crystal:1000,       deut:0 },
            211: { metal:50000,     crystal:25000,      deut:15000 },
            212: { metal:0,         crystal:2000,       deut:500 },
            213: { metal:60000,     crystal:50000,      deut:15000 },
            214: { metal:5000000,   crystal:4000000,    deut:1000000 },
            215: { metal:30000,     crystal:40000,      deut:15000 },
            217: { metal:2000,      crystal:2000,       deut:1000 },
            218: { metal:85000,     crystal:55000,      deut:20000 },
            219: { metal:8000,      crystal:15000,      deut:8000 },
            
            // def
            401: { metal:2000,  crystal:0,      deut:0 },
            402: { metal:1500,  crystal:500,    deut:0 },
            403: { metal:6000,  crystal:2000,   deut:0 },
            404: { metal:20000, crystal:15000,  deut:2000 },
            405: { metal:5000,  crystal:3000,   deut:0 },
            406: { metal:50000, crystal:50000,  deut:30000 },
            407: { metal:10000, crystal:10000,  deut:0 },
            408: { metal:50000, crystal:50000,  deut:0 },

            // missile
            502: { metal:8000, crystal:0, deut:2000 },
            503: { metal:12000, crystal:2500, deut:10000 },

            // lifeforms
            "11101":{"type":"building","lifeform":"human","metal":7,"crystal":2,"deut":0,"priceFactor":1.2,"bonus1BaseValue":210,"bonus1IncreaseFactor":1.21,"bonus2BaseValue":16,"bonus2IncreaseFactor":1.2,"bonus3Value":9,"bonus3IncreaseFactor":1.15,"durationfactor":1.21,"durationbase":40},"11102":{"type":"building","lifeform":"human","metal":5,"crystal":2,"deut":0,"energy":8,"priceFactor":1.23,"energyIncreaseFactor":1.02,"bonus1BaseValue":10,"bonus1IncreaseFactor":1.15,"bonus2BaseValue":10,"bonus2IncreaseFactor":1.14,"durationfactor":1.25,"durationbase":40},"11103":{"type":"building","lifeform":"human","metal":20000,"crystal":25000,"deut":10000,"energy":10,"priceFactor":1.3,"energyIncreaseFactor":1.08,"bonus1BaseValue":0.25,"bonus1IncreaseFactor":1,"bonus1Max":0.25,"bonus2BaseValue":2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.25,"durationbase":16000},"11104":{"type":"building","lifeform":"human","metal":5000,"crystal":3200,"deut":1500,"energy":15,"priceFactor":1.7,"energyIncreaseFactor":1.25,"bonus1BaseValue":20000000,"bonus1IncreaseFactor":1.1,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"durationfactor":1.6,"durationbase":16000},"11105":{"type":"building","lifeform":"human","metal":50000,"crystal":40000,"deut":50000,"energy":30,"priceFactor":1.7,"energyIncreaseFactor":1.25,"bonus1BaseValue":100000000,"bonus1IncreaseFactor":1.1,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"durationfactor":1.7,"durationbase":64000},"11106":{"type":"building","lifeform":"human","metal":9000,"crystal":6000,"deut":3000,"energy":40,"priceFactor":1.5,"energyIncreaseFactor":1.1,"bonus1BaseValue":1.5,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":2000},"11107":{"type":"building","lifeform":"human","metal":25000,"crystal":13000,"deut":7000,"priceFactor":1.09,"bonus1BaseValue":1,"bonus1IncreaseFactor":1,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"bonus2Max":0.8,"bonus3Value":0.8,"bonus3IncreaseFactor":1,"durationfactor":1.17,"durationbase":12000},"11108":{"type":"building","lifeform":"human","metal":50000,"crystal":25000,"deut":15000,"energy":80,"priceFactor":1.5,"energyIncreaseFactor":1.1,"bonus1BaseValue":1.5,"bonus1IncreaseFactor":1,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"durationfactor":1.2,"durationbase":28000},"11109":{"type":"building","lifeform":"human","metal":75000,"crystal":20000,"deut":25000,"energy":50,"priceFactor":1.09,"energyIncreaseFactor":1.02,"bonus1BaseValue":1.5,"bonus1IncreaseFactor":1,"bonus2BaseValue":1.5,"bonus2IncreaseFactor":1,"durationfactor":1.2,"durationbase":40000},"11110":{"type":"building","lifeform":"human","metal":150000,"crystal":30000,"deut":15000,"energy":60,"priceFactor":1.12,"energyIncreaseFactor":1.03,"bonus1BaseValue":5,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":52000},"11111":{"type":"building","lifeform":"human","metal":80000,"crystal":35000,"deut":60000,"energy":90,"priceFactor":1.5,"energyIncreaseFactor":1.05,"bonus1BaseValue":0.5,"bonus1IncreaseFactor":1,"bonus1Max":1,"durationfactor":1.3,"durationbase":90000},"11112":{"type":"building","lifeform":"human","metal":250000,"crystal":125000,"deut":125000,"energy":100,"priceFactor":1.15,"energyIncreaseFactor":1.02,"bonus1BaseValue":3,"bonus1IncreaseFactor":1,"bonus1Max":0.9,"durationfactor":1.2,"durationbase":95000},"11201":{"type":"tech 1","lifeform":"human","metal":5000,"crystal":2500,"deut":500,"priceFactor":1.3,"bonus1BaseValue":1,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":1000},"11202":{"type":"tech 2","lifeform":"human","metal":7000,"crystal":10000,"deut":5000,"priceFactor":1.5,"bonus1BaseValue":0.06,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":2000},"11203":{"type":"tech 3","lifeform":"human","metal":15000,"crystal":10000,"deut":5000,"priceFactor":1.3,"bonus1BaseValue":0.5,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":2500},"11204":{"type":"tech 4","lifeform":"human","metal":20000,"crystal":15000,"deut":7500,"priceFactor":1.3,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":3500},"11205":{"type":"tech 5","lifeform":"human","metal":25000,"crystal":20000,"deut":10000,"priceFactor":1.3,"bonus1BaseValue":4,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":4500},"11206":{"type":"tech 6","lifeform":"human","metal":35000,"crystal":25000,"deut":15000,"priceFactor":1.5,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.99,"durationfactor":1.3,"durationbase":5000},"11207":{"type":"tech 7","lifeform":"human","metal":70000,"crystal":40000,"deut":20000,"priceFactor":1.3,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":8000},"11208":{"type":"tech 8","lifeform":"human","metal":80000,"crystal":50000,"deut":20000,"priceFactor":1.5,"bonus1BaseValue":0.06,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":6000},"11209":{"type":"tech 9","lifeform":"human","metal":320000,"crystal":240000,"deut":100000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":6500},"11210":{"type":"tech 10","lifeform":"human","metal":320000,"crystal":240000,"deut":100000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":7000},"11211":{"type":"tech 11","lifeform":"human","metal":120000,"crystal":30000,"deut":25000,"priceFactor":1.5,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.99,"durationfactor":1.3,"durationbase":7500},"11212":{"type":"tech 12","lifeform":"human","metal":100000,"crystal":40000,"deut":30000,"priceFactor":1.3,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":10000},"11213":{"type":"tech 13","lifeform":"human","metal":200000,"crystal":100000,"deut":100000,"priceFactor":1.3,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":8500},"11214":{"type":"tech 14","lifeform":"human","metal":160000,"crystal":120000,"deut":50000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":9000},"11215":{"type":"tech 15","lifeform":"human","metal":160000,"crystal":120000,"deut":50000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":9500},"11216":{"type":"tech 16","lifeform":"human","metal":320000,"crystal":240000,"deut":100000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":10000},"11217":{"type":"tech 17","lifeform":"human","metal":300000,"crystal":180000,"deut":120000,"priceFactor":1.5,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"bonus1Max":0.99,"durationfactor":1.3,"durationbase":11000},"11218":{"type":"tech 18","lifeform":"human","metal":500000,"crystal":300000,"deut":200000,"priceFactor":1.2,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"bonus1Max":0.99,"durationfactor":1.3,"durationbase":13000},"12101":{"type":"building","lifeform":"rocktal","metal":9,"crystal":3,"deut":0,"priceFactor":1.2,"bonus1BaseValue":150,"bonus1IncreaseFactor":1.216,"bonus2BaseValue":12,"bonus2IncreaseFactor":1.2,"bonus3Value":5,"bonus3IncreaseFactor":1.15,"durationfactor":1.21,"durationbase":40},"12102":{"type":"building","lifeform":"rocktal","metal":7,"crystal":2,"deut":0,"energy":10,"priceFactor":1.2,"energyIncreaseFactor":1.03,"bonus1BaseValue":8,"bonus1IncreaseFactor":1.15,"bonus2BaseValue":6,"bonus2IncreaseFactor":1.14,"durationfactor":1.21,"durationbase":40},"12103":{"type":"building","lifeform":"rocktal","metal":40000,"crystal":10000,"deut":15000,"energy":15,"priceFactor":1.3,"energyIncreaseFactor":1.1,"bonus1BaseValue":0.25,"bonus1IncreaseFactor":1,"bonus1Max":0.25,"bonus2BaseValue":2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.25,"durationbase":16000},"12104":{"type":"building","lifeform":"rocktal","metal":5000,"crystal":3800,"deut":1000,"energy":20,"priceFactor":1.7,"energyIncreaseFactor":1.35,"bonus1BaseValue":16000000,"bonus1IncreaseFactor":1.14,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"durationfactor":1.6,"durationbase":16000},"12105":{"type":"building","lifeform":"rocktal","metal":50000,"crystal":40000,"deut":50000,"energy":60,"priceFactor":1.65,"energyIncreaseFactor":1.3,"bonus1BaseValue":90000000,"bonus1IncreaseFactor":1.1,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"durationfactor":1.7,"durationbase":64000},"12106":{"type":"building","lifeform":"rocktal","metal":10000,"crystal":8000,"deut":1000,"energy":40,"priceFactor":1.4,"energyIncreaseFactor":1.1,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":2000},"12107":{"type":"building","lifeform":"rocktal","metal":20000,"crystal":15000,"deut":10000,"priceFactor":1.2,"bonus1BaseValue":1.5,"bonus1IncreaseFactor":1,"bonus2BaseValue":0.5,"bonus2IncreaseFactor":1,"bonus2Max":0.4,"durationfactor":1.25,"durationbase":16000},"12108":{"type":"building","lifeform":"rocktal","metal":50000,"crystal":35000,"deut":15000,"energy":80,"priceFactor":1.5,"energyIncreaseFactor":1.3,"bonus1BaseValue":1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"bonus2Max":0.5,"durationfactor":1.4,"durationbase":40000},"12109":{"type":"building","lifeform":"rocktal","metal":85000,"crystal":44000,"deut":25000,"energy":90,"priceFactor":1.4,"energyIncreaseFactor":1.1,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":40000},"12110":{"type":"building","lifeform":"rocktal","metal":120000,"crystal":50000,"deut":20000,"energy":90,"priceFactor":1.4,"energyIncreaseFactor":1.1,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":52000},"12111":{"type":"building","lifeform":"rocktal","metal":250000,"crystal":150000,"deut":100000,"energy":120,"priceFactor":1.8,"energyIncreaseFactor":1.3,"bonus1BaseValue":0.5,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"durationfactor":1.3,"durationbase":90000},"12112":{"type":"building","lifeform":"rocktal","metal":250000,"crystal":125000,"deut":125000,"energy":100,"priceFactor":1.5,"energyIncreaseFactor":1.1,"bonus1BaseValue":0.6,"bonus1IncreaseFactor":1,"bonus1Max":0.3,"durationfactor":1.3,"durationbase":95000},"12201":{"type":"tech 1","lifeform":"rocktal","metal":10000,"crystal":6000,"deut":1000,"priceFactor":1.5,"bonus1BaseValue":0.25,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":1000},"12202":{"type":"tech 2","lifeform":"rocktal","metal":7500,"crystal":12500,"deut":5000,"priceFactor":1.5,"bonus1BaseValue":0.08,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":2000},"12203":{"type":"tech 3","lifeform":"rocktal","metal":15000,"crystal":10000,"deut":5000,"priceFactor":1.5,"bonus1BaseValue":0.08,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":2500},"12204":{"type":"tech 4","lifeform":"rocktal","metal":20000,"crystal":15000,"deut":7500,"priceFactor":1.3,"bonus1BaseValue":0.4,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":3500},"12205":{"type":"tech 5","lifeform":"rocktal","metal":25000,"crystal":20000,"deut":10000,"priceFactor":1.5,"bonus1BaseValue":0.08,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":4500},"12206":{"type":"tech 6","lifeform":"rocktal","metal":50000,"crystal":50000,"deut":20000,"priceFactor":1.5,"bonus1BaseValue":0.25,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":5000},"12207":{"type":"tech 7","lifeform":"rocktal","metal":70000,"crystal":40000,"deut":20000,"priceFactor":1.5,"bonus1BaseValue":0.08,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":5500},"12208":{"type":"tech 8","lifeform":"rocktal","metal":160000,"crystal":120000,"deut":50000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":6000},"12209":{"type":"tech 9","lifeform":"rocktal","metal":75000,"crystal":55000,"deut":25000,"priceFactor":1.5,"bonus1BaseValue":0.15,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.3,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":6500},"12210":{"type":"tech 10","lifeform":"rocktal","metal":85000,"crystal":40000,"deut":35000,"priceFactor":1.5,"bonus1BaseValue":0.08,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":7000},"12211":{"type":"tech 11","lifeform":"rocktal","metal":120000,"crystal":30000,"deut":25000,"priceFactor":1.5,"bonus1BaseValue":0.08,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":7500},"12212":{"type":"tech 12","lifeform":"rocktal","metal":100000,"crystal":40000,"deut":30000,"priceFactor":1.5,"bonus1BaseValue":0.08,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":8000},"12213":{"type":"tech 13","lifeform":"rocktal","metal":200000,"crystal":100000,"deut":100000,"priceFactor":1.2,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.1,"bonus2IncreaseFactor":1,"durationfactor":1.3,"durationbase":8500},"12214":{"type":"tech 14","lifeform":"rocktal","metal":220000,"crystal":110000,"deut":110000,"priceFactor":1.3,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":9000},"12215":{"type":"tech 15","lifeform":"rocktal","metal":240000,"crystal":120000,"deut":120000,"priceFactor":1.3,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":9500},"12216":{"type":"tech 16","lifeform":"rocktal","metal":250000,"crystal":250000,"deut":250000,"priceFactor":1.4,"bonus1BaseValue":0.5,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":10000},"12217":{"type":"tech 17","lifeform":"rocktal","metal":500000,"crystal":300000,"deut":200000,"priceFactor":1.5,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":13000},"12218":{"type":"tech 18","lifeform":"rocktal","metal":300000,"crystal":180000,"deut":120000,"priceFactor":1.7,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":11000},"13101":{"type":"building","lifeform":"mecha","metal":6,"crystal":2,"deut":0,"priceFactor":1.21,"bonus1BaseValue":500,"bonus1IncreaseFactor":1.205,"bonus2BaseValue":24,"bonus2IncreaseFactor":1.2,"bonus3Value":22,"bonus3IncreaseFactor":1.15,"durationfactor":1.22,"durationbase":40},"13102":{"type":"building","lifeform":"mecha","metal":5,"crystal":2,"deut":0,"energy":8,"priceFactor":1.18,"energyIncreaseFactor":1.02,"bonus1BaseValue":18,"bonus1IncreaseFactor":1.15,"bonus2BaseValue":23,"bonus2IncreaseFactor":1.12,"durationfactor":1.2,"durationbase":48},"13103":{"type":"building","lifeform":"mecha","metal":30000,"crystal":20000,"deut":10000,"energy":13,"priceFactor":1.3,"energyIncreaseFactor":1.08,"bonus1BaseValue":0.25,"bonus1IncreaseFactor":1,"bonus1Max":0.25,"bonus2BaseValue":2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.25,"durationbase":16000},"13104":{"type":"building","lifeform":"mecha","metal":5000,"crystal":3800,"deut":1000,"energy":10,"priceFactor":1.8,"energyIncreaseFactor":1.2,"bonus1BaseValue":40000000,"bonus1IncreaseFactor":1.1,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"durationfactor":1.6,"durationbase":16000},"13105":{"type":"building","lifeform":"mecha","metal":50000,"crystal":40000,"deut":50000,"energy":40,"priceFactor":1.8,"energyIncreaseFactor":1.2,"bonus1BaseValue":130000000,"bonus1IncreaseFactor":1.1,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"durationfactor":1.7,"durationbase":64000},"13106":{"type":"building","lifeform":"mecha","metal":7500,"crystal":7000,"deut":1000,"priceFactor":1.3,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"bonus1Max":0.99,"durationfactor":1.3,"durationbase":2000},"13107":{"type":"building","lifeform":"mecha","metal":35000,"crystal":15000,"deut":10000,"energy":40,"priceFactor":1.5,"energyIncreaseFactor":1.05,"bonus1BaseValue":1,"bonus1IncreaseFactor":1,"bonus1Max":1,"bonus2BaseValue":0.3,"bonus2IncreaseFactor":1,"durationfactor":1.4,"durationbase":16000},"13108":{"type":"building","lifeform":"mecha","metal":50000,"crystal":20000,"deut":30000,"energy":40,"priceFactor":1.07,"energyIncreaseFactor":1.01,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"bonus2BaseValue":2,"bonus2IncreaseFactor":1,"durationfactor":1.17,"durationbase":12000},"13109":{"type":"building","lifeform":"mecha","metal":100000,"crystal":10000,"deut":3000,"energy":80,"priceFactor":1.14,"energyIncreaseFactor":1.04,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"bonus2BaseValue":6,"bonus2IncreaseFactor":1,"durationfactor":1.3,"durationbase":40000},"13110":{"type":"building","lifeform":"mecha","metal":100000,"crystal":40000,"deut":20000,"energy":60,"priceFactor":1.5,"energyIncreaseFactor":1.1,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":52000},"13111":{"type":"building","lifeform":"mecha","metal":55000,"crystal":50000,"deut":30000,"energy":70,"priceFactor":1.5,"energyIncreaseFactor":1.05,"bonus1BaseValue":0.4,"bonus1IncreaseFactor":1,"bonus1Max":1,"durationfactor":1.3,"durationbase":50000},"13112":{"type":"building","lifeform":"mecha","metal":250000,"crystal":125000,"deut":125000,"energy":100,"priceFactor":1.4,"energyIncreaseFactor":1.05,"bonus1BaseValue":1.3,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"durationfactor":1.4,"durationbase":95000},"13201":{"type":"tech 1","lifeform":"mecha","metal":10000,"crystal":6000,"deut":1000,"priceFactor":1.5,"bonus1BaseValue":0.08,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":1000},"13202":{"type":"tech 2","lifeform":"mecha","metal":7500,"crystal":12500,"deut":5000,"priceFactor":1.3,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":2000},"13203":{"type":"tech 3","lifeform":"mecha","metal":15000,"crystal":10000,"deut":5000,"priceFactor":1.5,"bonus1BaseValue":0.03,"bonus1IncreaseFactor":1,"bonus1Max":0.3,"durationfactor":1.4,"durationbase":2500},"13204":{"type":"tech 4","lifeform":"mecha","metal":20000,"crystal":15000,"deut":7500,"priceFactor":1.3,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":3500},"13205":{"type":"tech 5","lifeform":"mecha","metal":160000,"crystal":120000,"deut":50000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":4500},"13206":{"type":"tech 6","lifeform":"mecha","metal":50000,"crystal":50000,"deut":20000,"priceFactor":1.5,"bonus1BaseValue":0.06,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":5000},"13207":{"type":"tech 7","lifeform":"mecha","metal":70000,"crystal":40000,"deut":20000,"priceFactor":1.3,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":5500},"13208":{"type":"tech 8","lifeform":"mecha","metal":160000,"crystal":120000,"deut":50000,"priceFactor":1.5,"bonus1BaseValue":1,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":6000},"13209":{"type":"tech 9","lifeform":"mecha","metal":160000,"crystal":120000,"deut":50000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":6500},"13210":{"type":"tech 10","lifeform":"mecha","metal":85000,"crystal":40000,"deut":35000,"priceFactor":1.2,"bonus1BaseValue":0.15,"bonus1IncreaseFactor":1,"bonus1Max":0.9,"durationfactor":1.3,"durationbase":7000},"13211":{"type":"tech 11","lifeform":"mecha","metal":120000,"crystal":30000,"deut":25000,"priceFactor":1.3,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":7500},"13212":{"type":"tech 12","lifeform":"mecha","metal":160000,"crystal":120000,"deut":50000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":8000},"13213":{"type":"tech 13","lifeform":"mecha","metal":200000,"crystal":100000,"deut":100000,"priceFactor":1.5,"bonus1BaseValue":0.06,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":8500},"13214":{"type":"tech 14","lifeform":"mecha","metal":160000,"crystal":120000,"deut":50000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":9000},"13215":{"type":"tech 15","lifeform":"mecha","metal":320000,"crystal":240000,"deut":100000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":9500},"13216":{"type":"tech 16","lifeform":"mecha","metal":320000,"crystal":240000,"deut":100000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":10000},"13217":{"type":"tech 17","lifeform":"mecha","metal":500000,"crystal":300000,"deut":200000,"priceFactor":1.5,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":13000},"13218":{"type":"tech 18","lifeform":"mecha","metal":300000,"crystal":180000,"deut":120000,"priceFactor":1.7,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":11000},"14101":{"type":"building","lifeform":"kaelesh","metal":4,"crystal":3,"deut":0,"priceFactor":1.21,"bonus1BaseValue":250,"bonus1IncreaseFactor":1.21,"bonus2BaseValue":16,"bonus2IncreaseFactor":1.2,"bonus3Value":11,"bonus3IncreaseFactor":1.15,"durationfactor":1.22,"durationbase":40},"14102":{"type":"building","lifeform":"kaelesh","metal":6,"crystal":3,"deut":0,"energy":9,"priceFactor":1.2,"energyIncreaseFactor":1.02,"bonus1BaseValue":12,"bonus1IncreaseFactor":1.15,"bonus2BaseValue":12,"bonus2IncreaseFactor":1.14,"durationfactor":1.22,"durationbase":40},"14103":{"type":"building","lifeform":"kaelesh","metal":20000,"crystal":15000,"deut":15000,"energy":10,"priceFactor":1.3,"energyIncreaseFactor":1.08,"bonus1BaseValue":0.25,"bonus1IncreaseFactor":1,"bonus1Max":0.25,"bonus2BaseValue":2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.25,"durationbase":16000},"14104":{"type":"building","lifeform":"kaelesh","metal":7500,"crystal":5000,"deut":800,"energy":15,"priceFactor":1.8,"energyIncreaseFactor":1.3,"bonus1BaseValue":30000000,"bonus1IncreaseFactor":1.1,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"durationfactor":1.7,"durationbase":16000},"14105":{"type":"building","lifeform":"kaelesh","metal":60000,"crystal":30000,"deut":50000,"energy":30,"priceFactor":1.8,"energyIncreaseFactor":1.3,"bonus1BaseValue":100000000,"bonus1IncreaseFactor":1.1,"bonus2BaseValue":1,"bonus2IncreaseFactor":1,"durationfactor":1.8,"durationbase":64000},"14106":{"type":"building","lifeform":"kaelesh","metal":8500,"crystal":5000,"deut":3000,"priceFactor":1.25,"bonus1BaseValue":1,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"durationfactor":1.35,"durationbase":2000},"14107":{"type":"building","lifeform":"kaelesh","metal":15000,"crystal":15000,"deut":5000,"priceFactor":1.2,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":12000},"14108":{"type":"building","lifeform":"kaelesh","metal":75000,"crystal":25000,"deut":30000,"energy":30,"priceFactor":1.05,"energyIncreaseFactor":1.03,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"bonus2BaseValue":6,"bonus2IncreaseFactor":1,"durationfactor":1.18,"durationbase":16000},"14109":{"type":"building","lifeform":"kaelesh","metal":87500,"crystal":25000,"deut":30000,"energy":40,"priceFactor":1.2,"energyIncreaseFactor":1.02,"bonus1BaseValue":200,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":40000},"14110":{"type":"building","lifeform":"kaelesh","metal":150000,"crystal":30000,"deut":30000,"energy":140,"priceFactor":1.4,"energyIncreaseFactor":1.05,"bonus1BaseValue":2,"bonus1IncreaseFactor":1,"bonus1Max":0.3,"durationfactor":1.8,"durationbase":52000},"14111":{"type":"building","lifeform":"kaelesh","metal":75000,"crystal":50000,"deut":55000,"energy":90,"priceFactor":1.2,"energyIncreaseFactor":1.04,"bonus1BaseValue":1.5,"bonus1IncreaseFactor":1,"bonus1Max":0.7,"durationfactor":1.3,"durationbase":90000},"14112":{"type":"building","lifeform":"kaelesh","metal":500000,"crystal":250000,"deut":250000,"energy":100,"priceFactor":1.4,"energyIncreaseFactor":1.05,"bonus1BaseValue":0.5,"bonus1IncreaseFactor":1,"bonus1Max":0.3,"durationfactor":1.3,"durationbase":95000},"14201":{"type":"tech 1","lifeform":"kaelesh","metal":10000,"crystal":6000,"deut":1000,"priceFactor":1.5,"bonus1BaseValue":0.03,"bonus1IncreaseFactor":1,"bonus1Max":0.3,"durationfactor":1.4,"durationbase":1000},"14202":{"type":"tech 2","lifeform":"kaelesh","metal":7500,"crystal":12500,"deut":5000,"priceFactor":1.5,"bonus1BaseValue":0.08,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":2000},"14203":{"type":"tech 3","lifeform":"kaelesh","metal":15000,"crystal":10000,"deut":5000,"priceFactor":1.5,"bonus1BaseValue":0.05,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"durationfactor":1.4,"durationbase":2500},"14204":{"type":"tech 4","lifeform":"kaelesh","metal":20000,"crystal":15000,"deut":7500,"priceFactor":1.5,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":3500},"14205":{"type":"tech 5","lifeform":"kaelesh","metal":25000,"crystal":20000,"deut":10000,"priceFactor":1.5,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":4500},"14206":{"type":"tech 6","lifeform":"kaelesh","metal":50000,"crystal":50000,"deut":20000,"priceFactor":1.3,"bonus1BaseValue":0.4,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":5000},"14207":{"type":"tech 7","lifeform":"kaelesh","metal":70000,"crystal":40000,"deut":20000,"priceFactor":1.5,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.99,"durationfactor":1.3,"durationbase":5500},"14208":{"type":"tech 8","lifeform":"kaelesh","metal":80000,"crystal":50000,"deut":20000,"priceFactor":1.2,"bonus1BaseValue":0.6,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":6000},"14209":{"type":"tech 9","lifeform":"kaelesh","metal":320000,"crystal":240000,"deut":100000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":6500},"14210":{"type":"tech 10","lifeform":"kaelesh","metal":85000,"crystal":40000,"deut":35000,"priceFactor":1.2,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"durationfactor":1.2,"durationbase":7000},"14211":{"type":"tech 11","lifeform":"kaelesh","metal":120000,"crystal":30000,"deut":25000,"priceFactor":1.5,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":7500},"14212":{"type":"tech 12","lifeform":"kaelesh","metal":100000,"crystal":40000,"deut":30000,"priceFactor":1.5,"bonus1BaseValue":0.06,"bonus1IncreaseFactor":1,"durationfactor":1.3,"durationbase":8000},"14213":{"type":"tech 13","lifeform":"kaelesh","metal":200000,"crystal":100000,"deut":100000,"priceFactor":1.5,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"bonus1Max":0.99,"durationfactor":1.3,"durationbase":8500},"14214":{"type":"tech 14","lifeform":"kaelesh","metal":160000,"crystal":120000,"deut":50000,"priceFactor":1.5,"bonus1BaseValue":1,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":9000},"14215":{"type":"tech 15","lifeform":"kaelesh","metal":240000,"crystal":120000,"deut":120000,"priceFactor":1.5,"bonus1BaseValue":0.1,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":9500},"14216":{"type":"tech 16","lifeform":"kaelesh","metal":320000,"crystal":240000,"deut":100000,"priceFactor":1.5,"bonus1BaseValue":0.3,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":10000},"14217":{"type":"tech 17","lifeform":"kaelesh","metal":500000,"crystal":300000,"deut":200000,"priceFactor":1.5,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"bonus1Max":0.5,"bonus2BaseValue":0.2,"bonus2IncreaseFactor":1,"bonus2Max":0.99,"durationfactor":1.3,"durationbase":13000},"14218":{"type":"tech 18","lifeform":"kaelesh","metal":300000,"crystal":180000,"deut":120000,"priceFactor":1.7,"bonus1BaseValue":0.2,"bonus1IncreaseFactor":1,"durationfactor":1.4,"durationbase":11000}
        }

        return tech[parseInt(id)];
    }

    static getAllExpeditionsText()
    {
        return {nothing:["bueno ahora sabemos que esas anomalías r","tu flota expedición siguió unas peculiar","un ser pura energía causó que toda la tr","a pesar los prometedores escaneos prelim","quizás no deberíamos haber celebrado el ","podivný počítačový virus nakazil navigač","dziwny wirus komputerowy zaatakował syst","krátko po opustení našej slnečnej sústav","udover nogle underlige smådyr på en uken","un virus calculator a atacat sistemele n","een onbekend computervirus is in het nav","egy ismeretlen számítógép vírus támadta ","uno strano virus per computer ha intacca","a strange computer virus attacked the na","un virus informatique a fait planter vot","un extraño virus informático atacó el si","ein seltsames computervirus legte kurz n","um virus computador atacou o sistema nav","το σύστημα ναυσιπλοϊας προσβλήθηκε από κ","evrenin tüm yönbulma sistemleri garip bi","экспедиция не принесла ничего особого кр","celá expedice strávila mnoho času zírání","żywa istota zbudowana z czystej energii ","neznáma životná forma z čistej energie s","en skabelse af ren energi sikrede at eks","o fiinta formata din energie pura s-a as","een levensvorm van pure energie hypnotis","egy élőlény akit tiszta energiából csiná","una forma di vita di pura energia ha fat","a living being made out of pure energy c","une forme vie composée d`énergie pure a ","un ser pura energía se aseguró que todos","eine lebensform aus reiner energie hat d","um ser feito energia hipnotizou toda a t","μια οντότητα αποτελούμενη από καθαρή ενέ","bu kesif seni kelimenin tam anlamiyla ev","несмотря на первые многообещающие сканы ","porucha v reaktoru velitelské lodi málem","awaria reaktora głównego statku ekspedyc","kaptajnens fødselsdagsfest burde nok ikk","un esec la reactorul navei lider aproape","een storing in reactor van het moedersch","a vezető hajó reaktorának meghibásodása ","un problema al reattore della nave ammir","a failure in the flagships reactor core ","un problème réacteur a failli détruire t","un fallo en los motores la nave insignia","ein reaktorfehler des führungsschiffes h","um problema no reactor da nave principal","μια αποτυχία στον αντιδραστήρα του ηγούμ","bu kesif sonucunda kücük garip bir yarat","неполадка в реакторе ведущего корабля чу","někdo nainstaloval na palubní počítače e","ekspedycja niemalże została złapana prze","oslava kapitánových narodenín na povrchu","det nye navigationsmodul har stadigvæk n","iemand heeft een oud strategiespel geïns","valaki feltelepített egy régi stratégiai","qualcuno ha installato un antico gioco d","due to a failure in the central computer","quelqu`un a installé un jeu stratégie su","alguien instaló un viejo juego estrategi","irgendjemand hat auf allen schiffscomput","alguém instalou um velho jogo estratégia","κάποιος εγκατέστησε ένα παλιό παιχνίδι σ","filo merkez gemisinin reaktöründeki hata","жизненная форма состоящая из чистой энер","tvá expedice se poučila o prázdnosti tét","ekspedycja napotkała na rozległą pustkę ","din ekspedition har lært om store tomrum","expeditia ta a invatat despre pustietate","de expeditie heeft uitgebreid onderzoek ","az expedíciód megtanulta mi a nagy üres ","la tua spedizione si è imbattuta nel vuo","your expedition has learnt about the ext","votre expédition a découvert le vide pas","tu expedición aprendió acerca del extens","deine expedition hat wortwörtlich mit de","a tripulação descobriu o significado da ","η αποστολή έμαθε για το αχανές κενό του ","bu bölgeden gelen ilk raporlar cok ilgi ","ваша экспедиция в прямом смысле слова по","あなたの艦隊はこの空間にはなにもないことを学んだ、小惑星や何か分子でさえ存在しな","zdá se že jsme na té osamělé planetě nem","naš ekspedicijski tim je naišao na čudnu","ktoś zainstalował w komputerach statku s","en fejl i moderskibets reaktor ødelagde ","echipa noastră expediție a ajuns la o co","waarschijnlijk was het toch geen goed id","valószínűleg a kapitányok szülinapi ünne","forse le celebrazioni per il compleanno ","our expedition team came across a strang","nous n`aurions peut-être pas dû fêter l`","probablemente la celebración del cumplea","vielleicht hätte man den geburtstag des ","provavelmente a festa aniversário do cap","τα γενέθλια του καπετάνιου μάλλον δεν έπ","ilginc bir sekilde gemi mürettabindan bi","ваша экспедиция сделала замечательные сн","až na pár prvních velmi slibných scannů ","iako su prva skeniranja sektora bila dob","mimo pierwszych obiecujących skanów tego","den nye og vovede kommandør har med succ","in ciuda primelor foarte promitatoare sc","ondanks veelbelovende scans van deze sec","az eleinte ígéretes letapogatási eredmén","nonostante la prima scansione mostrasse ","despite the first very promising scans o","malgré un scan du secteur assez promette","a pesar los resultados iniciales escaneo","trotz der ersten vielversprechenden scan","embora este sector tenha mostrado result","δυστυχώς παρά τις πολλά υποσχόμενες αρχι","kesif filon acil durum sinyali yakaladi!","ну по крайней мере мы теперь знаем что к","už víme že ty podivné anomálie dokážou z","teraz wiemy że czerwone anomalie klasy 5","fajn - prinajmenšom už vieme že červené ","ei bine acum stim ca acele anomalii rosi","hoe dan ook we weten nu in ieder geval d","nos mostmár tudjuk hogy azok a piros 5-ö","bene ora sappiamo che le anomalie rosse ","well now we know that those red class 5 ","bien nous savons désormais que les anoma","bueno ahora sabemos que esas 5 anomalías","nun zumindest weiß man jetzt dass rote a","bem agora sabemos que aquelas anomalias ","τώρα λοιπόν γνωρίζουμε πως αυτές οι αστρ","galiba kaptanin dogumgününün bu bilinmed","вскоре после выхода за пределы солнечной","expedice pořídila skvělé záběry supernov","podczas wyprawy zrobiono wspaniałe zdjęc","expedícii sa podarilo zaznamenať úžasné ","expeditia ta a facut poze superbe la o s","je expeditie heeft adembenemende foto`s ","az expedíciód egy fantasztikus képet kés","la tua spedizione ha fatto stupende foto","your expedition took gorgeous pictures o","votre expédition a fait superbes images ","tu expedición hizo magníficas fotos una ","deine expedition hat wunderschöne bilder","a expedição tirou lindas fotos uma super","η αποστολή έβγαλε μερικές φαντασμαγορικέ","kesif filon supernova` nin cok güzel res","думаю не стоило всё-таки отмечать день р","expedice po nějakou dobu sledovala podiv","ekspedycja śledziła dziwny sygnał od jak","expedičná flotila sledovala zvláštny sig","din ekspeditionsflåde opsnapper nogle un","flota ta expeditie a urmarit niste semna","je expeditievloot heeft korte tijd vreem","az expedíciós flottád különös jeleket kö","la tua flotta in esplorazione ha seguito","your expedition fleet followed odd signa","votre expédition a suivi la trace signau","tu flota en expedición siguió señales fu","deine expeditionsflotte folgte einige ze","a tua frota expedição seguiu uns sinais ","η αποστολή σας ακολούθησε περίεργα σήματ","eh en azindan simdi herkes 5 siniftan ki","кто-то установил на всех корабельных ком","až na pár malých zvířátek z neznámé baži","ekspedicija nije vratila ništa drugo osi","poza osobliwymi małymi zwierzętami pocho","okrem zvláštneho domáceho zvieratka z ne","cu exceptia unor animale mici pe o plane","behalve een bijzonder vreemd klein dier ","néhány kicsi furcsa háziállaton kívül am","eccetto alcuni quaint piccoli animali pr","besides some quaint small pets from a un","mis à part quelques petits animaux prove","además algunos pintorescos pequeños anim","außer einiger kurioser kleiner tierchen ","para além uns pequenos e esquisitos anim","εκτός από μερικά περίεργα μικρά ζώα από ","bir ara kesif filona garip sinyaller esl","ваш экспедиционный флот следовал некотор","あなたの艦隊は沼地の惑星で風変わりなペットを見つけた以外に何も収穫がありませんで","tvá expedice málem nabourala do neutrono","vaša ekspedicija je naletjela u gravitac","ktoś zainstalował w komputerach statku s","ekspeditionsflåden kom tæt på gravitatio","expeditia ta aproape că a nimerit in câm","je expeditie kwam bijna in een zwaartekr","az expedíciód túl közel került egy neutr","la tua spedizione si è imbattuta nel cam","your expedition nearly ran into a neutro","votre flotte d`expédition a eu chaud ell","tu expedición casi entra en el campo gra","deine expeditionsflotte geriet gefährlic","a tua frota entrou no campo gravitaciona","η αποστολή σας παραλίγο να εγκλωβιστεί σ","tüm mürettebatın saf enerjiden oluşan bi","ваш экспедиционный флот попал в опасную ","chyba nie powinniśmy byli urządzać przyj","a strange computer virus infected the sh","the expeditionary fleet followed the str","tu expedición se ha enfrentado textualme","aparte unos pintorescos animalitos prove","a sua frota expedição seguiu uns sinais ","um estranho vírus computador atacou ao s","apesar inicialmente esse setor ter mostr","uma falha no reator da nave principal qu","a sua expedição entrou no campo gravitac","a sua expedição descobriu o significado ","além uns pequenos e esquisitos animais u","din ekspedition tog fantastiske billeder","en underlig computervirus angreb navigat","på grund af en fejl i det centrale compu","trods det første meget lovende skan af s","tja nu ved vi at der røde klasse 5 urege","retkikuntasi otti mahtavia kuvia superno","retkikuntasi seurasi outoja signaaleja j","outo tietokonevirus iski navigaatiojärje","lippulaivan keskustietokoneessa ilmennee","puhtaasta energiasta tehty elävä pakotti","huolimatta erittäin lupaavista ensimmäis","retkikuntajoukkueemme saapui oudolle sii","no nyt tiedämme että noilla punaisilla l","vika lippulaivan reaktorin ytimessä lähe","retkiuntasi lähes ajautui neutronitähden","retkikuntasi on oppinut paljon avaruuden","lukuunottamatta joitakin vanhanaikaisia ","zbog otkazivanja brodskog reaktora jedno","čudni računalni virus je zarazio brodsku","sada znamo da te crvene anomalije klase ","vaša ekspedicija je prikupila nova sazna","vasa ekspedicija je snimila prelijepe sl","ekspedicijska flota je pratila čudan sig","netko je instalirao staru stratešku igru","živo biće napravljeno od čiste energije ","旗艦の動力炉の故障によりあなたの艦隊は壊滅しかけました。幸いにも有能な技術者によ","あなたの艦隊は中性子惑星の引力に曳かれ、脱出するのに幾ばくかの時間がかかりました","あなたの探索チームは、はるか昔に廃れた妙なコロニーにたどり着いた。\n着陸後、乗組","我々の本星のある太陽系を脱出するとすぐに、奇妙なコンピューターウイルスがナビゲー","私たちはクラス５に分類されるエリアは船のナビゲーションシステムを狂わすだけではな","あなたの艦隊は素晴らしい超新星の写真を撮ることに成功した。探索としては特に何も無","あなたの艦隊は奇妙なシグナルに近づきました。そしてそれは異星人の調査船の動力炉か","旗艦のメインコンピューターの故障により探索任務は中止されました。残念ながら艦隊は","艦隊に接近してきた小型エネルギー生命体によってあなたの艦隊の乗組員は睡眠状態に陥","とても見込みのある領域を探索したのにも関わらず、残念ながら収穫なしに帰還しました","tu expedición ha aprendido sobre el exte","cineva a instalat cu joc strategic vechi","ett fel i ledarskeppets reaktor förstörd","din expedition körde nästan in i ett gra","förutom lite lustiga små djur från en ok","kaptenens födelsedagsfest skulle kanske ","ett konstigt datorvirus attackerade navi","ja nu vet vi iallafall att där röda klas","din expedition har lärt sig hur tom rymd","din expedition tog läckra bilder utav en","din expeditionsflotta följde några märkl","någon installerade ett gammalt strategis","en varelse gjord utav enbart energi gjor","trots den första mycket lovande satellit","zaradi odpovedi enega od ladijskih motor","tvoja ekspedicija je naletela na gravita","ekspedicija je prinesla nazaj samo neka ","naša ekspedicija je naletela na čudno ko","čuden virus je napadel navigacijski sist","zdaj vsaj vemo da te rdeče razreda 5 ano","tvoja ekspedicija je pridobila znanje o ","tvoji ekspediciji je uspelo narediti vel","ekspedicijska flota je nekaj časa spreml","prišlo je do napake na računalniških sis","naleteli smo na vesoljsko bitje ki je om","čeprav so bile prve raziskave področja o","porucha na reaktore veliteľskej lodi tak","tvoja expedícia takmer skončila v gravit","členovia výpravy sa počas expedície dôkl","nejaký dobrák nainštaloval do palubného ","napriek pozitívnym očakávaniam vychádzaj","旗艦的反應器失常差點導致整個遠征探險艦隊覆滅值得慶幸的是技術專家們表現極為出色避","您的遠征探險隊誤入了一顆中子星的引力場需要一段時間來掙脫該力場由於在掙脫時幾乎將","在那個不知名的沼澤行星上除了一些新奇有趣的小動物這次遠征探險艦隊在旅程中一無所獲","我們的遠征探險隊途徑一個已經廢棄很久的怪異殖民星降落以後我們的船員感染了一種外星","就在剛離開我們母星太陽系宙域不久後一種怪異的電腦病毒入侵了導航系統這使得遠征探險","現在我們已經知道了那些紅色5級異象不僅對艦船的導航系統帶來混亂干擾同時也使船員產","您的遠征探險隊已對帝國遼闊的空域瞭如指掌這裡毫無新意甚至連一顆小行星或輻射源乃至","您的遠征探險隊拍攝了超新星華麗的照片雖然遠征探險隊沒有帶回來任何新的發現但是最起","您的遠征探險隊斷斷續續追蹤到一些奇怪的訊號後來才知道原來那些訊號是從古老的間諜衛","由於旗艦的中央電腦系統發生錯誤探險任務不得不終止另外由於電腦故障的原因我們的艦隊","一個散發著高純能量的生物悄然來到甲板上用意念控制所有的探險隊員令他們凝視著電腦熒","儘管我們是第一個來到這個非常有希望的區域很不幸我們空手而歸\n\n通訊官日誌記錄似乎","儘管我們是第一個來到這個非常有希望的區域很不幸我們空手而歸\n\n通訊官日誌記錄作為","your expedition has learned about the ex"],early:["tvá expedice nenalezla nic zajímavého v ","twoja ekspedycja nie wykryła żadnych ano","din ekspedition har ikke rapporteret nog","je expeditie heeft geen rariteiten gevon","az expedícióid nem jelentett semmilyen r","la tua spedizione non riporta alcuna ano","your expeditions doesn`t report any anom","votre expédition ne signale aucune parti","tu expedición no informa ninguna anomalí","deine expedition meldet keine besonderhe","a tua expedição não reportou qualquer an","η αποστολή σας δεν αναφέρει ανωμαλίες στ","tüm mürettebatın saf enerjiden oluşan bi","неожиданное замыкание в энергетических к","nečekané výboje v skladištích energie mo","niespodziewane sprzężenie zwrotne w zwoj","den nye og vovede kommandør har med succ","o neasteptata explozie la motoarele din ","een onverwachte terugkoppeling in energi","váratlanul meghibásodtak a hajtóművek a ","un componente inserito nel generatore di","an unexpected back coupling in the energ","un petit défaut dans les réacteurs votre","un inesperado acoplamiento energía en lo","eine unvorhergesehene rückkopplung in de","um problema no reactor da nave principal","μια απρόσμενη ανάστροφη σύζευξη στα ενερ","kesfedilen bölgede olagandisi bir veriye","отважный новый командир использовал нест","nový a odvážný velitel letky úspěšně pro","młody odważny dowódca pomyślnie przedost","en uforudset tilbagekobling i energispol","noul si putin indraznetul comandant a tr","je nieuwe en ongeremde vlootcommandant h","az új és kicsit merész parancsnok sikere","il nuovo e audace comandante ha usato co","the new and daring commander successfull","votre nouveau commandant bord étant asse","¡el nuevo y un poco atrevido comandante ","der etwas wagemutige neue kommandant nut","um comandante novo e destemido conseguiu","ο νέος και τολμηρός διοικητής ταξίδευσε ","motor takımlarının enerji halkalarında y","ваша экспедиция не сообщает ничего необы","keşif filon bir şekilde nötron yıldızlar","geminin yeni komutani oldukca cesur cikt","a sua expedição não reportou nenhuma ano","retikuntasi ei raportoi mitään poikkeami","el nuevo comandante que es bastante osad","o novo e destemido comandante conseguiu ","uusi ja rohkea komentaja ohjasi laivueen","novi i odvažni komander je uspješno puto","izvještaji ekspedicije ne javljaju nikak","新任の勇敢な指揮官は不安定なワームホールを通って帰還を早めることに成功しました。","あなたの艦隊は探索した地域で異変を発見することはできませんでした。しかし、艦隊は","expeditia ta nu raporteaza nici o anorma","den nya och lite orädda befälhavaren lyc","dina expeditioner rapporterar inga avvik","novi poveljnik je uspešno potoval skozi ","poročila ekspedicije ne poročajo o nikak","nový mimoriadne ctižiadostivý veliteľ ús","naša výprava nehlási žiadne anomálie v s","年輕而膽識過人的指揮官成功穿越了一個不穩定的蟲洞減少了返回的飛行時間!而然這支遠","您的遠征探險艦隊報告稱在遠征探險的宇宙空域內並沒有找到什麼異象正當他們返回之時艦","um problema inesperado no campo energéti","odottamaton takaisinkytkentä moottorin e","neke anomalije u motorima ekspedicijskih","en oväntad omvänd koppling i energispola","anomalije v motorjih ekspedicijskih ladi","neočakávané spätné výboje v pohonných je","在引擎的能源軸線上發生了一個未能預期耦合逆轉狀況導致艦隊加速了返回時間遠征探險艦"],late:["debido a motivos desconocidos el salto l","tu expedición entró en un sector asolado","z neznámých důvodů se expedice vynořila ","z nieznanych powodów ekspedycja nieomal ","z neznámych dôvodov sa expedícii podaril","på grund af en ukendt fejl gik ekspediti","datorita motivelor necunoscute saltul ex","door onbekende oorzaak is expeditiespron","ismeretlen okok miatt az expedíciós ugrá","per ragioni sconosciute il salto nell`ip","for unknown reasons the expeditions jump","pour une raison inconnue le saut spatial","a causa razones desconocidas el salto la","aus bisher unbekannten gründen ging der ","devido a razões ainda desconhecidas o sa","για άγνωστη αιτία το άλμα της αποστολής ","kırmızı devin yildiz rüzgari yüzünden ke","халтурно собранный навигатор неправильно","tvůj navigátor se dopustil vážné chyby v","główny nawigator miał zły dzień co spowo","navigátor výpravy sa dopustil hrubej chy","din navigationschef havde en dårlig dag ","de navigatieleider had een slechte dag w","a navigációs vezetőnek rossz napja volt ","una svista commessa dal capo-navigazione","your navigator made a grave error in his","une erreur calcul votre officier navigat","el líder la navegación tuvo un mal día y","ein böser patzer des navigators führte z","um erro no sistema navegação fez com que","ο κυβερνήτης της αποστολής δε κοιμήθηκε ","sebebi bilinmeyen bir arizadan dolayi gö","новый навигационный модуль всё-таки имее","nový navigační modul má pořád nějaké mou","ekspeditionens moderskib havde et sammen","noul modul navigare inca se lupta cu une","de nieuwe navigatiemodule heeft nog een ","kesif filon tanecik fırtınası yaşanan bi","звёздный ветер от красного гиганта исказ","nowy system nawigacyjny nadal nie jest w","das neue navigationsmodul hat wohl doch ","o novo módulo navegação ainda tem alguns","a navigációs modul még hibákkal kűzd az ","il nuovo modulo di navigazione sta ancor","the new navigation module is still buggy","votre module navigation semble avoir que","el nuevo módulo navegación está aún luch","το νέο σύστημα ναυσιπλοΐας αντιμετωπίζει","kesif merkez gemin hicbir uyarida bulunm","по пока неустановленным причинам прыжок ","sluneční vítr rudého obra překazil skok ","gwiezdny wiatr wiejący ze strony czerwon","din navigationschef havde en dårlig dag ","vantul unei stele ale unui gigant rosu a","de zonnewind van een rode reus verstoord","egy vörös óriás csillagszele tönktretett","il vento-stellare di una gigante rossa h","the solar wind of a red giant ruined the","le vent solaire causé par une supernova ","el viento una estrella gigante roja arru","der sternwind eines roten riesen verfäls","o vento solar uma gigante vermelha fez c","ο αστρικός άνεμος ενός κόκκινου γίγαντα ","kesif filon navigasyon sistemindeki önem","ваша экспедиция попала в сектор с усилен","tvoje expedice se dostala do sektoru pln","ekspedicija je završila u sektoru sa olu","twoja ekspedycja osiągnęła sektor pełen ","din ekspedition er kommet ind i en parti","expediția a ajuns în mijlocul unei furtu","je expeditie komt terecht in een sector ","az expedíciód egy részecskeviharral teli","la tua spedizione è andata in un settore","your expedition went into a sector full ","votre expédition a dû faire face à plusi","tu expedición entró en un sector lleno t","deine expedition geriet in einen sektor ","a missão entrou num sector com tempestad","η αποστολή σας βρέθηκε σε τομέα σωματιδι","yeni yönbulma ünitesi hala sorunlarla sa","ведущий корабль вашего экспедиционного ф","velitelská loď expedice se při výstupu z","główny statek ekspedycyjny zderzył się z","nava mama a expeditiei a facut o coliziu","het moederschip van expeditie is in bots","az expedició fő hajója ütközött egy ideg","la nave ammiraglia della tua spedizione ","the expedition`s flagship collided with ","un vos vaisseaux est entré en collision ","la nave principal la expedición colision","das führungsschiff deiner expeditionsflo","a nave principal colidiu com uma nave es","η ναυαρχίδα της αποστολής συγκρούστηκε μ","el viento estelar una gigante roja ha ar","el nuevo módulo navegación aún está lidi","un pequeño fallo del navegador provocó u","el nuevo módulo navegación está aún llen","a missão entrou num setor com tempestade","o vento uma estrela vermelha gigante fez","stjernevinden i en gigantisk rød stjerne","retkikuntasi päätyi hiukkasmyrskyn täytt","tuntemattomista syistä lentorata oli tot","punaisen jättiläisen aurinkotuuli pilasi","navigaatiomoduuli on silti buginen retki","navigaattori teki vakavan virheen laskel","a nave principal da expedição colidiu co","retkikuntasi lippulaiva vieraaseen aluks","ekspedicijska flota se susrela sa neprij","navigator glavnog broda je imao loš dan ","zbog nepoznatih razloga ekspedicijski sk","gravitacija crvenog diva uništila je sko","novi navigacijski modul još uvijek ima n","異星の宇宙船があなたの旗艦に衝突しました。その際相手の宇宙船が爆発し、あなたの旗","あなたの航海士は艦隊の航路を決めるにあたって深刻な計算ミスを犯しました。その結果","あなたの艦隊は宇宙嵐に巻き込まれました。結果動力炉は壊れ、宇宙船の基幹システムは","原因不明の事態により艦隊は予定とは違う場所にたどり着きました。危うく太陽に不時着","恒星からの太陽風で航路は大きくずれました。\nその空間には全くなにもありませんでし","新しいナビゲーションシステムにはまだバグが残っていました。それは艦隊を間違った座","el líder en la navegación tuvo un mal dí","el viento una estrella gigante roja ha a","liderul navigatiei a avut o zi proasta s","флагманский корабль вашего экспедиционно","när expeditionen avslutade hyperrymdshop","navigationsledaren hade en dålig dag och","din expedition hamnade i en sektor fylld","på grund av okända orsaker så blev exped","stjärnvinden hos en röd jätte förstörde ","den nya navigationsmodulen jobbar fortfa","ekspedicijska flota je naletela na nezna","poveljnik ekspedicije je imel slab dan i","tvoja ekspedicijska flota je zašla v nev","zaradi neznanih razlogov je naša ekspedi","solarni veter od zvezde velikanke je pov","novi navigacijski sistem ima še vedno na","veliteľská loď sa dostala do kolízie s c","expedícia sa dostala do oblasti postihnu","slnečný vietor červeného obra kompletne ","nový navigačný modul má stále vážne nedo","一艘外來艦船突然跳躍到遠征探險艦隊中心與我們遠征探險隊旗艦相撞了外來艦船繼而爆炸","您的電腦導航系統發生一個嚴重錯誤導致遠征探險隊空間跳躍失敗不但造成艦隊完全失去目","您的遠征探險艦隊誤闖入了一個粒子風暴區域這使得能源供給出現超負荷現象並且大部分的","由於不明原因遠征探險艦隊的空間跳躍總是頻頻出錯這次更離譜竟然跳到一顆恒星的心臟地","一顆紅巨星的太陽風破壞了遠征探索艦隊的空間跳躍並令到艦隊不得不花費更多的時間來重","新導航系統組件仍然有問題遠征探索艦隊的空間跳躍錯誤不僅使得他們去錯目的地更使得艦"],alien:["exoticky vypadající lodě neznámého původ","kilka egzotycznie wyglądających statków ","ekspeditionens moderskib havde et sammen","niste nave aparent exotice au atacat flo","onbekende exotisch ogende schepen vallen","egzotikus megjelenésű hajók támadták meg","alcune navi straniere hanno attaccato la","some exotic looking ships attacked the e","des vaisseaux inconnus ont attaqué la fl","¡algunas naves apariencia exótica atacar","einige fremdartig anmutende schiffe habe","algumas naves exóticas atacaram a frota ","μερικά σκάφη με εντυπωσιακή εμφάνιση επι","kücük bir grup bilinmeyen gemi tarafinda","на вашу экспедицию напал вражеский флот ","何隻かの見慣れない宇宙船が警告無しに攻撃してきました。","tvá expedice provedla ne-úplně-přátelské","twoja ekspedycja napotkała niezbyt przyj","din ekspeditionsflåde havde ikke en venl","je expeditievloot heeft een onvriendelij","a felderítő expedíciód elsőre nem túl ba","la tua flotta in esplorazione non ha avu","your expedition fleet had an unfriendly ","la flotte d`expédition a eu une rencontr","tu expedición no hizo un primer contacto","deine expeditionsflotte hatte einen nich","a tua frota exploração teve um primeiro ","ο εξερευνητικός στόλος σας ήρθε σε όχι κ","kesif ekibimiz bilinmeyen bir tür ile hi","огромная армада хрустальных кораблей неи","naše expedice byla přepadena malou skupi","vores ekspedition blev angrebet af en mi","expeditia noastra a fost atacata un grup","onze expeditie is aangevallen door een k","неизвестная раса атакует наш экспедицион","nasza ekspedycja została zaatakowana prz","unsere expedition wurde von einer kleine","az expedíciónkat egy kisebb csapat ismer","la nostra spedizione è stata attaccata d","our expedition was attacked by a small g","notre expédition a été attaquée par un p","¡nuestra expedición fue atacada por un p","a nossa missão foi atacada por um pequen","η αποστολή δέχτηκε επίθεση από ένα μικρό","ваш экспедиционный флот по всей видимост","neznámí vetřelci zaútočili na naši exped","nieznani obcy atakują twoją ekspedycję!","expeditia noastra a fost atacata un grup","een onbekende levensvorm valt onze exped","egy ismeretlen faj megtámadta az expedíc","una specie sconosciuta sta attaccando la","an unknown species is attacking our expe","une espèce inconnue attaque notre expédi","¡una especie desconocida ataca nuestra e","eine unbekannte spezies greift unsere ex","uma espécie desconhecida atacou a nossa ","связь с нашим экспедиционным флотом прер","spojení s expediční letkou bylo přerušen","kontakt z naszą ekspedycją został przerw","de verbinding met onze expeditievloot we","a kapcsolat az expedíciós flottával nemr","il collegamento con la nostra spedizione","the connection to our expedition fleet w","nous avons perdu temporairement le conta","el contacto con nuestra expedición fue i","die verbindung zu unserer expeditionsflo","a ligação com nossa frota exploratória f","ваш экспедиционный флот испытал не особо","tvá expedice narazila na území ovládané ","úgy néz ki hogy a felfedező flottád elle","la tua flotta in spedizione sembra aver ","your expedition fleet seems to have flow","votre flotte d`expédition a manifestemen","tu expedición parece haber entrado en un","deine expeditionsflotte hat anscheinend ","tudo indica que a tua frota entrou em te","ο στόλος της αποστολής εισχώρησε σε μια ","какие-то корабли неизвестного происхожде","mieliśmy trudności z wymówieniem dialekt","je expeditie is het territorium van onbe","volt egy kis nehézségünk az idegen faj n","abbiamo avuto difficoltà a pronunciare c","we had a bit of difficulty pronouncing t","nous avons rencontré quelques difficulté","tuvimos dificultades para pronunciar cor","wir hatten mühe den korrekten dialekt ei","encontrámos algumas dificuldades em pron","на нашу экспедицию напала небольшая груп","een grote onbekende vloot van kristallij","una grande formazione di navi cristallin","a large armada of crystalline ships of u","une flotte vaisseaux cristallins va entr","una gran formación naves cristalinas ori","ein großer verband kristalliner schiffe ","uma grande frota naves cristalinas orige","язык этой расы труден в произношении сов","tvá expedice narazila na mimozemskou inv","twoja flota natrafiła na silną flotę obc","az expedíciód egy idegen invázióba flott","your expedition ran into an alien invasi","votre mission d`expédition a rencontré u","tu expedición encontró una flota alien i","deine expedition ist in eine alien-invas","a tua frota exploração foi atacada por u","tu flota expedición no tuvo un primer co","a sua frota expedição teve um primeiro c","retkikuntalaivueesi loi vihamielisen ens","¡unas naves exótico aspecto atacaron la ","et fremmedartet skib angriber din eksped","eksoottisen näköisiä aluksia hyökkäsi re","neki brodovi egzotičnog izgleda su napal","tvoja ekspedicijska flota nije napravila","あなたの艦隊は友好的ではない正体不明の種族と接触しました。\n\n通信主任の報告書：","flota ta expeditie a avut un prim contac","några skepp med exotiskt utseende attack","din expeditionsflotta har för första gån","ladje eksotičnega izgleda so napadle naš","tvoja ekspedicijska flota je imela nepri","exoticky vyzerajúce lode bez výstrahy za","naša expedícia má za sebou nie príliš pr","egzotik görünüslü tarafimizca bilinmeyen","一批奇形怪狀的外星艦船在事先毫無警告之下襲擊了我們的遠征探險艦隊!\n\n通訊官日誌","您的遠征探險艦隊與一未知種族的外星人發生了首場衝突接觸\n\n通訊官日誌記錄作為第一","your expedition fleet made some unfriend"],pirate:["interceptamos comunicaciones unos pirata","museli jsme bojovat s vesmírnými piráty ","musieliśmy walczyć z piratami na szczęśc","am fost nevoiti sa ne luptam cu niste pi","we moesten ons verdedigen tegen enkele p","szükségünk van harcra néhány kalózzal sz","abbiamo dovuto combattere alcuni pirati ","we needed to fight some pirates which we","nous avons dû nous défendre contre des p","tuvimos que luchar contra algunos pirata","wir mussten uns gegen einige piraten weh","tivemos combater com uns piratas que por","έπρεπε να αντιμετωπίσουμε μερικούς πειρα","bazi ilkel barbarlar bize uzaygemisi ola","пойманные сигналы исходили не от иноплан","zachytili jsme radiovou zprávu od nějaký","odebraliśmy sygnał radiowy od jakichś pi","zachytili a dekódovali sme správu ožraté","vi har sporet nogle berusede pirater der","am prins un mesaj radio la niste pirati ","we vingen een radiobericht op van enkele","elfogtunk egy rádió üzenetet ami ittas k","abbiamo intercettato messaggi di alcuni ","we caught some radio transmissions from ","nous avons capté des messages provenant ","capturamos algunos mensajes radio alguno","wir haben ein paar funksprüche sehr betr","apanhamos umas mensagens via rádio e est","υποκλέψαμε κάποια ραδιοσήματα από κάποιο","karsimiza cikan uzay korsanlari neyseki ","экспедиционный флот сообщает о жестоких ","nějací primitivní barbaři na nás útočí z","jacyś prymitywni barbarzyńcy atakują nas","nogle primitive barbarer angriber os med","niste pirati ne ataca cu nave inferior t","enkele primitieve barbaren vallen ons aa","néhány primitív barbár támadt ránk olyan","alcuni barbari primitivi ci stanno attac","some primitive barbarians are attacking ","des barbares primitifs nous attaquent av","algunos bárbaros primitivos están atacán","einige primitive barbaren greifen uns mi","uns bárbaros primitivos estão nos a atac","μία πρωτόγονη φυλή πειρατών μας επιτίθετ","kücük bir grup bilinmeyen gemi tarafinda","ваш экспедиционный флот пережил неприятн","nějací naprosto zoufalí vesmírní piráti ","jacyś bardzo zdesperowani piraci próbowa","niekoľko zúfalých vesmírnych pirátov sa ","cativa pirati ai spatiului foarte disper","een paar wanhopige piraten hebben geprob","néhány űr-kalóz megpróbálta elfoglalni a","alcuni pirati dello spazio decisamente d","some really desperate space pirates trie","quelques pirates apparemment complètemen","algunos piratas realmente desesperados i","ein paar anscheinend sehr verzweifelte w","alguns piratas desesperados tentaram cap","μερικοί πραγματικά απελπισμένοι πειρατές","bazı umutsuz uzay korsanları keşif filom","мы попались в лапы звёздным пиратам! бой","vletěli jsme přímo do pasti připravé hvě","sygnał alarmowy wykryty przez ekspedycję","we liepen in een hinderlaag van een stel","belefutottunk egy csillag-kalóz támadásb","siamo incappati in un`imboscata tesa da ","we ran straight into an ambush set by so","nous sommes tombés dans un piège tendu p","¡caimos en una emboscada organizada por ","wir sind in den hinterhalt einiger stern","nós fomos directos para uma emboscada ef","yildiz korsanlarinin kurdugu tuzagin tam","сигнал о помощи на который последовала э","nouzový signál který expedice následoval","wpadliśmy prosto w pułapkę zastawioną pr","semnalul urgenta pe care l-a urmat exped","het noodsignaal dat expeditie volgde ble","a segélykérő jelet amit követett az expe","la richiesta di aiuto a cui la spedizion","that emergency signal that the expeditio","le message secours était en fait un guet","la señal emergencia que la expedición si","der hilferuf dem die expedition folgte s","o sinal emergência que a expedição receb","το σήμα κινδύνου που ακολουθήσαμε ήταν δ","sarhos uzay korsanlarindan bazi telsiz m","пара отчаянных космических пиратов попыт","zware gevechten tegen piratenschepen wor","la spedizione riporta feroci scontri con","the expedition reports tough battles aga","votre flotte d`expédition nous signale l","¡tu expedición informa duras batallas co","die expeditionsflotte meldet schwere käm","o relatório expedição relata batalhas ép","нам пришлось обороняться от пиратов кото","expedice měla nepříjemné setkání s vesmí","din ekspeditionsflåde havde et ufint sam","expeditia ta a avut o intalnire neplacut","az expedíciódnak elégedetlen találkozása","la tua spedizione ha avuto uno spiacevol","your expedition had an unpleasant rendez","votre flotte d`expédition a fait une ren","tu expedición tuvo un desagradable encue","eine expeditionsflotte hatte ein unschön","a tua expedição deparou-se com uma não m","мы перехватили переговоры пьяных пиратов","zarejestrowane sygnały nie pochodziły od","het noodsignaal dat expeditie volgde ble","i segnali registrati non provenivano da ","the recorded signals didn`t come from a ","les signaux que nous ne pouvions identif","¡las señales no provenían un extranjero ","die aufgefangenen signale stammten nicht","os sinais gravados não foram emitidos po","нас атакуют какие-то варвары и хотя их п","votre expédition est tombée sur des pira","unos piratas realmente desesperados inte","tuvimos que luchar contra unos piratas q","unos bárbaros primitivos están atacándon","necesitamos luchar con algunos piratas q","apanhamos algumas mensagens rádio alguns","alguns piratas espaciais desesperados te","nós tivemos combater com alguns piratas ","alguns bárbaros primitivos estão nos ata","nogle øjensynligt fortvivlede pirater ha","under ekspeditionen blev vi nødt til at ","nappasimme joitakin radiolähetyksiä juop","todella epätoivoiset avaruuspiraatit yri","meidän täytyi taistella piraatteja onnek","jotkin alkukantaiset barbaarit hyökkäävä","neki opaki pirati su pokušali zarobiti v","primili smo radio poruku od nekog pijano","flota se morala boriti protiv nekoliko p","neki primitivni svemirski barbari nas na","いくつかの海賊は捨て身であなたの艦隊を乗っ取ろうとします。\n\n通信主任の報告書：","あなたの艦隊は泥酔した海賊から通信を受けました。それによるとあなたの艦隊はまもな","あなたの艦隊はいくつかの海賊と戦う必要がありますが、幸いにもそれはほんの少しだけ","あなたの艦隊を旧式の宇宙船で攻撃してきた野蛮人の中には海賊とは言えない者もいまし","algunos piratas espaciales que al parece","нас атакуют какие-то варвары их примитив","några riktigt desperata rymdpirater förs","vi hörde ett radiomeddelande från några ","vi behövde slåss emot några pirater som ","några primitiva vildar anfaller oss med ","obupani pirati so se trudili da bi zajel","zasegli smo sporočilo od piratov zgleda ","boriti smo se morali proti piratom kater","primitivni vesoljski barbari nas napadaj","musíme sa vysporiadať s pirátskou zberbo","akási primitívna skupina barbarov sa nás","一些亡命的宇宙海盜嘗試洗劫我們的遠征探險艦隊\n\n通訊官日誌記錄作為第一批到此未被","我們從一幫張狂的海盜處收到一些挑釁的無線電訊號看來我們即將遭受攻擊\n\n通訊官日誌","我們不得不與那裡的海盜進行戰鬥慶幸的是對方艦船數不多\n\n通訊官日誌記錄作為第一批","一群原始野蠻人正利用太空船向我們的遠征探險艦隊發起攻擊我們甚至連他們叫什麼名都全"],trader:["tvá expedice se setkala s přátelskou ras","flota ekspedycyjna nawiązała kontakt z p","din ekspeditionsflåde har opnået kontakt","onze expeditievloot heeft contact gemaak","az expedíciós flottád kapcsolatba lépett","la tua spedizione ha avuto contatto con ","your expedition fleet made contact with ","votre expédition a eu un bref contact av","tu flota en expedición tuvo un corto con","deine expeditionsflotte hatte kurzen kon","a tua frota contactou com uma raça alien","ο στόλος της αποστολής σας ήρθε σε επαφή","kesif filon biraz utangac bir alien irki","ваш экспедиционный флот вышел на контакт","tvá expedice zachytila nouzový signál ve","ekspedycja odebrała sygnał alarmowy ogro","din ekspeditionsflåde opsnappede et nøds","een noodoproep bereikte je expeditie een","az expedíciód vészjelzést fogott egy meg","la tua spedizione ha ricevuto un segnale","your expedition picked up an emergency s","votre flotte d`expédition a recueilli un","tu expedición captura un grito ayuda era","deine expeditionsflotte hatte ein notsig","a tua expedição recebeu um sinal emergên","η αποστολή σας έλαβε σήμα κινδύνου ένα μ","ваш экспедиционный флот поймал сигнал по","a sua frota expedição fez contato com um","retkikuntasi oli yhteydessä ystävällisee","a sua expedição recebeu um sinal emergên","tu expedición captó un grito ayuda era u","retkikuntasi poimi hätäsignaalin kesken ","vaša ekspedicija je primila signal za hi","vaša ekspedicijska flota je uspostavila ","あなたの艦隊は任務中に救難信号を受信しました。救難信号は巨大な輸送艦から出されて","あなたの艦隊は友好的な種族の異星人と接触しました。彼らはあなたにとって有益な資源","expeditia ta a primit un semnal urgenta ","flota ta expeditia a facut contactul cu ","din expedition fick en alarmsignal en en","din expeditionsflotta fick kontakt med e","ekspedicija je zaznala klice na pomoč og","ekspedicija je vzpostavila kontakt s sra","naša expedícia zachytila núdzový signál ","naša expedícia nadviazala kontakt s mier","您的遠征探險艦隊在任務中發出一則緊急的訊號一艘巨型貨運船被一顆小行星的萬有引力力","您的遠征探險艦隊與一友善的外星人種族進行了聯絡他們宣布他們將派遣一名代表與您的帝"],blackhole:["jediná věc která po expedici zbyla je ná","po naszej ekspedycji pozostała jedynie t","singurul lucru ramas la expeditie a fost","het enige dat is overgebleven van expedi","az egyetlen dolog ami a küldetésből megm","l`unica cosa che rimane dalla spedizione","the only thing left from the expedition ","voici le dernier signe vie l`expédition ","lo único que quedó la expedición fue el ","von der expedition ist nur noch folgende","o último contacto que tivemos da frota e","το μόνο που απέμεινε από την αποστολή εξ","lider geminin ana reaktöründeki bir kayn","от экспедиции осталось только следующее ","roztavení jádra v hlavní lodi expedice v","roztopienie rdzenia głównego statku powo","o supra alimentare a miezului navei mama","een ontploffing van hyperruimtemotor ver","a vezető hajó magjának felmelegedése egy","una rottura nel nucleo della nave ammira","a core meltdown of the lead ship leads t","un incident dans le noyau atomique d`un ","una fusión del núcleo la nave insignia p","ein kernbruch des führungsschiffes führt","uma falha no núcleo do motor da nave-mãe","ένα πρόβλημα στο σύστημα ψύξης του αντιδ","раздробление ядра ведущего корабля вызва","poslední informace od expedice byla velm","jedina stvar koja je ostala od cijele ek","ostatnią zdobyczą ekspedycji było napraw","ultimul lucru pe care il avem la expedit","het laatste bericht dat we ontvingen was","az utolsó dolog amit az expedícióról kap","l`ultima cosa che ci è stata inviata dal","the last transmission we received from t","l`expédition nous a envoyé des clichés e","la última transmisión que obtuvimos la f","das letzte was von dieser expedition noc","as últimas imagens que obtivemos da frot","последнее что удалось получить от экспед","naše expedice se nevrátila zpět vědci st","en kernenedsmeltning i moderskibet førte","de expeditievloot kon niet terugvliegen ","az expedíciós flotta nem ugrott vissza a","notre flotte d`expédition a disparu aprè","экспедиционный флот не вернулся из прыжк","ekspedycja nie wykonała skoku powrotnego","die expeditionsflotte ist nicht mehr aus","la spedizione non è ritornata dal salto ","contact with the expedition fleet was su","el contacto con la flota expedición ha s","a frota em missão não conseguiu voltar d","ο στόλος εξερεύνησης δεν επέστρεψε ποτέ ","la flota expedición no ha retornado al e","la última transmisión que recibimos la f","la última cosa que obtuvimos la expedici","la flota en expedición no saltó vuelta a","as últimas imagens que tivemos da frota ","a frota em expedição não conseguiu volta","den sidste radiotransmission vi modtog f","ekspeditionsflåden kom ikke tilbage vore","viimeinen lähetys retkikuntalaivueelta o","retkikuntalaivue ei ikinä palannut lähis","η τελευταία εικόνα που λήφθηκε από το στ","ekspedicijska flota se nije vratila na p","あなたの探索艦隊からの最後の通信はブラックホールが形成されていく壮大な画像でした","あなたの艦隊は帰還しませんでした。科学者たちは原因を究明していますが、艦隊は永遠","flota expeditie nu a sarit inapoi in car","det sista vi fick ifrån expeditionen var","expeditionsflottan kom aldrig tillbaka t","zadnje sporočilo ki smo ga dobili je sli","kontakt z ekspedicijsko floto je bil nen","poslednou vecou ktorú sme obdržali od ex","kontakt s expedičnou flotilou bol náhle ","kesif filosundan alabildigimiz son bilgi","kesif filosu  ulastigi bölgeden geri don","我們從遠征探險艦隊收到了最後傳來的影像那是一個大得嚇人的黑洞","與遠征探險艦隊的聯繫突然間中斷了我們的科學家們還在努力嘗試重新建立聯繫不過似乎艦"]}
    }
}


const css = 
`
/*css*/

:root
{
    --ogl:#FFB800;
    --primary:linear-gradient(to bottom, #171d23, #101419);
    --secondary:linear-gradient(192deg, #252e3a, #171c24 70%);
    --secondaryReversed:linear-gradient(176deg, #252e3a, #171c24 70%);
    --tertiary:linear-gradient(to bottom, #293746, #212a36 max(5%, 8px), #171c24 max(14%, 20px));

    --date:#9c9cd7;
    --time:#85c1d3;
    --texthighlight:#6dbbb3;

    --metal:hsl(229.85deg 48.01% 62.14%);
    --crystal:hsl(201.27deg 73.83% 75.93%);
    --deut:hsl(166.15deg 41.73% 62.16%);
    --metal:hsl(240deg 24% 68%);
    --crystal:hsl(199deg 72% 74%);
    --deut:hsl(172deg 45% 46%);
    --energy:#f5bbb4;
    --dm:#b58cdb;
    --food:hsl(316deg 21% 70%);
    --artefact:#cda126;
    --population:#ccc;
    --lifeform:#d569b8;
    --msu:#c7c7c7;

    --nothing:#ddd;
    --resource:#86edfd;
    --ship:#1dd1a1;
    --pirate:#ffd60b;
    --alien:#5ce724;
    --item:#bf6c4d;
    --blackhole:#818181;
    --early:#79a2ff;
    --late:#df5252;
    --trader:#ff7d30;
    
    --red:#f9392b;
    --pink:#ff7ba8;
    --purple:#ba68c8;
    --indigo:#7e57c2;
    --blue:#3f51b5;
    --cyan:#29b6f6;
    --teal:#06a98b;
    --green:#4caf50;
    --lime:#97b327;
    --yellow:#fbea20;
    --amber:#ffa000;
    --orange:#ff5723;
    --brown:#5d4037;
    --grey:#607d8b;

    --mission1:#ef5f5f;
    --mission2:#ef5f5f;
    --mission3:#66cd3d;
    --mission4:#00c5b2;
    --mission5:#d97235;
    --mission6:#e9c74b;
    --mission7:#5ae8ea;
    --mission8:#0cc14a;
    --mission15:#527dcb;
    --mission18:#7eacb5;
}

.material-icons
{
    direction:ltr;
    display:inline-block;
    font-family:'Material Icons' !important;
    font-weight:normal !important;
    font-style:normal !important;
    font-size:inherit !important;
    image-rendering:pixelated;
    line-height:inherit !important;
    letter-spacing:normal;
    user-select:none;
    text-transform:none;
    transform:rotate(0.03deg);
    white-space:nowrap;
    word-wrap:normal;
    -webkit-font-feature-settings:'liga';
    font-feature-settings:'liga';
    -webkit-font-smoothing:antialiased;
}

/*body
{
    background-attachment:fixed;
}*/

/*body
{
    background-size:cover !important;
}

@-moz-document url-prefix()
{
    body
    {
        background-size:unset !important;
    }
}*/

body.ogl_destinationPicker #planetList:before
{
    /*animation:border-dance 1s infinite linear;
    background-image:linear-gradient(90deg, var(--ogl) 50%, transparent 50%), linear-gradient(90deg, var(--ogl) 50%, transparent 50%), linear-gradient(0deg, var(--ogl) 50%, transparent 50%), linear-gradient(0deg, var(--ogl) 50%, transparent 50%);
    background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
    background-size: 15px 2px, 15px 2px, 2px 15px, 2px 15px;
    background-position: left top, right bottom, left bottom, right top;*/
    border:2px solid #fff;
    bottom:-2px;
    content:'';
    left:-2px;
    pointer-events:none;
    position:absolute;
    right:-2px;
    top:-2px;
    z-index:2;
}

/*@keyframes border-dance
{
    0% { background-position:left top, right bottom, left bottom, right top; }
    100% { background-position:left 15px top, right 15px bottom, left bottom 15px, right top 15px; }
}*/

line.ogl_line
{
    filter:drop-shadow(0 0 6px #000);
    marker-end:url(#arrow);
    marker-start:url(#circle);
    stroke:#ffffff;
    stroke-width:2px;
}

.ui-front
{
    z-index:9999 !important;
}

.ui-widget-overlay
{
    z-index:9998 !important;
}

.ogl_unit
{
    white-space:nowrap;
}

.ogl_suffix
{
    display:inline-block;
    font-size:smaller;
    margin-left:2px;
}

.ogl_text { color:var(--ogl) !important; }

.ogl_metal, #resources_metal, .resource.metal { color:var(--metal) !important; }
.ogl_crystal, #resources_crystal, .resource.crystal  { color:var(--crystal) !important; }
.ogl_deut, #resources_deuterium, .resource.deuterium  { color:var(--deut) !important; }
.ogl_food, #resources_food, .resource.food  { color:var(--food) !important; }
.ogl_dm, #resources_darkmatter, .resource.darkmatter  { color:var(--dm) !important; }
.ogl_energy, #resources_energy, .resource.energy  { color:var(--energy) !important; }
.ogl_population, #resources_population, .resource.population  { color:var(--population) !important; }
.ogl_artefact { color:var(--artefact) !important; }
[class*="ogl_lifeform"] { color:var(--lifeform) !important; }
.ogl_msu { color:var(--msu) !important; }

.ogl_mission1, [data-mission-type="1"]:not(.fleetDetails) .detailsFleet { color:var(--mission1) !important; }
.ogl_mission2, [data-mission-type="2"]:not(.fleetDetails) .detailsFleet { color:var(--mission2) !important; }
.ogl_mission3, [data-mission-type="3"]:not(.fleetDetails) .detailsFleet { color:var(--mission3) !important; }
.ogl_mission4, [data-mission-type="4"]:not(.fleetDetails) .detailsFleet { color:var(--mission4) !important; }
.ogl_mission5, [data-mission-type="5"]:not(.fleetDetails) .detailsFleet { color:var(--mission5) !important; }
.ogl_mission6, [data-mission-type="6"]:not(.fleetDetails) .detailsFleet { color:var(--mission6) !important; }
.ogl_mission7, [data-mission-type="7"]:not(.fleetDetails) .detailsFleet { color:var(--mission7) !important; }
.ogl_mission8, [data-mission-type="8"]:not(.fleetDetails) .detailsFleet { color:var(--mission8) !important; }
.ogl_mission9, [data-mission-type="9"]:not(.fleetDetails) .detailsFleet { color:var(--mission9) !important; }
.ogl_mission10, [data-mission-type="10"]:not(.fleetDetails) .detailsFleet { color:var(--mission10) !important; }
.ogl_mission11, [data-mission-type="11"]:not(.fleetDetails) .detailsFleet { color:var(--mission11) !important; }
.ogl_mission12, [data-mission-type="12"]:not(.fleetDetails) .detailsFleet { color:var(--mission12) !important; }
.ogl_mission13, [data-mission-type="13"]:not(.fleetDetails) .detailsFleet { color:var(--mission13) !important; }
.ogl_mission14, [data-mission-type="14"]:not(.fleetDetails) .detailsFleet { color:var(--mission14) !important; }
.ogl_mission15, [data-mission-type="15"]:not(.fleetDetails) .detailsFleet { color:var(--mission15) !important; }
.ogl_mission18, [data-mission-type="18"]:not(.fleetDetails) .detailsFleet { color:var(--mission18) !important; }

[data-mission-type] { background: #121b22 !important; }

[data-mission-type="1"] { background:linear-gradient(to right, #121b22, #482018, #121b22) !important; }
[data-mission-type="2"] { background:linear-gradient(to right, #121b22, #54271f, #121b22) !important; }
[data-mission-type="3"] { background:linear-gradient(to right, #121b22, #2c4a14, #121b22) !important; }
[data-mission-type="4"] { background:linear-gradient(to right, #121b22, #104841, #121b22) !important; }
[data-mission-type="5"] { background:linear-gradient(to right, #121b22, #643d25, #121b22) !important; }
[data-mission-type="6"] { background:linear-gradient(to right, #121b22, #4c401f, #121b22) !important; }
[data-mission-type="7"] { background:linear-gradient(to right, #121b22, #214350, #121b22) !important; }
[data-mission-type="8"] { background:linear-gradient(to right, #121b22, #004011, #121b22) !important; }
[data-mission-type="15"] { background:linear-gradient(to right, #121b22, #182542, #121b22) !important; }
[data-mission-type="18"] { background:linear-gradient(to right, #121b22, #203642, #121b22) !important; }

.ogl_icon, .ogl_metal.ogl_icon, .ogl_crystal.ogl_icon, .ogl_deut.ogl_icon, .ogl_food.ogl_icon,
.ogl_dm.ogl_icon, .ogl_energy.ogl_icon, .ogl_artefact.ogl_icon, .ogl_population.ogl_icon,
.ogl_icon[class*="ogl_2"], .ogl_icon[class*="ogl_mission"], .ogl_icon[class*="ogl_lifeform"],
.ogl_icon.ogl_msu
{
    align-items:center;
    border-radius:3px;
    display:flex;
    padding:3px;
    white-space:nowrap;
}

.ogl_metal.ogl_icon:before, .ogl_crystal.ogl_icon:before, .ogl_deut.ogl_icon:before, .ogl_food.ogl_icon:before,
.ogl_dm.ogl_icon:before, .ogl_energy.ogl_icon:before, .ogl_artefact.ogl_icon:before, .ogl_icon.ogl_population:before,
.ogl_icon.ogl_msu:before
{
    background-image:url(https://gf3.geo.gfsrv.net/cdned/7f14c18b15064d2604c5476f5d10b3.png);
    background-size:302px;
    border-radius:3px;
    content:'';
    display:inline-block;
    height:18px;
    image-rendering:pixelated;
    margin-right:10px;
    vertical-align:middle;
    width:28px;
}

.ogl_icon.ogl_metal:before { background-position:1% 11%; }
.ogl_icon.ogl_crystal:before { background-position:16% 11%; }
.ogl_icon.ogl_deut:before { background-position:30% 11%; }
.ogl_icon.ogl_dm:before { background-position:57% 11%; }
.ogl_icon.ogl_energy:before { background-position:43% 11%; }
.ogl_icon.ogl_food:before { background-position:85% 11%; }
.ogl_icon.ogl_population:before { background-position:98% 11%; }

.ogl_icon.ogl_artefact:before
{
    background-image:url(https://image.board.gameforge.com/uploads/ogame/fr/announcement_ogame_fr_59cb6f773531d4ad73e508c140cd2d3c.png);
    background-size:28px;
}

.ogl_icon[class*="ogl_2"]:before
{
    background-position:center;
    border-radius:3px;
    content:'';
    display:inline-block;
    height:18px;
    image-rendering:pixelated;
    margin-right:5px;
    vertical-align:text-bottom;
    width:28px;
}

.ogl_icon.ogl_200:before
{
    background:linear-gradient(45deg, #784242, #dd4242);
    content:'close';
    font-family:'Material Icons';
    line-height:18px;
    text-align:center;
}

.ogl_icon.ogl_202:before { background-image:url(https://gf2.geo.gfsrv.net/cdnd9/60555c3c87b9eb3b5ddf76780b5712.jpg); }
.ogl_icon.ogl_203:before { background-image:url(https://gf1.geo.gfsrv.net/cdn34/fdbcc505474e3e108d10a3ed4a19f4.jpg); }
.ogl_icon.ogl_204:before { background-image:url(https://gf2.geo.gfsrv.net/cdnd2/9ed5c1b6aea28fa51f84cdb8cb1e7e.jpg); }
.ogl_icon.ogl_205:before { background-image:url(https://gf1.geo.gfsrv.net/cdnf1/8266a2cbae5ad630c5fedbdf270f3e.jpg); }
.ogl_icon.ogl_206:before { background-image:url(https://gf2.geo.gfsrv.net/cdn45/b7ee4f9d556a0f39dae8d2133e05b7.jpg); }
.ogl_icon.ogl_207:before { background-image:url(https://gf1.geo.gfsrv.net/cdn32/3f4a081f4d15662bed33473db53d5b.jpg); }
.ogl_icon.ogl_208:before { background-image:url(https://gf1.geo.gfsrv.net/cdn6f/41a21e4253d2231f8937ddef1ba43e.jpg); }
.ogl_icon.ogl_209:before { background-image:url(https://gf1.geo.gfsrv.net/cdn07/6246eb3d7fa67414f6b818fa79dd9b.jpg); }
.ogl_icon.ogl_210:before { background-image:url(https://gf3.geo.gfsrv.net/cdnb5/347821e80cafc52aec04f27c3a2a4d.jpg); }
.ogl_icon.ogl_211:before { background-image:url(https://gf1.geo.gfsrv.net/cdnca/4d55a520aed09d0c43e7b962f33e27.jpg); }
.ogl_icon.ogl_213:before { background-image:url(https://gf3.geo.gfsrv.net/cdn2a/c2b9fedc9c93ef22f2739c49fbac52.jpg); }
.ogl_icon.ogl_214:before { background-image:url(https://gf3.geo.gfsrv.net/cdn84/155e9e24fc1d34ed4660de8d428f45.jpg); }
.ogl_icon.ogl_215:before { background-image:url(https://gf3.geo.gfsrv.net/cdn5a/24f511ec14a71e2d83fd750aa0dee2.jpg); }
.ogl_icon.ogl_218:before { background-image:url(https://gf1.geo.gfsrv.net/cdn39/12d016c8bb0d71e053b901560c17cc.jpg); }
.ogl_icon.ogl_219:before { background-image:url(https://gf3.geo.gfsrv.net/cdne2/b8d8d18f2baf674acedb7504c7cc83.jpg); }

.ogl_icon[class*="ogl_mission"]:before
{
    background-image:url(https://gf2.geo.gfsrv.net/cdn14/f45a18b5e55d2d38e7bdc3151b1fee.jpg);
    background-position:0 0;
    background-size:344px !important;
    border-radius:3px;
    content:'';
    display:inline-block;
    height:18px;
    margin-right:10px;
    vertical-align:middle;
    width:28px;
}

.ogl_icon.ogl_mission1:before { background-position:80.2% 0 !important; }
.ogl_icon.ogl_mission2:before { background-position:99.7% 0 !important; }
.ogl_icon.ogl_mission3:before { background-position:50% 0 !important; }
.ogl_icon.ogl_mission4:before { background-position:30% 0 !important; }
.ogl_icon.ogl_mission5:before { background-position:69.5% 0 !important; }
.ogl_icon.ogl_mission6:before { background-position:59.75% 0 !important; }
.ogl_icon.ogl_mission7:before { background-position:20.75% 0 !important; }
.ogl_icon.ogl_mission8:before { background-position:40.1% 0 !important; }
.ogl_icon.ogl_mission9:before { background-position:89% 0 !important; }
.ogl_icon.ogl_mission15:before { background-position:0.2% 0 !important; }
.ogl_icon.ogl_mission18:before { background:url(https://gf2.geo.gfsrv.net/cdna8/1fc8d15445e97c10c7b6881bccabb2.gif); background-size:18px !important; }

.ogl_lifeform0.ogl_icon:before
{
    content:'-';
}

.ogl_lifeform1.ogl_icon:before, .ogl_lifeform2.ogl_icon:before,
.ogl_lifeform3.ogl_icon:before, .ogl_lifeform4.ogl_icon:before
{
    background-image:url(https://gf2.geo.gfsrv.net/cdna5/5681003b4f1fcb30edc5d0e62382a2.png);
    background-size:245px;
    content:'';
    display:inline-block;
    height:24px;
    image-rendering:pixelated;
    vertical-align:middle;
    width:24px;
}

.ogl_icon.ogl_lifeform0:before { background-position:1% 11%; }
.ogl_icon.ogl_lifeform1:before { background-position:0% 86%; }
.ogl_icon.ogl_lifeform2:before { background-position:11% 86%; }
.ogl_icon.ogl_lifeform3:before { background-position:22% 86%; }
.ogl_icon.ogl_lifeform4:before { background-position:33% 86%; }

.ogl_icon.ogl_msu:before
{
    align-items:center;
    background:none;
    color:#fff;
    content:'MSU';
    display:flex;
    font-size:11px;
    justify-content:center;
}

.ogl_gridIcon .ogl_icon
{
    display:grid;
    grid-gap:7px;
    justify-content:center;
    padding-top:6px;
    text-align:center;
}

.ogl_gridIcon .ogl_icon:before
{
    margin:auto;
}

.ogl_header
{
    color:#6F9FC8;
    font-size:11px;
    font-weight:700;
    height:27px;
    line-height:27px;
    position:relative;
    text-align:center;
}

.ogl_header .material-icons
{
    font-size:17px !important;
    line-height:28px !important;
}

.ogl_button, a.ogl_button
{
    background:linear-gradient(to bottom, #405064, #2D3743 2px, #181E25);
    border:1px solid #17191c;
    border-radius:3px;
    color:#b7c1c9 !important;
    cursor:pointer;
    display:inline-block;
    line-height:26px !important;
    padding:0 4px;
    text-align:center;
    text-decoration:none;
    text-shadow:1px 1px #000;
    user-select:none;
}

.ogl_button:hover
{
    color:var(--ogl) !important;
}

.ogl_invisible
{
    visibility:hidden;
}

.ogl_hidden
{
    display:none !important;
}

.ogl_reversed
{
    transform:scaleX(-1);
}

.ogl_textCenter
{
    justify-content:center;
    text-align:center;
}

.ogl_textRight
{
    justify-content:end;
    text-align:right;
}

.ogl_disabled
{
    color:rgba(255,255,255,.2);
    opacity:.5;
    pointer-events:none;
    user-select:none;
}

.ogl_interactive
{
    cursor:pointer;
}

.ogl_slidingText
{
    display:inline-flex !important;
    grid-gap:20px;
    overflow:hidden;
    position:relative;
    width:100%;
    white-space:nowrap;
}

.ogl_slidingText:before, .ogl_slidingText:after
{
    animation:textSlideLeft 6s infinite linear;
    content:attr(data-text);
}

@keyframes textSlideLeft
{
    0% { transform:translateX(20px); }
    100% { transform:translateX(-100%); }
}

[data-status="pending"]
{
    pointer-events:none;
    color:orange !important;
}

[data-status="done"]
{
    color:green !important;
}

time
{
    color:var(--time);
}

time span
{
    color:var(--date);
}

.menubutton.ogl_active .textlabel
{
    color:#75ffcc !important;
}

#productionboxBottom time
{
    display:block;
    font-size:11px;
    margin-top:10px;
    text-align:center;
}

[data-output-time], [data-output-date]
{
    color:transparent !important;
    display:inline-grid !important;
    grid-template-columns:auto 6px auto;
    overflow:hidden;
    position:relative;
    user-select:none;
    white-space:nowrap;
}

[data-output-time]:not([data-output-date])
{
    grid-template-columns:0 auto;
}

[data-output-time] span, [data-output-date] span
{
    display:none;
}

[data-output-date]:before
{
    color:var(--date);
    content:attr(data-output-date);
}

[data-output-time]:after
{
    color:var(--time);
    content:attr(data-output-time);
}

[data-output-time="Invalid Date"]
{
    display:none !important;
}

.honorRank.rank_0, .honorRank.rank_undefined
{
    display:none;
}

[data-galaxy]
{
    color:#c3c3c3;
    cursor:pointer;
}

[data-galaxy]:hover
{
    color:#fff;
    text-decoration:underline;
}

[data-galaxy].ogl_active
{
    color:#c3c3c3;
    box-shadow:inset 0 0 0 2px rgba(255, 165, 0, .2);
}

.galaxyCell.cellPlayerName.ogl_active
{
    box-shadow:inset 0 0 0 2px rgba(255, 165, 0, .2);
}

[data-color]
{
    color:#4f6d87;
    line-height:21px;
    text-align:center;
}

[data-color]:before
{
    content:'my_location';
    font-family:'Material Icons';
    font-size:18px;
}

.ogl_target [data-color]
{
    line-height:8px;
    text-align:center;
}

.ogl_target [data-color]:before
{
    background:currentColor;
    border-radius:50%;
    content:'';
    display:block;
    height:8px;
    width:8px;
}

.ogl_tooltip [data-color]:before
{
    background:currentColor;
    border-radius:50%;
    content:'';
    display:block;
    height:22px;
    width:22px;
}

[data-color="red"] { color:var(--red) !important; }
[data-color="pink"] { color:var(--pink) !important; }
[data-color="purple"] { color:var(--purple) !important; }
[data-color="indigo"] { color:var(--indigo) !important; }
[data-color="blue"] { color:var(--blue) !important; }
[data-color="cyan"] { color:var(--cyan) !important; }
[data-color="teal"] { color:var(--teal) !important; }
[data-color="green"] { color:var(--green) !important; }
[data-color="lime"] { color:var(--lime) !important; }
[data-color="yellow"] { color:var(--yellow) !important; }
[data-color="amber"] { color:var(--amber) !important; }
[data-color="orange"] { color:var(--orange) !important; }
[data-color="brown"] { color:var(--brown) !important; }
[data-color="grey"] { color:var(--grey) !important; }
[data-color="none"] { color:rgba(255,255,255,.05); }
[data-color="none"]:before
{
    color:rgba(255,255,255,.5);
    content:'format_color_reset';
    font-family:'Material Icons';
    font-size:24px;
}

.tpd-tooltip
{
    display:none !important;
    opacity:0 !important;
}

.ogl_tooltip
{
    border-radius:4px;
    box-sizing:border-box;
    font-size:11px;
    left:0;
    opacity:0;
    padding:10px;
    pointer-events:none;
    position:absolute;
    top:0;
    z-index:1000002;
}

.ogl_tooltip:not(:has(.ogl_close))
{
    pointer-events:none !important;
}

.ogl_tooltip:before
{
    border-radius:inherit;
    bottom:10px;
    box-shadow:0 0 15px 5px rgb(0,0,0,.6), 0 0 4px 1px rgba(0,0,0,.7);
    content:'';
    left:10px;
    position:absolute;
    right:10px;
    top:10px;
}

.ogl_tooltip .ogl_tooltipTriangle
{
    background:#171c24;
    box-shadow:0 0 15px 5px rgb(0,0,0,.6), 0 0 4px 1px rgba(0,0,0,.7);
    height:15px;
    pointer-events:none;
    position:absolute;
    width:15px;
}

.ogl_tooltip[data-direction="top"] .ogl_tooltipTriangle
{
    transform:translate(50%, -50%) rotate(45deg);
}

.ogl_tooltip[data-direction="bottom"] .ogl_tooltipTriangle
{
    background:#293746;
    transform:translate(50%, 50%) rotate(45deg);
}

.ogl_tooltip[data-direction="left"] .ogl_tooltipTriangle
{
    transform:translate(-50%, 50%) rotate(45deg);
}

.ogl_tooltip[data-direction="right"] .ogl_tooltipTriangle
{
    transform:translate(50%, 50%) rotate(45deg);
}

.ogl_tooltip .ogl_close
{
    align-items:center;
    background:#7c3434;
    border-radius:4px;
    box-shadow:0 0 8px rgb(0,0,0,.6);
    color:#fff;
    cursor:pointer;
    display:flex !important;
    font-size:16px !important;
    justify-content:center;
    height:22px;
    position:absolute;
    right:0;
    top:0;
    width:22px;
    z-index:1000004;
}

.ogl_tooltip .ogl_close:hover
{
    background:#9f3d3d;
}

.ogl_tooltip.ogl_active
{
    animation-fill-mode:forwards !important;
}

.ogl_tooltip[data-direction="top"].ogl_active
{
    animation:appearTop .1s;
}

@keyframes appearTop
{
    from { opacity:0; margin-top:20px; }
    to { opacity:1; margin-top:0; }
    99% { pointer-events:none; }
    100% { pointer-events:all; }
}

.ogl_tooltip[data-direction="bottom"].ogl_active
{
    animation:appearBottom .1s;
}

@keyframes appearBottom
{
    from { opacity:0; margin-top:-20px; }
    to { opacity:1; margin-top:0; }
    99% { pointer-events:none; }
    100% { pointer-events:all; }
}

.ogl_tooltip[data-direction="left"].ogl_active
{
    animation:appearLeft .1s;
}

@keyframes appearLeft
{
    from { opacity:0; margin-left:20px; }
    to { opacity:1; margin-left:0; }
    99% { pointer-events:none; }
    100% { pointer-events:all; }
}

.ogl_tooltip[data-direction="right"].ogl_active
{
    animation:appearRight .1s;
}

@keyframes appearRight
{
    from { opacity:0; margin-left:-20px; }
    to { opacity:1; margin-left:0; }
    99% { pointer-events:none; }
    100% { pointer-events:all; }
}

.ogl_tooltip hr, .ogl_notification hr
{
    background:#1e252e;
    border:none;
    grid-column:1 / -1;
    height:2px;
    width:100%;
}

.ogl_tooltip > div:not(.ogl_tooltipTriangle):not(.ogl_close)
{
    background:var(--tertiary);
    border-radius:inherit;
    display:block !important;
    line-height:1.25;
    max-height:90vh;
    max-width:400px;
    overflow-x:hidden;
    overflow-y:auto;
    padding:16px 20px;
    position:relative;
    z-index:1000003;
}

.ogl_tooltip .ogl_colorpicker
{
    display:grid !important;
    grid-auto-flow:column;
    grid-gap:3px;
    grid-template-rows:repeat(5, 1fr);
}

[class*="tooltip"] input
{
    box-sizing:border-box;
    max-width:100%;
}

.ogl_colorpicker > div
{
    border-radius:50%;
    box-sizing:border-box;
    cursor:pointer;
    height:24px;
    width:24px;
}

.ogl_planetIcon, .ogl_moonIcon, .ogl_flagIcon, .ogl_searchIcon, .ogl_pinIcon, .ogl_fleetIcon
{
    display:inline-block !important;
    font-style:normal !important;
    text-align:center !important;
    vertical-align:text-top !important;
}

.ogl_planetIcon:before, .ogl_moonIcon:before, .ogl_flagIcon:before, .ogl_searchIcon:before, .ogl_pinIcon:before, .ogl_fleetIcon:before
{
    font-family:'Material Icons';
    font-size:20px !important;
}

.ogl_planetIcon:before
{
    content:'language';
}

.ogl_moonIcon:before
{
    content:'brightness_2';
}

.ogl_flagIcon:before
{
    content:'flag';
}

.ogl_pinIcon:before
{
    content:'push_pin';
}

.ogl_searchIcon:before
{
    content:'search';
}

.ogl_fleetIcon:before
{
    content:'send';
}

#bar
{
    line-height:17px !important;
}

#fleet1 .content
{
    padding-top:16px !important;
}

#fleet1 .ogl_shipFlag
{
    color:var(--yellow);
    display:grid;
    grid-gap:4px;
    grid-template-columns:repeat(2, 1fr);
    left:5px;
    position:absolute;
    text-shadow:1px 2px 5px #000;
    top:-5px;
}

#fleet1 .ogl_fav
{
    font-size:11px !important;
}

#fleet1 .ogl_shipLock
{
    font-size:11px !important;
}

#fleet1 progress
{
    appearance:none;
	border:0;
    bottom:-5px;
    display:block;
    height:5px;
    left:5px;
    position:absolute;
    width:655px;
    z-index:10;
}

#fleet1 progress, #fleet1 progress::-webkit-progress-bar
{
    background:var(--capacity);
}

#fleet1 .capacityProgress
{
    position:relative;
}

#fleet1 .capacityProgress::before
{
    background:#0c1014;
    border-radius:18px;
    content:attr(data-rawCargo);
    display:inline-block;
    font-size:11px;
    left:50%;
    padding:5px 10px;
    position:absolute;
    text-align:center;
    top:8px;
    transform:translateX(-50%);
}

#fleet1 .capacityProgress::after
{
    content:attr(data-percentResources)'%';
    display:block;
    font-size:10px;
    left:var(--currentCapacityPercent);
    position:absolute;
    text-shadow:2px 2px 1px #000;
    top:-14px;
    transform:translateX(5px);
    transition:left 0.5s;
}

#fleet1 progress::-webkit-progress-value
{
    background:rgba(255,255,255,.1);
    backdrop-filter:brightness(1.8);
    box-shadow:5px 0 10px #000;
    transition:width 0.5s;
}

#fleet1 progress::-moz-progress-bar
{
    background:rgba(255,255,255,.1);
    backdrop-filter:brightness(1.8);
    box-shadow:5px 0 10px #000;
    transition:width 0.5s;
}

.ogl_requiredShips
{
    align-items:center;
    display:grid;
    justify-content:center;
    user-select:none;
    width:80px;
}

#warning .ogl_requiredShips
{
    display:flex;
    grid-gap:28px;
    width: 100%;
}

.ogl_requiredShips .ogl_notEnough
{
    color:var(--red);
    filter:none;
}

.ogl_required
{
    background:linear-gradient(145deg, black, transparent);
    border-radius:3px;
    font-size:10px;
    overflow:hidden;
    padding:0 !important;
    white-space:nowrap;
}

.ogl_required:before
{
    vertical-align:middle !important;
}

.ogl_required:hover
{
    box-shadow:0 0 0 2px var(--ogl);
}

.ogl_maxShip
{
    background:#3c1a1a;
    border-radius:0;
    bottom:19px;
    box-sizing:border-box;
    color:var(--red);
    cursor:pointer;
    font-size:10px;
    height:14px;
    left:2px;
    line-height:14px;
    padding:0 5px;
    position:absolute;
    right:2px;
    text-align:right;
    user-select:none;
}

.ogl_maxShip:hover
{
    box-shadow:0 0 0 2px var(--ogl);
}

.resourceIcon .ogl_maxShip
{
    bottom:0;
}

.ogl_limiterLabel
{
    align-items:center;
    background:var(--secondary);
    border-radius:3px;
    cursor:pointer;
    display:inline-flex;
    grid-gap:5px;
    height:28px;
    padding:0 9px;
    user-select:none;
}

.ogl_limiterGroup
{
    align-items:center;
    background:var(--secondary);
    border-radius:3px;
    display:inline-flex;
    height:28px;
    margin-left:auto;
    padding:0 9px;
    user-select:none;
}

.ogl_limiterGroup .ogl_icon:first-child
{
    margin-left:5px;
}

.ogl_limiterGroup .ogl_icon:before
{
    margin-right:0;
}

.ogl_limiterGroup .ogl_icon:hover
{
    cursor:pointer;
}

.ogl_limiterGroup .ogl_icon:hover:before
{
    box-shadow:0 0 0 2px var(--ogl);
}

.ogl_limiterGroup .ogl_icon.ogl_active:before
{
    box-shadow:0 0 0 2px #fff;
}

#fleet2 #buttonz ul li span
{
    height:12px;
    min-width:122px;
}

#fleet2 div#mission .percentageBarWrapper
{
    margin-top:10px;
}

#speedPercentage
{
    float:none !important;
    margin:auto !important;
}

.percentageBar .steps .step:not(.selected)
{
    line-height:20px !important;
}

#speedPercentage .bar
{
    pointer-events:none;
}

.technology input[type="number"], .technology input[type="text"]
{
    background:#98b2bf !important;
    border:none !important;
    border-radius:2px !important;
    bottom:-20px !important;
    box-shadow:none !important;
    height:20px !important;
}

.ogl_notEnough
{
    filter:sepia(1) hue-rotate(300deg);
}

.technology.ogl_notEnough
{
    filter:none;
}

.technology.ogl_notEnough .icon
{
    filter:grayscale(1) brightness(0.5);
}

.technology.ogl_notEnough input
{
    background:#525556 !important;
    cursor:not-allowed !important;
}

.technology input.ogl_flashNotEnough
{
    background:#cf7e7e !important;
}

.technology:hover
{
    z-index:2;
}

.technology .icon
{
    border-radius:0 !important;
    box-shadow:0 0 0 1px #000 !important;
    position:relative;
}

.technology[data-status="active"] .icon
{
    box-shadow:0 0 5px 2px var(--ogl);
}

.technology .icon:hover, .technology.showsDetails .icon
{
    border:2px solid var(--ogl) !important;
}

.technology .icon .upgrade
{
    border-radius:0 !important;
    box-shadow:0 0 6px 0px rgba(0,0,0,.8) !important;
}

.technology .icon .upgrade:after
{
    border-color:transparent transparent currentColor transparent !important;
}

.technology .icon .level, .technology .icon .amount
{
    background:var(--primary) !important;
    border-radius:0 !important;
}

#technologydetails h3,
#technologydetails .level, #technologydetails .amount
{
    color:var(--ogl) !important;
}

#fleetdispatchcomponent .allornonewrap
{
    align-items:center;
    background:none !important;
    border:none !important;
    display:flex;
    justify-content:space-between;
}

#fleetdispatchcomponent #continueToFleet2
{
    margin-left:auto;
}

#fleetdispatchcomponent #allornone .info
{
    display:none;
}

#fleetdispatchcomponent #buttonz #battleships
{
    width:408px !important;
}

#fleetdispatchcomponent #buttonz #civilships
{
    width:254px !important;
}

#fleetdispatchcomponent #buttonz #battleships ul,
#fleetdispatchcomponent #buttonz #civilships ul
{
    padding:0 !important;
}

#fleetdispatchcomponent #buttonz #battleships ul
{
    margin-left:8px !important;
}

#fleetdispatchcomponent #buttonz #battleships .header
{
    border-radius:0 3px 3px 0;
    border-right:1px solid #000;
}

#fleetdispatchcomponent #buttonz #civilships .header
{
    border-radius:3px 0 0 3px;
    border-left:1px solid #000;
}

#fleetdispatchcomponent .resourceIcon
{
    cursor:default;
    position:relative;
}

#fleetdispatchcomponent .ogl_keepRecap
{
    background:#4c1b1b;
    box-sizing:border-box;
    bottom:0;
    color:#f45757;
    font-size:10px;
    padding-right:5px;
    position:absolute;
    text-align:right;
    width:100%;
}

#fleetdispatchcomponent fieldset,
#jumpgate fieldset
{
    background:#0c1014;
    border-radius:3px;
    box-sizing:border-box;
    display:flex;
    grid-gap:10px;
    margin:30px 5px 5px 5px;
    padding:12px;
    width:656px;
}

#fleetdispatchcomponent fieldset,
#jumpgate fieldset
{
    color:#fff;
}

#fleetdispatchcomponent fieldset legend,
#jumpgate fieldset legend
{
    color:#6f9fc8;
}

#fleetdispatchcomponent .resourceIcon
{
    box-shadow:inset -8px 7px 10px rgba(0,0,0,.5);
}

#allornone .secondcol
{
    align-items:center;
    background:none !important;
    border:none !important;
    display:inline-flex !important;
    grid-gap:6px;
    padding:5px !important;
    width:auto !important;
}

#allornone .secondcol .ogl_icon:hover, #allornone .secondcol .material-icons:hover
{
    color:#ccc !important;
    filter:brightness(1.2);
}

#allornone .secondcol .clearfloat
{
    display:none !important;
}

#allornone .secondcol .ogl_icon:not(.ogl_icon .ogl_icon):before
{
    box-shadow:inset 0 0 1px 1px #000;
    height:31px;
    width:31px;
}

#allornone .secondcol .ogl_icon:before
{
    margin:0;
}

#allornone .secondcol .ogl_icon .ogl_icon:before
{
    border-radius:10px 10px 10px 0;
    box-shadow:0 0 0 2px #345eb4, 0 0 2px 4px rgba(0,0,0,.7);
    width:18px;
}

#allornone .secondcol .ogl_icon
{
    cursor:pointer;
    padding:0;
    position:relative;
}

#allornone .secondcol .ogl_icon .ogl_icon
{
    position:absolute;
    right:-4px;
    top:-5px;
    transform:scale(.8);
}

#resetall, #sendall
{
    border-radius:3px;
    overflow:hidden;
    transform:scale(.97);
}

#galaxyLoading:after
{
    background:rgba(0,0,0,.7);
    border-radius:8px;
    content:attr(data-currentposition);
    font-size:13px;
    font-weight:bold;
    left:50%;
    padding:5px;
    position:absolute;
    top:50%;
    transform:translate(-50%, -50%);
}

/*#pageContent, #mainContent
{
    width:1045px !important;
    width:990px !important;
}*/

#commandercomponent
{
    transform:translateX(55px);
}

#bar ul li.OGameClock
{
    transform:translateX(57px);
}

#box, #standalonepage #mainContent
{
    width:100% !important;
}

#top
{
    background-repeat:no-repeat;
}

#middle
{
    padding-bottom:80px;
}

#right
{
    float:left !important;
    position:relative !important;
    z-index:2 !important;
}

#right .ogl_ogameDiv, #planetbarcomponent .ogl_ogameDiv
{
    margin-bottom:20px;
}

#myPlanets .ogl_header .material-icons, #myWorlds .ogl_header .material-icons
{
    color:#fff;
    cursor:pointer;
    position:absolute;
    right:5px;
    transform-origin:center;
    top:2px;
    z-index:1;
}

#countColonies
{
    display:none;
}

#bannerSkyscrapercomponent
{
    margin-left:290px !important;
}

#planetbarcomponent #rechts
{
    margin-bottom:20px !important;
    margin-left:5px !important;
    margin-top:-50px !important;
    width:176px !important;
}

#rechts .ogl_ogameDiv:first-child
{
    z-index:100001;
}

#myPlanets
{
    width:auto !important;
}

#planetList
{
    background:#15191e !important;
    padding:0 !important;
    position:relative;
    transform:translateX(-8px);
    user-select:none;
    width:206px;
    z-index:2;
}

#planetList.ogl_notReady .smallplanet:after
{
    background:rgba(0,0,0,.5);
    border-radius:7px;
    bottom:0px;
    content:'';
    left:0px;
    pointer-events:none;
    position:absolute;
    right:0px;
    top:0px;
    z-index:100;
}

#planetList.ogl_notReady .smallplanet
{
    pointer-events:none !important;
}

#myPlanets
{
    background:none !important;
    box-shadow:none !important;
}

.ogl_available
{
    display:grid;
    font-size:9px;
    font-weight:bold;
    line-height:11px;
    opacity:1;
    position:absolute;
    right:3px;
    text-align:right;
    top:4px;
    width:auto;
}

.smallplanet .planetlink:hover .ogl_available, .smallplanet .moonlink:hover .ogl_available
{
    opacity:1;
}

.smallplanet
{
    background:linear-gradient(341deg, transparent 29%, #283748);
    background:#0e1116;
    border-radius:0 !important;
    display:grid;
    font-size:10px;
    grid-gap:2px;
    grid-template-columns:139px 64px;
    height:41px !important;
    margin:0 !important;
    padding:1px;
    position:relative !important;
    width:100% !important;
}

.smallplanet:last-child
{
    border-radius:0 0 4px 4px !important;
    margin-bottom:0 !important;
}

@property --round
{
    syntax:'<integer>';
    inherits:false;
    initial-value:-50%;
}

[data-group]:before
{
    --round:-50%;
    border:2px solid #fff;
    border-right:none;
    content:'';
    height:calc(100% - 1px);
    position:absolute;
    top:0;
    transform:translate(-100%, round(down, -50%, 1px));
    transform:translate(-100%, var(--round));
    left:0;
    width:3px;
}

[data-group="1"]:before { border-color:#3F51B5; }
[data-group="2"]:before { border-color:#2196F3; }
[data-group="3"]:before { border-color:#009688; }
[data-group="4"]:before { border-color:#43A047; }
[data-group="5"]:before { border-color:#7CB342; }
[data-group="6"]:before { border-color:#FDD835; }
[data-group="7"]:before { border-color:#FB8C00; }
[data-group="8"]:before { border-color:#E53935; }
[data-group="9"]:before { border-color:#EC407A; }
[data-group="10"]:before { border-color:#5E35B1; }
[data-group="11"]:before { border-color:#795548; }
[data-group="12"]:before { border-color:#607D8B; }

.smallplanet .planetlink, .smallplanet .moonlink
{
    border-radius:4px !important;
    background-position:initial !important;
    height:43px !important;
    overflow:hidden !important;
    position:relative !important;
    padding:0 !important;
    position:relative !important;
    top:0 !important;
}

.smallplanet .planetlink:hover
{
    background:linear-gradient(207deg, #0d1014, #4869c7);
}

.smallplanet:last-child .planetlink:hover
{
    border-radius:0 0 0 4px !important;
}

.smallplanet .moonlink:hover
{
    background:linear-gradient(-207deg, #0d1014, #4869c7);
}

.smallplanet:last-child .moonlink:hover
{
    border-radius:0 0 4px 0 !important;
}

.ogl_destinationPicker .smallplanet .planetlink.ogl_currentDestination
{
    background:linear-gradient(207deg, #0d1014, #bb8c22) !important;
}

.ogl_destinationPicker .smallplanet .moonlink.ogl_currentDestination
{
    background:linear-gradient(-207deg, #0d1014, #bb8c22) !important;
}

.ogl_destinationPicker .smallplanet .ogl_currentDestination .planetPic,
.ogl_destinationPicker .smallplanet .ogl_currentDestination .icon-moon,
.ogl_destinationPicker .smallplanet .ogl_currentDestination .ogl_refreshTimer
{
    display:none;
}

.ogl_destinationPicker .smallplanet .ogl_currentDestination:after
{
    color:var(--ogl);
    content:'sports_score';
    font-family:'Material Icons';
    font-size:20px;
    left:6px;
    position:absolute;
    top:12px;
}

.ogl_destinationPicker .smallplanet .moonlink.ogl_currentDestination:after
{
    left:2px;
}

.smallplanet .ogl_disabled
{
    opacity:1;
    pointer-events:all;
}

.ogl_destinationPicker .smallplanet .ogl_disabled
{
    opacity:.5;
    pointer-events:none;
}

.smallplanet .planetlink
{
    background:linear-gradient(207deg, #0d1014, #212b34);
}

.smallplanet .moonlink
{
    background:linear-gradient(-207deg, #0d1014, #212b34);
}

.smallplanet.hightlightPlanet .planetlink
{
    background:linear-gradient(207deg, #0d1014, #4869c7);
}

.smallplanet.hightlightMoon .moonlink
{
    background:linear-gradient(-207deg, #0d1014, #4869c7);
}

.ogl_destinationPicker .smallplanet .planetlink.ogl_disabled
{
    background:linear-gradient(207deg, #0d1014, #c74848) !important;
}

.ogl_destinationPicker .smallplanet .moonlink.ogl_disabled
{
    background:linear-gradient(-207deg, #0d1014, #c74848) !important;
}

.smallplanet .planetlink.ogl_attacked,
.smallplanet .moonlink.ogl_attacked
{
    box-shadow:inset 0 0 0 2px #c93838 !important;
}

.smallplanet .moonlink
{
    left:auto !important;
}

.smallplanet .planet-name, .smallplanet .planet-koords
{
    font-weight:normal !important;
    left:32px !important;
    position:absolute !important;
    max-width:67px !important;
    overflow:hidden !important;
    text-overflow:ellipsis !important;
}

.smallplanet .planet-name
{
    color:hsl(208deg 32% 63%) !important;
    font-size:10px !important;
    font-weight:bold !important;
    top:9px !important;
}

.smallplanet .planet-koords
{
    bottom:10px !important;
    color:hsl(208deg 3% 57%) !important;
    letter-spacing:-0.05em;
    font-size:11px !important;
    top:auto !important;
}

.smallplanet .planetPic
{
    background:#1a2534;
    box-shadow:0 0 8px #000000 !important;
    height:22px !important;
    left:-1px !important;
    margin:0 !important;
    position:absolute !important;
    top:23px !important;
    transform:scale(1.4);
    width:22px !important;
}

.smallplanet .icon-moon
{
    background:#1a2534;
    box-shadow:0 0 8px #000000 !important;
    height:16px !important;
    left:0px !important;
    margin:0 !important;
    position:absolute !important;
    top:27px !important;
    transform: scale(1.5);
    width:16px !important;
}

.ogl_refreshTimer
{
    background:rgba(0,0,0,.8);
    border-radius:14px;
    bottom:2px;
    left:3px;
    padding:1px;
    position:absolute;
    text-align:center;
    transition:opacity .3s;
    width:15px;
}

.moonlink .ogl_refreshTimer
{
    left:1px;
}

.ogl_alt .ogl_refreshTimer
{
    opacity:0;
}

.smallplanet .constructionIcon
{
    display:none !important;
    left:3px !important;
    top:3px !important;
}

.smallplanet .constructionIcon.moon
{
    left:143px !important;
}

.smallplanet .alert
{
    display:none;
}

.smallplanet .ogl_sideIconBottom,
.smallplanet .ogl_sideIconTop,
.smallplanet .ogl_sideIconInfo
{
    align-items:center;
    display:flex;
    grid-gap:5px;
    position:absolute;
    right:-5px;
    text-shadow:0 0 5px #000;
    top:2px;
    transform:translateX(100%);
}

.smallplanet .ogl_sideIconBottom
{
    bottom:11px;
    top:auto;
}

.smallplanet .ogl_sideIconInfo
{
    bottom:2px;
    top:auto;
}

.smallplanet .ogl_sideIconBottom > *,
.smallplanet .ogl_sideIconTop > *,
.smallplanet .ogl_sideIconInfo > *,
.ogl_fleetIcon:before
{
    align-items:center;
    cursor:pointer;
    display:flex !important;
    font-size:14px !important;
}

.smallplanet .ogl_sideIconInfo > *
{
    color:var(--yellow);
    font-size:10px !important;
}

.smallplanet .ogl_sideIconBottom .ogl_fleetIcon:before
{
    transform:scaleX(-1);
}

.smallplanet .ogl_todoIcon
{
    color:#cfcfcf;
}

.smallplanet .ogl_todoIcon:hover,
.smallplanet .ogl_fleetIcon:hover
{
    color:var(--ogl) !important;
}

.smallplanet .ogl_todoIcon:after,
.smallplanet .ogl_fleetIcon:after
{
    content:attr(data-list);
    font-family:Verdana, Arial, SunSans-Regular, sans-serif;
    font-size:12px;
    font-weight:bold;
}

.msg
{
    background:var(--tertiary) !important;
    border-radius:12px;
    outline:1px solid #000;
    overflow:hidden;
    position:relative;
}

.msg[data-msgType] .msg_status:before { background:none !important; }
.msg[data-msgType="expe"] .msg_status { background:var(--mission15) !important; }
.msg[data-msgType="discovery"] .msg_status { background:var(--lifeform) !important; }

.msg_new
{
    background:linear-gradient(to bottom, #2e525e, #223644 6%, #172834 20%) !important;
}

.msg_title
{
    display:inline-flex !important;
    grid-gap:5px;
}

.msg_title .ogl_checked
{
    display:inline-flex;
    font-size:16px !important;
}

.msg_title .ogl_mainIcon
{
    color:var(--ogl) !important;
}

.msg_title .ogl_ptre
{
    color:#ff942c !important;
}

.ogl_battle
{
    align-items:center;
    background:rgba(0, 0, 0, .15);
    border:2px solid #323d4e;
    border-radius:5px;
    color:#48566c !important;
    display:flex;
    flex-wrap:wrap;
    font-weight:bold;
    justify-content:center;
    margin:8px auto;
    padding:3px 8px;
    text-align:center;
    text-transform:capitalize;
    width:fit-content;
    width:-moz-fit-content;
}

[data-resultType]:before
{
    content:'';
    display:block;
    font-family:'Material Icons';
    font-size:18px;
    font-weight:normal !important;
    margin-right:10px;
}

[data-resultType="raid"]:before, [data-resultType="battle"]:before { content:'\\ea15'; }
[data-resultType="resource"]:before, [data-resultType="darkmatter"]:before { content:'\\e972'; }
[data-resultType="artefact"]:before { content:'\\ea23'; }
[data-resultType="ship"]:before { content:'\\e961'; }
[data-resultType="other"]:before { content:'\\e9d0'; }
[data-resultType="nothing"]:before { content:'\\e92b'; }
[data-resultType*="lifeform"]:before { content:'\\e96e'; }
[data-resultType*="item"]:before { content:'\\e996'; }
[data-resultType*="debris"]:before { content:'\\e900'; }
[data-resultType*="early"]:before { content:'\\ea54'; }
[data-resultType*="late"]:before, [data-resultType="duration"]:before { content:'\\ea27'; }
[data-resultType*="blackhole"]:before { content:'\\e960'; }
[data-resultType*="trader"]:before { content:'\\ea03'; }
[data-resultType="alien"]:before { content:'\\ea6b'; }
[data-resultType="pirate"]:before { content:'\\ea61'; }

[data-resultType="alien"] { color:var(--alien) !important; }
[data-resultType="pirate"], [data-resultType="battle"]  { color:var(--pirate) !important; }
[data-resultType="blackhole"] { color:var(--blackhole) !important; }
[data-resultType="trader"] { color:var(--trader) !important; }
[data-resultType="item"] { color:var(--item) !important; }
[data-resultType="early"] { color:var(--early) !important; }
[data-resultType="late"], [data-resultType="duration"] { color:var(--late) !important; }
[data-resultType="resource"] { color:var(--resource) !important; }
[data-resultType="ship"] { color:var(--ship) !important; }
[data-resultType="dm"], [data-resultType="darkmatter"] { color:var(--dm) !important; }

.ogl_battle[data-resultType]:before
{
    color:#48566c !important;
}

.ogl_battle.ogl_clickable:hover
{
    border:2px solid var(--ogl);
    cursor:pointer;
}

.ogl_battle .ogl_icon
{
    align-items:center;
    background:none;
    display:flex;
    line-height:16px;
    padding:0;
}

.ogl_battle .ogl_icon:not(:last-child)
{
    margin-right:20px;
}

.ogl_battle[data-resultType="ship"] .ogl_icon
{
    color:#98b1cb;
    display:grid;
    grid-gap:3px;
}

.ogl_battle[data-resultType="ship"] .ogl_icon:not(:last-child)
{
    margin-right:7px;
}

.ogl_battle .ogl_icon:before
{
    background-size:400px;
    border-radius:0;
    display:block;
    height:20px;
    image-rendering:auto;
    margin:0 5px 0 0;
    vertical-align:bottom;
    width:32px;
}

.ogl_battle[data-resultType="raid"] .ogl_icon
{
    display:grid;
}

.ogl_battle[data-resultType="raid"] .ogl_icon:before
{
    grid-row:1 / 3;
}

.ogl_battle[data-resultType="raid"] .ogl_icon > span:last-child
{
    grid-column:2;
    grid-row:2;
}

.ogl_battle[data-resultType="ship"] .ogl_icon:before
{
    margin:auto;
}

.ogl_battle .ogl_icon[class*="ogl_2"]:before
{
    background-size:40px;
}

.ogl_battle .ogl_icon.ogl_artefact:before
{
    background-position:59% 28%;
    background-size:50px;
}

.ogl_battle .ogl_icon.ogl_lifeform1:before { background-position:1px 76%; }
.ogl_battle .ogl_icon.ogl_lifeform2:before { background-position:11% 76%; }
.ogl_battle .ogl_icon.ogl_lifeform3:before { background-position:22% 76%; }
.ogl_battle .ogl_icon.ogl_lifeform4:before { background-position:32% 76%; }

#messages .tab_favorites, #messages .tab_inner
{
    background:#030406 !important;
    background-size:410px;
}

.ogl_deleted
{
    color:var(--red);
    opacity:.5;
}

.ogl_spytable
{
    background:#12161a;
    border-radius:5px;
    color:#93b3c9;
    counter-reset:spy;
    font-size:11px;
    padding:5px;
    user-select:none;
}

.ogl_spytable:after
{
    content:attr(data-total);
    display:flex;
    justify-content:end;
    padding:5px 0;
    position:relative;
    right:224px;
}

#fleetsTab .ogl_spytable
{
    margin-bottom:-25px;
    margin-top:55px;
}

.ogl_spytable a.ogl_important span
{
    color:#fff !important;
}

.ogl_spytable hr
{
    background:#1e252e;
    border:none;
    grid-column:1 / -1;
    height:2px;
    width:100%;
}

.ogl_spytable a:not(.ogl_button):not([class*="status_abbr"]), .ogl_spytable [data-galaxy]:not(.ogl_button)
{
    color:inherit !important;
}

.ogl_spytable a:hover, .ogl_spytable [data-galaxy]:hover
{
    text-decoration:underline !important;
}

.ogl_spytable .ogl_spyLine > div:not(.ogl_more), .ogl_spyHeader
{
    align-items:center;
    border-radius:3px;
    display:grid;
    grid-gap:3px;
    grid-template-columns:22px 34px 30px 24px 96px auto 70px 40px 40px 130px;
    margin-bottom:2px;
}

.ogl_spytable .ogl_spyLine:not(:first-child)
{
    counter-increment:spy;
}

.ogl_spytable .ogl_spyLine > div > span,
.ogl_spytable .ogl_spyLine > div > a
{
    align-items:center;
    background:var(--secondary);
    border-radius:3px;
    display:flex;
    height:24px;
    overflow:hidden;
    padding:0 4px;
    position:relative;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.ogl_spytable .ogl_spyLine > div > a
{
    text-decoration:none;
}

.ogl_spytable .ogl_spyLine > div > span:nth-child(5), .ogl_spytable > div > span:nth-child(6), .ogl_spytable > div > span:nth-child(7) { justify-content:right; }

.ogl_spytable .ogl_spyLine > div > span:first-child:before
{
    content:counter(spy);
}

.ogl_spytable .msg_action_link
{
    overflow:hidden;
    padding:0 !important;
    text-overflow:ellipsis;
}

.ogl_spytable .ogl_fleetIcon
{
    bottom:-2px;
    left:1px;
    pointer-events:none;
    position:absolute;
    text-shadow:1px 1px 3px #000;
}

.ogl_spytable .ogl_spyLine > div > span a
{
    text-decoration:none;
}

.ogl_spytable .ogl_spyLine a:not(.ogl_button):hover,
.ogl_spytable .ogl_spyLine [data-galaxy]:hover
{
    color:#fff !important;
    cursor:pointer !important;
    text-decoration:underline !important;
}

.ogl_spytable .ogl_spyHeader b
{
    background:#12161a;
    border-radius:3px;
    color:#3c4f5a;
    font-size:11px !important;
    line-height:27px !important;
    padding-left:4px;
}

.ogl_spytable .ogl_spyHeader b.material-icons
{
    font-size:14px !important;
}

.ogl_spytable .ogl_spyHeader b:first-child,
.ogl_spytable .ogl_spyHeader b:nth-child(3)
{
    padding-left:0;
}

.ogl_spytable .ogl_spyHeader b:last-child,
.ogl_spytable .ogl_spyHeader span:last-child
{
    background:none;
    padding:0;
}

.ogl_spytable .ogl_spyHeader [data-filter].ogl_active
{
    color:var(--amber);
}

.ogl_spytable [data-title]:not(.ogl_spyIcon):not([class*="status_abbr"])
{
    color:inherit !important;
}

.ogl_spytable [data-filter]:after
{
    color:#3c4f5a;
    content:'\\ea28';
    font-family:'Material Icons';
    font-size:16px;
    float:right;
}

.ogl_spytable .ogl_spyHeader [data-filter]:hover
{
    color:#fff;
    cursor:pointer;
}

.ogl_spytable .ogl_actions
{
    background:none !important;
    border-radius:0 !important;
    font-size:16px;
    grid-gap:2px;
    justify-content:space-between;
    padding:0 !important;
}

.ogl_spytable .ogl_type > *
{
    color:#b7c1c9;
    font-size:16px !important;
}

.ogl_spytable .ogl_type > *:hover
{
    color:#fff;
}

.ogl_spytable .ogl_actions .ogl_button
{
    border:none;
    height:24px !important;
    line-height:24px !important;
    padding:0;
    text-decoration:none !important;
    width:100%;
}

.ogl_spytable .ogl_actions > *:not(.material-icons)
{
    font-weight:bold;
    font-size:12px;
}

.ogl_spytable .ogl_reportTotal,
.ogl_spytable .ogl_actions a:hover
{
    text-decoration:none;
}

.ogl_spyLine .ogl_more
{
    background:var(--primary);
    border-radius:3px;
    margin-bottom:3px;
    padding:7px;
}

.ogl_spyLine .ogl_more .ogl_icon
{
    align-items:center;
    display:flex;
}

.ogl_spyLine .ogl_more > div
{
    align-items:center;
    display:grid;
    grid-gap:5px;
    grid-template-columns:repeat(auto-fit, minmax(0, 1fr));
    margin-bottom:5px;
}

.ogl_spyLine .ogl_more > div > *
{
    background:var(--secondary);
    border-radius:3px;
    line-height:20px;
    padding:2px;
    text-decoration:none;
}

.ogl_spyLine .ogl_more a:hover
{
    color:#fff;
}

.ogl_trashCounterSpy
{
    display:block !important;
    font-size:16px !important;
    line-height:26px !important;
    min-width:0 !important;
    padding:0 !important;
    position:absolute;
    right:104px;
    top:48px;
    width:28px;
}

.galaxyTable
{
    background:#10151a !important;
}

#galaxycomponent .systembuttons img
{
    pointer-events:none;
}

#galaxyContent .ctContentRow .galaxyCell
{
    background:var(--secondary) !important;
    border-radius:2px !important;
}

#galaxyContent .cellPlanetName, #galaxyContent .cellPlayerName
{
    justify-content:left !important;
    padding:0 5px;
}

#galaxyContent .cellPlanetName span
{
    max-width:72px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
}

#galaxyContent .cellPlayerName
{
    flex-basis:78px !important;
}

#galaxyContent .cellPlayerName .tooltipRel:hover
{
    text-decoration:underline;
}

#galaxyContent .cellPlayerName [rel]
{
    line-height:18px;
    max-width:90px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
}

#galaxyContent .cellPlayerName pre
{
    display:none;
}

.ogl_ranking
{
    text-decoration:none !important;
}

#galaxyContent .ogl_ranking
{
    color:#7e95a9;
    cursor:pointer;
}

#galaxyContent .ogl_ranking:hover
{
    color:#fff;
}

#galaxyContent .ogl_ranking a
{
    color:inherit;
    text-decoration:none;
}

#galaxyHeader .btn_system_action
{
    max-width:100px;
    overflow:hidden
}

#galaxyContent .cellPlayerName [class*="status_abbr"]
{
    margin-right:auto;
}

#galaxyContent .ownPlayerRow
{
    cursor:pointer;
}

#galaxyContent .ctContentRow .cellDebris a
{
    line-height:30px;
    text-decoration:none;
    text-align:center;
    white-space:nowrap;
}

#galaxyContent .ctContentRow .cellDebris.ogl_important a
{
    color:#fff !important;
}

[class*="filtered_filter_"]
{
    opacity:1 !important;
}

#galaxyContent .ctContentRow[class*="filtered_filter_"] .galaxyCell:not(.ogl_important)
{
    background:#12181e !important;
}

#galaxyContent .expeditionDebrisSlotBox
{
    background:var(--primary) !important;
}

#galaxyContent .expeditionDebrisSlotBox .material-icons
{
    color:#48566c;
    font-size:20px !important;
}

#galaxyContent .ctContentRow .galaxyCell.cellDebris.ogl_important,
#galaxyContent .expeditionDebrisSlotBox.ogl_important,
.ogl_spytable .ogl_important
{
    background:linear-gradient(192deg, #a96510, #6c2c0d 70%) !important;
}

#galaxyContent .expeditionDebrisSlotBox.ogl_important .material-icons
{
    color:#bb6848;
}

[class*="filtered_filter_"] > .cellPlanet:not(.ogl_important) .microplanet,
[class*="filtered_filter_"] > .cellPlanetName:not(.ogl_important) span:not(.icon),
[class*="filtered_filter_"] > .cellMoon:not(.ogl_important) .micromoon,
[class*="filtered_filter_"] > .cellPlayerName:not(.ogl_important) span,
[class*="filtered_filter_"] > .cellPlayerName:not(.ogl_important) .ogl_ranking,
[class*="filtered_filter_"] > .cellAlliance:not(.ogl_important) span,
[class*="filtered_filter_"] > .cellAction:not(.ogl_important) a:not(.planetDiscover):not(.planetMoveIcons)
{
    opacity:.2 !important;
}

.ogl_popup
{
    align-items:center;
    background:rgba(0,0,0,.85);
    display:flex;
    flex-direction:column;
    height:100%;
    justify-content:center;
    left:0;
    opacity:0;
    pointer-events:none;
    position:fixed;
    top:0;
    width:100%;
    z-index:1000001;
}

.ogl_popup.ogl_active
{
    pointer-events:all;
    opacity:1;
}

.ogl_popup .ogl_close, .ogl_popup .ogl_share
{
    color:#556672;
    cursor:pointer;
    font-size:18px !important;
    line-height:30px!important;
    position:absolute;
    text-align:center;
    top:2px;
    right:0;
    width:30px;
}

.ogl_popup .ogl_close:hover, .ogl_popup .ogl_share:hover
{
    color:#fff;
}

.ogl_popup .ogl_share
{
    font-size:16px !important;
    top:30px;
}

.ogl_popup > *:not(.ogl_close):not(.ogl_share)
{
    animation:pop .15s;
    background:var(--primary);
    background:#0f1218;
    border-radius:3px;
    /* box-shadow:0 0 10px 1px #000; cause html2canvas to bug */
    max-height:80%;
    max-width:980px;
    overflow-y:auto;
    overflow-x:hidden;
    padding:30px;
    position:relative;
}

.ogl_popup h2
{
    border-bottom:2px solid #161b24;
    color:#9dbddd;
    font-size:14px;
    margin-bottom:16px;
    padding-bottom:7px;
    text-align:center;
}

@keyframes pop
{
    from { opacity:0; transform:translateY(-30px) };
    to { opacity:1; transform:translateY(0px) };
}

.ogl_keeper
{
    max-width:700px !important;
}

.ogl_keeper .ogl_limiterLabel
{
    margin-bottom:2px;
}

.ogl_keeper hr
{
    background:#1e252e;
    border:none;
    grid-column:1 / -1;
    height:2px;
    width:100%;
}

.ogl_resourceLimiter, .ogl_shipLimiter, .ogl_jumpgateLimiter
{
    background:#1b202a;
    border:2px solid #262d3c;
    border-radius:3px;
    display:grid;
    grid-gap:5px 18px;
    grid-template-columns:repeat(12, 1fr);
    padding:7px;
}

.ogl_shipLimiter, .ogl_jumpgateLimiter
{
    grid-template-columns:repeat(20, 1fr);
}

.ogl_keeper .ogl_icon
{
    grid-column:span 4;
    padding:0;
}

.ogl_keeper .ogl_metal, .ogl_keeper .ogl_crystal, .ogl_keeper .ogl_deut, .ogl_keeper .ogl_food
{
    grid-column:span 3;
}

.ogl_keeper .ogl_icon:before
{
    margin-right:5px !important;
    vertical-align:text-bottom;
}

.ogl_keeper input
{
    background:#121518;
    border:none;
    border-bottom:1px solid #242a32;
    border-radius:3px;
    border-top:1px solid #080b10;
    box-sizing:border-box;
    color:inherit;
    padding:4px 6px;
    width:calc(100% - 34px);
}

.ogl_keeper .ogl_button
{
    background:var(--secondary);
    border-radius:3px;
    color:#fff;
    cursor:pointer;
    line-height:24px !important;
}

.ogl_keeper .ogl_button.ogl_active
{
    background:var(--highlight);
}

.ogl_keeper .ogl_button:last-child
{
    grid-column:-2;
}

.ogl_keeper .ogl_profileTabs
{
    display:grid;
    grid-gap:0 5px;
    grid-template-columns:repeat(5, 1fr);
    grid-column:1 / -1;
}

.ogl_keeper input.ogl_title
{
    grid-column:1 / -1;
    padding:8px;
    text-align:center;
    width:100%;
}

.ogl_keeper h2
{
    grid-column:1 / -1;
}

.ogl_keeper h2:not(:nth-child(2))
{
    margin:20px 0 10px 0;
}

.ogl_keeper .ogl_missionPicker
{
    display:grid;
    grid-column:1 / -1;
    grid-gap:4px;
    grid-template-columns:repeat(11, auto);
    justify-content:end;
    margin-top:10px;
}

.ogl_keeper .ogl_missionPicker [data-mission]
{
    filter:grayscale(1);
}

.ogl_keeper .ogl_missionPicker [data-mission]:hover
{
    cursor:pointer;
    filter:grayscale(.5);
}

.ogl_keeper .ogl_missionPicker .ogl_active
{
    box-shadow:none !important;
    filter:grayscale(0) !important;
}

.ogl_empire
{
    color:#6a7d95;
    display:grid;
    font-size:11px;
    font-weight:bold;
    grid-gap:3px 8px;
    grid-template-columns:90px 24px 24px 100px 100px 60px 24px 130px 130px 130px;
}

.ogl_empire .ogl_icon
{
    background:none !important;
    justify-content:center;
    padding:0;
}

.ogl_empire .material-icons
{
    font-size:18px !important;
    line-height:30px !important;
}

.ogl_empire img
{
    box-sizing:border-box;
    height:24px;
    padding:3px;
}

.ogl_empire > *:not(.ogl_close):not(.ogl_share):not(a)
{
    background:var(--secondary);
    border-radius:3px;
    line-height:24px;
    position:relative;
    text-align:center;
}

.ogl_empire > [class*="ogl_lifeform"]:before
{
    border-radius:3px;
    image-rendering:pixelated;
}

.ogl_empire strong
{
    float:left;
    font-size:14px;
    padding-left:10px;
}

.ogl_empire strong span
{
    color:#ff982d !important;
    font-size:10px;
    margin-left:2px;
}

.ogl_empire small
{
    color:#ccc;
    float:right;
    font-size:10px;
    opacity:.6;
    padding-right:10px;
}

.ogl_empire .ogl_icon:before
{
    margin:0;
}

.ogl_empire img:hover
{
    filter:brightness(1.5);
}

.ogl_side
{
    background:var(--primary);
    box-shadow:0 0 50px #000;
    box-sizing:border-box;
    height:100%;
    overflow:auto;
    padding:40px 18px 18px 18px;
    position:fixed;
    right:0;
    top:0;
    transform:translateX(100%);
    transition:transform .3s;
    width:385px;
    z-index:1000000;
}

.ogl_side.ogl_active
{
    box-shadow:0 0 50px #000;
    transform:translateX(0%);
}

.ogl_side .ogl_close,
.ogl_side .ogl_back
{
    color:#556672;
    cursor:pointer;
    font-size:28px !important;
    position:absolute;
    top:10px;
    right:20px;
}

.ogl_side .ogl_close:hover,
.ogl_side .ogl_back:hover
{
    color:#fff;
}

.ogl_side .ogl_back
{
    left:20px;
    right:auto;
}

.ogl_side hr
{
    background:#151e28;
    border:none;
    grid-column:1 / -1;
    height:2px;
    width:100%;
}

.ogl_side h2
{
    align-items:center;
    color:#7e8dab;
    display:flex;
    font-size:14px;
    justify-content:center;
    margin-bottom:20px;
}

.ogl_side h2 .ogl_flagPicker
{
    height:17px;
    margin-left:5px;
}

.ogl_side h2 i
{
    margin-left:10px;
}

.ogl_topbar
{
    border-bottom:2px solid #0e1116;
    color:#546a89;
    display:grid;
    font-size:16px;
    grid-template-columns:repeat(8, 1fr);
    text-align:center;
    user-select:none;
    width:205px;
}

.ogl_topbar > *:nth-child(1):hover { color:#dbc453 !important; }
.ogl_topbar > *:nth-child(2):hover { color:#4bbbd5 !important; }
.ogl_topbar > *:nth-child(3):hover { color:#a978e9 !important; }
.ogl_topbar > *:nth-child(4):hover { color:#e17171 !important; }
.ogl_topbar > *:nth-child(5):hover { color:#76d19a !important; }
.ogl_topbar > *:nth-child(6):hover { color:#a1aac9 !important; }
.ogl_topbar > *:nth-child(7):hover { color:#fd7db8 !important; }
.ogl_topbar > *:nth-child(8):hover { color:#ffffff !important; }

.ogl_topbar > *:not(.ogl_button)
{
    cursor:pointer;
    color:inherit !important;
    display:block;
    line-height:30px !important;
    text-decoration:none;
}

.ogl_topbar > *:hover
{
    text-shadow:1px 1px 2px #000;
}

.ogl_topbar .ogl_disabled
{
    color:#898989 !important;
    opacity:.8 !important;
}

.ogl_topbar .ogl_active
{
    animation:spinAlt infinite 1s;
}

@keyframes spin
{
    0% { transform:rotate(0); }
    100% { transform:rotate(-360deg); }
}

.ogl_topbar button
{
    grid-column:1 / -1;
    line-height:26px !important;
    margin:0;
    max-height:0;
    opacity:0;
    pointer-events:none;
    transition:max-height .3s cubic-bezier(0, 1, 0, 1);
}

.ogl_initHarvest .ogl_topbar button
{
    display:block;
    margin:5px;
    max-height:30px;
    opacity:1;
    pointer-events:all;
    transition:max-height .1s ease-in-out;
}

.ogl_config
{
    display:grid;
    grid-gap:8px;
    line-height:26px;
}

.ogl_config label
{
    align-items:center;
    background:linear-gradient(-207deg, #0d1014, #212b34);
    border-radius:3px;
    color:#c7c7c7;
    display:flex;
    margin:2px 0px;
    padding:0;
}

.ogl_config label:before
{
    content:attr(data-label);
    display:block;
}

.ogl_config label.tooltipLeft:before
{
    text-decoration:underline dotted;
}

.ogl_config label > *:nth-child(1)
{
    margin-left:auto;
}

.ogl_config label > input[type="text"],
.ogl_config label > input[type="password"],
.ogl_config label > select
{
    background:#121518;
    border:none;
    border-bottom:1px solid #242a32;
    border-radius:3px;
    border-top:1px solid #080b10;
    box-shadow:none;
    box-sizing:border-box;
    color:#5d738d;
    font-size:12px;
    height:22px;
    visibility:visible !important;
    width:105px;
}

.ogl_config label > input[type="checkbox"],
.ogl_todoList input[type="checkbox"],
.ogl_limiterLabel input[type="checkbox"]
{
    align-items:center;
    appearance:none;
    background:#121518;
    border:none;
    border-bottom:1px solid #242a32;
    border-radius:2px;
    border-top:1px solid #080b10;
    color:var(--ogl);
    cursor:pointer;
    display:flex;
    height:16px;
    justify-content:center;
    width:16px;
}

.ogl_config label > input[type="checkbox"]:hover,
.ogl_todoList input[type="checkbox"]:hover,
.ogl_limiterLabel input[type="checkbox"]:hover
{
    box-shadow:0 0 0 2px var(--ogl);
}

.ogl_config label > input[type="checkbox"]:checked:before,
.ogl_todoList input[type="checkbox"]:checked:before,
.ogl_limiterLabel input[type="checkbox"]:checked:before
{
    content:'\\e936';
    font-family:'Material Icons';
    font-size:18px !important;
    pointer-events:none;
}

.ogl_config .ogl_icon[class*="ogl_2"],
.ogl_config .ogl_icon[class*="ogl_mission"]
{
    cursor:pointer;
    padding:0;
}

.ogl_config .ogl_icon[class*="ogl_2"]:not(:first-child),
.ogl_config .ogl_icon[class*="ogl_mission"]:not(:first-child)
{
    margin-left:5px;
}

.ogl_config .ogl_icon[class*="ogl_2"]:hover:before,
.ogl_config .ogl_icon[class*="ogl_mission"]:hover:before
{
    box-shadow:0 0 0 2px var(--ogl);
}

.ogl_config .ogl_icon[class*="ogl_2"].ogl_active:before,
.ogl_config .ogl_icon[class*="ogl_mission"].ogl_active:before
{
    box-shadow:0 0 0 2px #fff;
}

.ogl_config .ogl_icon[class*="ogl_2"]:before,
.ogl_config .ogl_icon[class*="ogl_mission"]:before
{
    margin:0;
    vertical-align:middle;
}

.ogl_config .ogl_icon[class*="ogl_mission"]:before
{
    background-size:318px !important;
    background-position-y:-6px !important;
}

.ogl_config [data-container]
{
    background:#0e1116;
    border-radius:3px;
    max-height:24px;
    overflow:hidden;
    padding:5px;
    transition:max-height .3s cubic-bezier(0, 1, 0, 1);
}

.ogl_config [data-container].ogl_active
{
    max-height:400px;
    transition:max-height .3s ease-in-out;
}

.ogl_config [data-container] > *
{
    padding:0 7px;
}

.ogl_config h3
{
    align-items:center;
    border-radius:3px;
    color:#90aed5;
    cursor:pointer;
    display:flex;
    font-size:12px;
    margin-bottom:5px;
    overflow:hidden;
    position:relative;
    text-align:left;
    text-transform:capitalize;
    user-select:none;
}

.ogl_config [data-container] h3:hover
{
    box-shadow:inset 0 0 0 2px var(--ogl);
    color:var(--ogl);
}

.ogl_config > div h3:before, .ogl_config svg
{
    color:inherit;
    fill:currentColor;
    font-family:'Material Icons';
    font-size:16px;
    height:26px;
    margin-right:5px;
}

.ogl_config [data-container="fleet"] h3:before { content:'\\e961'; }
.ogl_config [data-container="general"] h3:before { content:'\\e9e8'; }
.ogl_config [data-container="interface"] h3:before { content:'\\e95d'; }
.ogl_config [data-container="expeditions"] h3:before { content:'\\ea41'; }
.ogl_config [data-container="stats"] h3:before { content:'\\ea3e'; }
.ogl_config [data-container="messages"] h3:before { content:'\\e9be'; }
.ogl_config [data-container="PTRE"] h3:before { content:'\\ea1e'; }
.ogl_config [data-container="data"] h3:before { content:'\\ea3f'; }

.ogl_config h3:after
{
    content:'\\e9b5';
    font-family:'Material Icons';
    margin-left:auto;
}

.ogl_config label button
{
    background:linear-gradient(to bottom, #405064, #2D3743 2px, #181E25);
    border:1px solid #17191c;
    border-radius:3px;
    color:#b7c1c9;
    cursor:pointer;
    font-size:16px !important;
    height:22px !important;
    line-height:18px !important;
    position:relative;
    text-shadow:1px 1px #000;
    width:30px;
}

.ogl_config label button:hover
{
    color:var(--ogl);
}

.ogl_config label .ogl_choice
{
    background:linear-gradient(to bottom, #405064, #2D3743 2px, #181E25);
    border-bottom:1px solid #17191c;
    border-top:1px solid #17191c;
    color:#b7c1c9;
    cursor:pointer;
    font-size:11px !important;
    font-weight:bold;
    height:20px !important;
    line-height:20px !important;
    position:relative;
    text-align:center;
    width:30px;
}

.ogl_config label .ogl_choice:first-child
{
    border-radius:3px 0 0 3px;
}

.ogl_config label .ogl_choice:last-child
{
    border-radius:0 3px 3px 0;
}

.ogl_config label .ogl_choice.ogl_active
{
    border-radius:3px;
    box-shadow:0 0 0 2px #fff;
    z-index:2;
}

.ogl_config label .ogl_choice:hover
{
    color:var(--ogl);
}

.ogl_keyboardActions
{
    display:grid;
    grid-gap:5px 12px;
    grid-template-columns:repeat(3, 1fr);
}

.ogl_keyboardActions h2
{
    grid-column:1 / -1;
}

.ogl_keyboardActions label
{
    background:var(--secondary);
    align-items:center;
    border-radius:3px;
    display:grid;
    grid-gap:15px;
    grid-template-columns:auto 21px;
    line-height:1.2px;
    padding:10px;
}

.ogl_keyboardActions label:hover
{
    color:var(--amber);
    cursor:pointer;
}

.ogl_keyboardActions label hr
{
    appearance:none;
    border:none;
}

.ogl_keyboardActions input
{
    background:#fff !important;
    border:none !important;
    border-radius:3px !important;
    box-shadow:none !important;
    color:#000 !important;
    font-size:15px !important;
    font-weight:bold !important;
    height:21px !important;
    line-height:21px !important;
    padding:0 !important;
    text-align:center !important;
    text-transform:uppercase !important;
}

.ogl_keyboardActions input:focus
{
    outline:2px solid var(--amber);
}

.ogl_keyboardActions button
{
    cursor:pointer;
    grid-column:1 / -1;
    line-height:30px !important;
    margin-top:10px;
}

.ogl_planetList
{
    color:#566c7c;
    font-size:11px;
    margin-top:10px;
}

.ogl_planetList > div
{
    align-items:center;
    display:grid;
    grid-gap:3px;
    grid-template-columns:24px 70px 44px 44px auto;
    margin-bottom:3px;
}

.ogl_planetList > div > *:nth-child(2)
{
    text-align:left;
    text-indent:5px;
}

.ogl_planetList > div > *:last-child
{
    color:var(--date);
    font-size:10px;
}

.ogl_planetList [class*="Icon"]
{
    font-size:10px;
}

.ogl_planetList [class*="Icon"]:before
{
    font-size:16px;
    margin-right:5px;
    vertical-align:bottom;
}

.ogl_filterColor
{
    display:grid;
    grid-auto-flow:column;
    grid-gap:3px;
    grid-template-rows:repeat(1, 1fr);
    margin:10px 0;
}

.ogl_filterColor > *
{
    cursor:pointer;
    height:18px;
    border-radius:50%;
}

.ogl_filterColor > *.ogl_off,
label.ogl_off
{
    opacity:.2;
}

.ogl_filterColor > *:hover,
label.ogl_off:hover
{
    opacity:.7;
}

.ogl_filterStatus
{
    display:grid;
    grid-auto-flow:column;
    grid-gap:3px;
    grid-template-rows:repeat(1, 1fr);
    justify-content:end;
    margin:10px 0;
}

.ogl_filterStatus > *
{
    background:#182b3b;
    border-radius:4px;
    cursor:pointer;
    line-height:24px;
    text-align:center;
    width:24px;
}

.ogl_filterStatus > *.ogl_off
{
    opacity:.2;
}

.ogl_filterStatus > *:hover
{
    opacity:.7;
}

.ogl_filterGalaxy, .ogl_filterSystem
{
    color:#a0bacd;
    display:grid;
    font-size:11px;
    grid-gap:3px;
    grid-template-columns:repeat(10, 1fr);
    line-height:24px;
    text-align:center;
}

.ogl_filterGalaxy > *, .ogl_filterSystem > *
{
    background:#182b3b;
    border-radius:4px;
    cursor:pointer;
}

.ogl_filterGalaxy > *:hover, .ogl_filterSystem > *:hover
{
    color:#fff;
    text-decoration:underline;
}

.ogl_filterGalaxy > .ogl_active:not(.ogl_disabled), .ogl_filterSystem > .ogl_active:not(.ogl_disabled)
{
    color:#ccc;
    filter:brightness(1.4);
}

.ogl_filterGalaxy
{
    margin-top:30px;
}

.ogl_filterSystem
{
    margin-top:10px;
}

.ogl_watchList
{
    display:grid;
    font-size:11px;
    grid-gap:3px;
    padding-top:40px;
}

.ogl_watchList > div
{
    display:grid;
    grid-gap:3px;
    grid-template-columns:24px auto 100px 50px;
}

.ogl_watchList > div > *
{
    background:#182b3b;
    border-radius:3px;
    height:24px;
    line-height:24px;
    padding:0 5px;
}

.ogl_watchList > div > *:nth-child(2):hover
{
    cursor:pointer;
    text-decoration:underline;
}

.ogl_targetList
{
    display:grid;
    font-size:11px;
    grid-gap:3px;
    padding-top:30px;
}

.ogl_targetList .honorRank
{
    margin-right:1px;
    transform:scale(75%);
    vertical-align:sub;
}

.ogl_targetList .ogl_target
{
    color:#566c7c;
    display:grid;
    grid-gap:3px;
    grid-template-columns:76px auto 24px 24px 24px 24px 24px;
    line-height:24px;
    position:relative;
}

.ogl_targetList .ogl_target > *
{
    background:#182b3b;
    border-radius:3px;
    height:24px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.ogl_targetList .ogl_target [data-galaxy]
{
    text-indent:17px;
}

.ogl_targetList .ogl_target [class*="status_abbr_"]
{
    text-indent:3px;
}

.ogl_targetList .ogl_target > *:first-child
{
    align-self:center;
    border-radius:50%;
    display:block;
    height:7px;
    left:6px;
    position:absolute;
    width:7px;
    z-index:2;
}

.ogl_targetList .ogl_target > *
{
    grid-row:1;
}

.ogl_targetList .ogl_target > [class*="Icon"]:hover
{
    color:#fff;
    cursor:pointer;
}

.ogl_ogameDiv
{
    background:linear-gradient(0deg, #0d1014, #1b222a);
    box-shadow:0 0 20px -5px #000, 0 0 0 1px #17191c;
    border-radius:0;
    padding:2px;
    position:relative;
}

.ogl_miniStats
{
    cursor:pointer;
    margin-top:10px;
    width:160px;
}

.ogl_miniStats:hover:not(:has(.ogl_button:hover))
{
    box-shadow:0 0 0 2px var(--ogl);
}

.ogl_miniStats > div
{
    font-size:11px;
    padding:4px;
}

.ogl_miniStats .ogl_header
{
    height:18px;
    line-height:18px;
    padding:5px;
    user-select:none;
}

.ogl_miniStats .ogl_header span
{
    display:inline-block;
    line-height:15px;
    text-transform:capitalize;
}

.ogl_miniStats .ogl_header div
{
    color:#fff;
    cursor:pointer;
    z-index:1;
}

.ogl_miniStats .ogl_header div:first-child
{
    left:6px;
    position:absolute;
}

.ogl_miniStats .ogl_header div:last-child
{
    right:2px;
    position:absolute;
}

.ogl_miniStats .ogl_icon
{
    align-items:center;
    background:none;
    display:flex;
    font-weight:bold;
    padding:2px;
}

.ogl_miniStats .ogl_icon:before
{
    height:12px;
}

.ogl_miniStats .ogl_artefact:before
{
    background-size:23px;
}

.ogl_stats
{
    display:grid;
}

.ogl_stats h3
{
    color:#97a7c5;
    font-size:11px;
    font-weight:bold;
    grid-column:1 / -1;
    margin-top:20px;
    text-align:center;
}

.ogl_statsMonth
{
    align-items:center;
    display:flex;
    grid-gap:5px;
}

.ogl_statsMonth > *
{
    padding:0 10px;
}

.ogl_statsMonth .ogl_button:not(.material-icons)
{
    text-transform:uppercase;
}

.ogl_dateBar
{
    background:#181d26;
    border:4px solid #2b3340;
    border-radius:5px;
    display:flex;
    margin:20px 0;
    user-select:none;
}

.ogl_dateBar .ogl_item
{
    align-items:end;
    box-sizing:border-box;
    cursor:ew-resize;
    display:grid;
    grid-template-rows:50px 16px;
    flex:1;
    justify-content:center;
    padding:12px 2px 5px 2px;
    position:relative;
}

.ogl_dateBar .ogl_item:after
{
    content:attr(data-day);
    display:block;
    opacity:.3;
    pointer-events:none;
    text-align:center;
}

.ogl_dateBar .ogl_item.ogl_active:after
{
    opacity:1;
}

.ogl_dateBar .ogl_item > div
{
    border-radius:4px;
    cursor:pointer;
    font-size:10px;
    font-weight:bold;
    height:100%;
    pointer-events:none;
    width:20px;
}

.ogl_dateBar .ogl_selected
{
    background:#524728;
    border-bottom:2px solid var(--ogl);
    border-top:2px solid var(--ogl);
    padding-bottom:3px;
    padding-top:10px;
}

.ogl_dateBar .ogl_selected:not(.ogl_selected + .ogl_selected)
{
    border-left:2px solid var(--ogl);
    border-bottom-left-radius:5px;
    border-top-left-radius:5px;
    padding-left:0;
}

.ogl_dateBar .ogl_selected:has(+ :not(.ogl_selected)),
.ogl_dateBar .ogl_item.ogl_selected:last-child
{
    border-right:2px solid var(--ogl);
    border-bottom-right-radius:5px;
    border-top-right-radius:5px;
    padding-right:0;
}

.ogl_dateBar > .ogl_item:hover
{
    background:#524728;
}

.ogl_popup.ogl_active .ogl_dateBar .ogl_active
{
    color:#fff !important;
    pointer-events:all;
}

.ogl_statsDetails
{
    align-items:end;
    display:grid;
    grid-gap:20px;
    grid-template-columns:430px 430px;
}

.ogl_statsDetails h3
{
    color:var(--ogl);
}

.ogl_pie
{
    align-items:center;
    background:var(--secondary);
    border-radius:5px;
    display:flex;
    grid-gap:20px;
    height:182px;
    justify-content:center;
    padding:0 20px;
    position:relative;
}

.ogl_pie:before
{
    align-items:center;
    content:attr(data-pie);
    color:#fff;
    display:grid;
    font-size:12px;
    height:100%;
    justify-content:center;
    left:0;
    line-height:18px;
    pointer-events:none;
    position:absolute;
    text-align:center;
    text-shadow:1px 1px 5px #000;
    top:0;
    width:200px;
    white-space:pre;
    z-index:3;
}

.ogl_noExpe
{
    display:grid;
    grid-gap:10px;
}

.ogl_pie span.material-icons
{
    color:#313e4e;
    font-size:100px !important;
    margin:auto;
}

.ogl_pie canvas
{
    height:160px;
    width:160px;
}

.ogl_pie .ogl_pieLegendContainer
{
    align-items:center;
    border-radius:5px;
    display:grid;
    min-height:120px;
    width:210px;
}

.ogl_pie .ogl_pieLegend
{
    align-items:center;
    border-radius:3px;
    cursor:pointer;
    display:grid;
    grid-gap:5px;
    grid-template-columns:18px auto 54px 41px;
    white-space:nowrap;
}

.ogl_pie .ogl_pieLegend:hover,
.ogl_pie .ogl_pieLegend.ogl_active
{
    box-shadow:0 0 0 2px #fff;
}

.ogl_pie .ogl_pieLegend > *
{
    color:#fff;
    overflow:hidden;
    text-overflow:ellipsis;
}

.ogl_pie .ogl_pieLegend > span
{
    justify-self:right;
}

.ogl_pie .ogl_pieLegend i
{
    font-size:smaller;
    font-weight:normal;
    opacity:.6;
    text-align:right;
}

.ogl_pie .ogl_pieLegend .ogl_suffix
{
    display:inline;
}

.ogl_shipTable
{
    display:grid;
    grid-gap:5px;
    grid-template-columns:repeat(3, 1fr);
    height:100%;
}

.ogl_shipTable > .ogl_icon
{
    background:var(--secondary);
    box-sizing:border-box;
    padding-right:10px;
}

.ogl_shipTable > .ogl_icon:before
{
    height:26px;
    margin-right:auto;
    width:38px;
}

.ogl_sumTable
{
    display:grid;
    grid-column:1 / -1;
    grid-gap:3px;
    margin-top:20px;
}

.ogl_sumTable > *
{
    align-items:center;
    display:grid;
    grid-gap:3px;
    grid-template-columns:repeat(8, 1fr);
    line-height:26px;
    text-align:center;
}

.ogl_sumTable > *:first-child
{
    font-size:20px !important;
}

.ogl_sumTable > * > *:not(.ogl_icon)
{
    background:var(--secondary);
    border-radius:3px;
}

.ogl_sumTable > * > *:not(.ogl_icon):first-child
{
    text-transform:capitalize;
}

.ogl_sumTable .ogl_icon:before
{
    margin:auto;
}

.ogl_recap
{
    border-top:2px solid #0e1116;
    cursor:pointer;
    padding:10px 6px;
    position:relative;
    user-select:none;
}

.ogl_recap:hover
{
    box-shadow:0 0 0 2px var(--ogl);
}

.ogl_recap > div
{
    font-size:11px;
    font-weight:bold;
}

.ogl_recap .ogl_icon
{
    background:none;
    display:grid;
    grid-template-columns:35px auto 70px;
    text-align:right;
}

.ogl_recap .ogl_icon > *:last-child
{
    font-size:10px;
    letter-spacing:-0.03em;
    opacity:.5;
}

.ogl_recap .ogl_icon:before
{
    height:14px;
    vertical-align:bottom;
}

.ogl_shortCutWrapper
{
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    justify-content:center;
    pointer-events:none;
    position:fixed;
    text-transform:uppercase;
    z-index:10;

    top:0;
    height:calc(100vh - 25px);
    left:0;
    width:100vw;
}

.ogl_shortCutWrapper > div:nth-child(1)
{
    flex:1;
}

.ogl_shortcuts
{
    display:flex;
    grid-gap:7px;
    flex-wrap:wrap;
    justify-content:center;
}

/*.ogl_shortcuts:before
{
    background:rgba(0,0,0,.6);
    bottom:-5px;
    content:'';
    filter:blur(10px);
    left:-5px;
    position:absolute;
    right:-5px;
    top:-5px;
}*/

.ogl_shortcuts *
{
    z-index:1;
}

.ogl_shortcuts [data-key]
{
    align-items:center;
    box-shadow:0 0 5px rgba(0,0,0,.6);
    display:inline-flex;
    font-size:11px;
    grid-gap:5px;
    justify-content:center;
    line-height:26px;
    min-width:40px;
    pointer-events:all;
    position:relative;
}

.ogl_shortcuts [data-key-id]:after
{
    font-family:'Material Icons';
    font-size:16px !important;
    order:-1;
}

.ogl_shortcuts [data-key-id="menu"]:after { content:'\\e91d'; }
.ogl_shortcuts [data-key-id="showMenuResources"]:after { content:'\\e95d'; }
.ogl_shortcuts [data-key-id="previousPlanet"]:after { content:'\\ea39'; }
.ogl_shortcuts [data-key-id="nextPlanet"]:after { content:'\\ea2a'; }
.ogl_shortcuts [data-key-id="expeditionSC"]:after { color:var(--mission15);content:'\\ea41'; }
.ogl_shortcuts [data-key-id="expeditionLC"]:after { color:var(--mission15);content:'\\ea41'; }
.ogl_shortcuts [data-key-id="expeditionPF"]:after { color:var(--mission15);content:'\\ea41'; }
.ogl_shortcuts [data-key-id="fleetRepeat"]:after { content:'\\e91a'; }
.ogl_shortcuts [data-key-id="fleetSelectAll"]:after { color:#ffab43;content:'\\ea31'; }
.ogl_shortcuts [data-key-id="fleetReverseAll"]:after { content:'\\ea0c'; }
.ogl_shortcuts [data-key-id="backFirstFleet"]:after { content:'\\e94f'; }
.ogl_shortcuts [data-key-id="backLastFleet"]:after { content:'\\e94f'; }
.ogl_shortcuts [data-key-id="galaxyUp"]:after { color:#30ba44;content:'\\e946'; }
.ogl_shortcuts [data-key-id="galaxyDown"]:after { color:#30ba44;content:'\\e947'; }
.ogl_shortcuts [data-key-id="galaxyLeft"]:after { color:#30ba44;content:'\\e942'; }
.ogl_shortcuts [data-key-id="galaxyRight"]:after { color:#30ba44;content:'\\e940'; }
.ogl_shortcuts [data-key-id="discovery"]:after { color:var(--lifeform);content:'\\ea46'; }
.ogl_shortcuts [data-key-id="galaxySpySystem"]:after { color:var(--mission6);content:'\\e9ca'; }
.ogl_shortcuts [data-key-id="nextPinnedPosition"]:after { content:'\\e9d1'; }

.ogl_shortcuts .ogl_separator, fieldset .ogl_separator, .ogl_statsMonth .ogl_separator
{
    align-self:center;
    background:#2e3840;
    border-radius:50%;
    height:1px;
    padding:2px;
    width:1px;
}

.ogl_shorcuts .ogl_button
{
    box-shadow:0 1px 3px 0 #000, 0 1px 1px 0 #405064;
}

#technologydetails .build-it_wrap
{
    transform:scale(.75);
    transform-origin:bottom right;
}

#technologydetails .premium_info
{
    font-size:14px;
}

#technologydetails .information > ul
{
    bottom:8px !important;
    display:flex !important;
    flex-flow:row !important;
    grid-gap:3px !important;
    left:1px !important;
    position:absolute !important;
    top:auto !important;
    width:auto !important;
}

#technologydetails .information > ul li
{
    background:var(--secondary);
    border-radius:3px;
    margin-bottom:0 !important;
    padding:5px;
}

#technologydetails .build_duration,
#technologydetails .additional_energy_consumption,
#technologydetails .energy_production,
#technologydetails .possible_build_start,
#technologydetails .required_population,
#technologydetails .research_laboratory_levels_sum
{
    align-items:center;
    display:flex;
}

#technologydetails .build_duration strong,
#technologydetails .additional_energy_consumption strong,
#technologydetails .energy_production strong,
#technologydetails .possible_build_start strong,
#technologydetails .required_population strong,
#technologydetails .research_laboratory_levels_sum strong
{
    display:inline-flex;
    font-size:0;
}

#technologydetails .build_duration strong:before,
#technologydetails .additional_energy_consumption strong:before,
#technologydetails .energy_production strong:before,
#technologydetails .possible_build_start strong:before,
#technologydetails .required_population strong:before,
#technologydetails .research_laboratory_levels_sum strong:before
{
    display:block;
    font-family:'Material Icons';
    font-size:16px;
    margin-right:3px;
}

#technologydetails .build_duration strong:before { color:var(--time);content:'\\ea27'; }
#technologydetails .possible_build_start strong:before { color:#ccc;content:'\\ea03'; }
#technologydetails .additional_energy_consumption strong:before, #technologydetails .energy_production strong:before { color:var(--energy);content:'\\ea51'; }
#technologydetails .required_population strong:before { color:var(--lifeform);content:'\\ea46'; }
#technologydetails .research_laboratory_levels_sum strong:before { color:#21d19f;content:'\\ea17'; }

#technologydetails .required_population span { display:inline-flex;font-size:0; }
#technologydetails .required_population span:before { content:attr(data-formatted);font-size:11px; }

#technologydetails .energy_production .bonus
{
    color:#fff;
}

#technologydetails .build_amount
{
    top:35px;
}

#technologydetails .build_amount label
{
    display:none;
}

#technologydetails .build_amount .maximum
{
    background:none !important;
    margin:0 0 0 5px !important;
    min-width:0 !important;
    padding:0 !important;
}

#technologydetails .build_amount .maximum:before
{
    display:none !important;
}

#technologydetails_wrapper.ogl_active
{
    display:block !important;
}

#technologydetails_wrapper.ogl_active #technologydetails_content
{
    display:block !important;
    position:initial !important;
}

#technologydetails_content
{
    background:#0d1014 !important;
}

#technologydetails > .description
{
    background:var(--primary);
}

#technologydetails .costs
{
    left:5px !important;
    top:33px !important;
}

#technologydetails .costs .ipiHintable
{
    display:none !important;
}

#technologydetails .costs .ogl_costsWrapper
{
    display:grid;
    font-weight:bold;
    grid-gap:3px;
}

#technologydetails .costs .ogl_costsWrapper div:first-child .material-icons
{
    color:inherit !important;
}

#technologydetails .costs .ogl_costsWrapper .ogl_icon
{
    align-items:center;
    display:grid !important;
    grid-gap:8px;
    grid-template-columns:28px 70px 70px 70px;
    padding:0;
    text-align:center;
}

#technologydetails .costs .ogl_costsWrapper .ogl_icon:before
{
    margin:0;
}

#technologydetails .costs .ogl_costsWrapper .ogl_icon > div
{
    background:var(--secondary);
    border-radius:3px;
    color:inherit;
    line-height:18px !important;
}

#technologydetails .resource.icon
{
    border-radius:5px !important;
    flex:1 1 0;
    font-size:12px !important;
    height:auto !important;
    padding:2px !important;
    margin:0 !important;
    white-space:nowrap !important;
    width:auto !important;
}

#technologydetails .resource.icon .ogl_text,
#technologydetails .resource.icon .ogl_danger
{
    font-size:10px;
}

#technologydetails .ogl_actions
{
    display:grid;
    grid-gap:5px;
    grid-template-columns:repeat(4, 1fr);
    line-height:28px;
    padding:5px;
}

#technologydetails .ogl_actions .ogl_button
{
    font-size:18px !important;
}

#technologydetails .ogl_actions .ogl_button.ogl_active
{
    box-shadow:0 0 0 2px var(--amber);
    color:var(--amber) !important;
}

#technologydetails .information .material-icons
{
    color:#fff;
    font-size:16px !important;
    vertical-align:bottom;
}

#technologydetails .information .costs > p
{
    display:none;
}

#technologydetails .information b
{
    font-size:16px;
}

.ogl_tooltip > .ogl_fleetDetail:not(.ogl_tooltipTriangle):not(.ogl_close),
.ogl_ptreContent .ogl_fleetDetail
{
    display:grid !important;
    grid-gap:4px 10px;
    grid-template-columns:repeat(2, 1fr);
}

.ogl_ptreContent .ogl_fleetDetail
{
    grid-template-columns:repeat(3, 1fr);
    padding:15px 0;
}

.ogl_fleetDetail > div
{
    background:var(--secondary);
    border-radius:3px;
    line-height:20px;
    min-width:70px;
    padding:0px 5px 0px 0px !important;
    text-align:right;
    white-space:nowrap;
}

.ogl_fleetDetail .ogl_metal, .ogl_fleetDetail .ogl_crystal,
.ogl_fleetDetail .ogl_deut, .ogl_fleetDetail .ogl_food
{
    grid-column:1 / -1;
}

.ogl_fleetDetail .ogl_icon
{
    color:#7c95ab;
    font-weight:bold;
}

.ogl_fleetDetail .ogl_icon:before
{
    float:left;
    margin-right:auto;
}

.ogl_fleetDetail .ogl_button
{
    color:#fff;
    line-height:22px;
    text-align:center;
    user-select:none;
}

.ogl_fullgrid
{
    grid-column:1 / -1;
}

.ogl_tooltip > .ogl_fleetDetail .ogl_fullgrid
{
    display:grid;
    grid-gap:7px;
    grid-template-columns:repeat(2, 1fr);
}

.ogl_tooltip > .ogl_fleetDetail .ogl_button span
{
    pointer-events:none;
}

.ogl_tooltip > .ogl_fleetDetail .ogl_button
{
    border:1px solid #17191c;
    display:flex;
    font-size:12px !important;
    grid-gap:5px;
    grid-template-columns:16px auto;
    padding:2px 12px;
    text-align:left;
}

.ogl_tooltip > .ogl_fleetDetail .ogl_button .material-icons
{
    font-size:16px !important;
}

#fleetboxmission .content
{
    min-height:0 !important;
}

#fleet2 #missionNameWrapper, #fleet2 ul#missions span.textlabel
{
    display:none !important;
}

.ogl_todoList
{
    align-items:center;
    display:grid;
    grid-gap:30px;
    grid-template-columns:auto auto;
}

.ogl_todoList .ogl_tech
{
    background:#0b0f12;
    border-bottom:1px solid #1c2630;
    border-radius:3px;
    display:grid;
    margin-bottom:10px;
    padding:7px;
}

.ogl_todoList h2
{
    grid-column:1 / -1;
}

.ogl_todoList h3
{
    align-items:center;
    border-radius:3px;
    color:#5d6f81;
    cursor:pointer;
    display:flex;
    font-size:12px;
    line-height:18px;
    overflow:hidden;
    position:relative;
    text-align:left;
    text-transform:capitalize;
}

.ogl_todoList h3:after
{
    content:'\\e933';
    font-family:'Material Icons';
    margin-left:auto;
}

.ogl_todoList h3:hover
{
    color:#fff;
}

.ogl_todoList h3:not(:first-child)
{
    margin-top:20px;
}

.ogl_todoList h3 b
{
    color:var(--ogl);
}

.ogl_todoList hr
{
    background:#1e252e;
    border:none;
    grid-column:1 / -1;
    height:2px;
    width:100%;
}

.ogl_todoList .ogl_line
{
    display:grid;
    grid-gap:8px;
    grid-template-columns:70px 114px 114px 114px 50px auto auto;
    transition:max-height .3s cubic-bezier(0, 1, 0, 1);
}

.ogl_todoList div > .ogl_line:not(:first-child)
{
    max-height:0;
    overflow:hidden;
}

.ogl_todoList .ogl_tech.ogl_active .ogl_line
{
    max-height:28px;
    transition:max-height .1s ease-in-out;
}

.ogl_todoList footer
{
    border-top:2px solid #181f24;
    margin-top:3px;
}

.ogl_todoList .ogl_line > *
{
    align-items:center;
    background:var(--secondary);
    border-radius:3px;
    color:#849ab9;
    display:flex;
    margin-top:3px;
    padding-right:7px;
    text-align:right;
}

.ogl_todoList .ogl_line > *:first-child
{
    justify-content:center;
    line-height:24px;
    padding-right:0;
}

.ogl_todoList .ogl_line .material-icons,
.ogl_todoList .ogl_actions .material-icons
{
    font-size:20px !important;
}

.ogl_todoList .ogl_line .material-icons:hover
{
    color:var(--ogl) !important;
}

.ogl_todoList .ogl_line label
{
    text-align:left;
}

.ogl_todoList .ogl_line label:after
{
    content:attr(data-order);
}

.ogl_todoList .ogl_line .ogl_icon:before
{
    float:left;
}

.ogl_todoList .ogl_line .ogl_textCenter
{
    padding:0;
}

.ogl_todoList .ogl_actions
{
    align-self:baseline;
    display:grid;
    grid-gap:7px;
    position:sticky;
    top:0;
}

.ogl_todoList .ogl_button
{
    align-items:center;
    display:flex;
    grid-gap:5px;
    padding:0 10px;
}

.ogl_todoList .ogl_button .material-icons
{
    margin-left:auto;
}

.ogl_todoList .ogl_button input[type="checkbox"]
{
    margin-left:auto;
}

.ogl_removeTodo, .ogl_blockRecap > *:last-child
{
    color:#ff4f4f !important;
}

.ogl_todoList .ogl_line button:hover
{
    box-shadow:inset 0 0 0 2px var(--ogl);
    cursor:pointer;
}

.originFleet *
{
    color:inherit !important;
}

.ogl_playerData .ogl_actions
{
    display:flex;
    grid-gap:2px;
    margin-bottom:10px;
}

.ogl_playerData .ogl_actions .ogl_button
{
    border:1px solid #17191c;
    border-radius:5px;
    font-size:16px !important;
    width:100%;
}

.ogl_playerData .ogl_grid
{
    display:grid;
    grid-gap:12px;
    grid-template-columns:repeat(2, 1fr);
}

.ogl_playerData .ogl_leftSide
{
    background:#101418;
    border-radius:5px;
    font-size:12px;
    padding:7px;
}

.ogl_playerData h1
{
    background:var(--primary);
    border:2px solid #202834;
    border-radius:50px;
    font-size:14px;
    margin:0 auto 14px auto;
    padding:3px 12px;
    text-align:center;
    width:fit-content;
    width:-moz-fit-content;
}

.ogl_playerData h1:before
{
    background:red;
    content:'';
    height:2px;
}

.ogl_playerData h1 a
{
    font-size:12px;
    text-decoration:none;
}

.ogl_playerData h1 a:hover
{
    color:var(--ogl);
}

.ogl_score
{
    display:grid;
    grid-gap:3px;
}

.ogl_score .material-icons
{
    font-size:16px !important;
    line-height:20px !important;
}

.ogl_score .ogl_line
{
    background:var(--secondary);
    border-radius:5px;
    display:grid;
    grid-gap:3px;
    grid-template-columns:20px auto;
    padding:1px 5px;
}

.ogl_score .ogl_line div
{
    line-height:20px;
    text-align:right;
}

.ogl_score .ogl_line:nth-child(1) { color:#f9c846; }
.ogl_score .ogl_line:nth-child(2) { color:#6dd0ff; }
.ogl_score .ogl_line:nth-child(3) { color:#21d19f; }
.ogl_score .ogl_line:nth-child(4) { color:var(--lifeform); }
.ogl_score .ogl_line:nth-child(5) { color:#ff4646; }
.ogl_score .ogl_line:nth-child(6) { color:#f96e46; }
.ogl_score .ogl_line:nth-child(7) { color:#bfbfbf; }

.ogl_playerData .ogl_planetStalk
{
    background:#101418;
    border-radius:5px;
    display:flex;
    flex-direction:column;
    grid-gap:3px;
    padding:7px;
}

.ogl_playerData .ogl_planetStalk > div
{
    display:grid;
    font-size:12px;
    grid-gap:3px;
    grid-template-columns:24px auto 22px 22px;
    position:relative;
}

.ogl_playerData .ogl_planetStalk > div:last-child
{
    border:none;
}

.ogl_playerData .ogl_planetStalk > div > *
{
    align-items:center;
    background:var(--secondary);
    border-radius:3px;
    display:flex;
    justify-content:center;
    line-height:22px;
    padding:0 5px;
}

.ogl_playerData .ogl_planetStalk [data-galaxy]
{
    justify-content:left;
}

.ogl_home [data-galaxy]:before
{
    color:#fff;
    content:'\\e99d';
    display:inline-block;
    font-family:'Material Icons';
    margin-right:5px;
    text-decoration:none;
}

.ogl_playerData .ogl_planetStalk .ogl_spyIcon
{
    color:#687a89;
    font-size:15px !important;
}

.ogl_playerData .ogl_planetStalk .ogl_spyIcon:hover
{
    color:#fff;
}

#jumpgate .ship_input_row
{
    position:relative;
}

#jumpgate .ogl_keepRecap
{
    background:#4c1b1b;
    border-radius:4px;
    bottom:0;
    color:#f45757;
    font-size:10px;
    padding:2px 4px;
    position:absolute;
    right:0px;
}

#jumpgate .ship_input_row input
{
    text-align:left;
}

.eventFleet .tooltip
{
    color:inherit;
}

.galaxyTable .ogl_flagPicker
{
    margin-left:3px;
}

.ogl_flagPicker, .ogl_flagSelector
{
    cursor:pointer;
    font-size:19px !important;
    min-height:19px;
}

.ogl_flagSelector > *
{
    align-items:center;
    display:grid;
    justify-content:center;
}

.ogl_tooltip .ogl_flagSelector > *
{
    height:100%;
    min-height:19px;
}

.ogl_flagPicker:before, .ogl_flagSelector [data-flag="none"]:before { color:#4e5c68; content:'push_pin'; }
.ogl_flagPicker[data-flag="friend"]:before, .ogl_flagSelector [data-flag="friend"]:before { color:#ff78cf; content:'handshake'; }
.ogl_flagPicker[data-flag="danger"]:before, .ogl_flagSelector [data-flag="danger"]:before { color:#ff4343; content:'alert'; }
.ogl_flagPicker[data-flag="skull"]:before, .ogl_flagSelector [data-flag="skull"]:before { color:#e9e9e9; content:'skull'; }
.ogl_flagPicker[data-flag="rush"]:before, .ogl_flagSelector [data-flag="rush"]:before { color:#6cddff; content:'electric_bolt'; }
.ogl_flagPicker[data-flag="fridge"]:before, .ogl_flagSelector [data-flag="fridge"]:before { color:#667eff; content:'fridge'; }
.ogl_flagPicker[data-flag="star"]:before, .ogl_flagSelector [data-flag="star"]:before { color:#ffd745; content:'star'; }
.ogl_flagPicker[data-flag="trade"]:before, .ogl_flagSelector [data-flag="trade"]:before { color:#32db9d; content:'local_gas_station'; }
.ogl_flagPicker[data-flag="money"]:before, .ogl_flagSelector [data-flag="money"]:before { color:#ab7b65; content:'euro'; }
.ogl_flagPicker[data-flag="ptre"]:before, .ogl_flagSelector [data-flag="ptre"]:before { color:#ff942c; content:'ptre'; }
.ogl_flagPicker[data-flag="recent"]:before, .ogl_flagSelector [data-flag="recent"]:before { color:#41576c; content:'schedule'; }

.ogl_flagPicker:hover, .ogl_flagSelector [data-flag]:hover,
.ogl_tagPicker:hover, .ogl_tagSelector [data-tag]:hover
{
    filter:brightness(1.3);
}

.ogl_flagSelector [data-flag]:hover:after,
.ogl_tagSelector [data-tag]:hover:after
{
    border-left:5px solid transparent;
    border-right:5px solid transparent;
    border-top:6px solid #fff;
    top:-8px;
    content:'';
    left:50%;
    position:absolute;
    transform:translateX(-50%);
}

.ogl_tooltip > div.ogl_flagSelector:not(.ogl_tooltipTriangle):not(.ogl_close),
.ogl_tooltip > div.ogl_tagSelector:not(.ogl_tooltipTriangle):not(.ogl_close)
{
    align-items:center;
    display:flex !important;
    grid-auto-flow:column;
    grid-gap:4px 10px;
    justify-content:center;
}

.ogl_tagPicker, .ogl_tagSelector
{
    cursor:pointer;
    font-size:19px !important;
    user-select:none;
}

.ogl_tagPicker:before, .ogl_tagSelector [data-tag]:before { content:'stroke_full'; }
.ogl_tagPicker:before, .ogl_tagSelector [data-tag="none"]:before { color:#4e5c68; }
.ogl_tagPicker[data-tag="red"]:before, .ogl_tagSelector [data-tag="red"]:before { color:#eb3b5a; }
.ogl_tagPicker[data-tag="orange"]:before, .ogl_tagSelector [data-tag="orange"]:before { color:#fa8231; }
.ogl_tagPicker[data-tag="yellow"]:before, .ogl_tagSelector [data-tag="yellow"]:before { color:#f7b731; }
.ogl_tagPicker[data-tag="lime"]:before, .ogl_tagSelector [data-tag="lime"]:before { color:#7bbf20; }
.ogl_tagPicker[data-tag="green"]:before, .ogl_tagSelector [data-tag="green"]:before { color:#20bf6b; }
.ogl_tagPicker[data-tag="blue"]:before, .ogl_tagSelector [data-tag="blue"]:before { color:#5bbde3; }
.ogl_tagPicker[data-tag="dblue"]:before, .ogl_tagSelector [data-tag="dblue"]:before { color:#3867d6; }
.ogl_tagPicker[data-tag="violet"]:before, .ogl_tagSelector [data-tag="violet"]:before { color:#8854d0; }
.ogl_tagPicker[data-tag="magenta"]:before, .ogl_tagSelector [data-tag="magenta"]:before { color:#f95692; }
.ogl_tagPicker[data-tag="pink"]:before, .ogl_tagSelector [data-tag="pink"]:before { color:#fda7df; }
.ogl_tagPicker[data-tag="brown"]:before, .ogl_tagSelector [data-tag="brown"]:before { color:#996c5c; }
.ogl_tagPicker[data-tag="gray"]:before, .ogl_tagSelector [data-tag="gray"]:before { color:#75a1b7; }
[data-tag].ogl_off { opacity:.2; }

#galaxyContent .ctContentRow .galaxyCell:has([data-tag="red"]) { box-shadow:inset 0 0 100px rgba(255, 0, 0, .2); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="orange"]) { box-shadow:inset 0 0 100px rgba(235, 108, 59, .3); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="yellow"]) { box-shadow:inset 0 0 100px rgba(235, 181, 59, .3); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="lime"]) { box-shadow:inset 0 0 100px rgba(167, 235, 59, .2); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="green"]) { box-shadow:inset 0 0 100px rgba(59, 235, 89, .3); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="blue"]) { box-shadow:inset 0 0 100px rgba(59, 162, 235, .3); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="dblue"]) { box-shadow:inset 0 0 100px rgba(59, 81, 235, .3); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="violet"]) { box-shadow:inset 0 0 100px rgba(110, 59, 235, .3); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="magenta"]) { box-shadow:inset 0 0 100px rgba(235, 59, 165, .3); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="pink"]) { box-shadow:inset 0 0 100px rgba(255, 124, 179, .3); }
#galaxyContent .ctContentRow .galaxyCell:has([data-tag="brown"]) { box-shadow:inset 0 0 100px rgba(149, 111, 89, .3); }

.galaxyRow:has([data-tag="gray"]) { opacity:.2; }

.galaxyTable .ogl_tagPicker,
.ogl_spytable .ogl_tagPicker
{
    margin-left:auto;
}

.ogl_list
{
    background:#0e1116;
    display:grid;
    grid-gap:3px;
    padding:10px;
}

.ogl_list .ogl_emptyList
{
    padding:10px;
}

.ogl_list > div
{
    align-items:center;
    border-radius:3px;
    display:grid;
    grid-gap:4px;
    position:relative;
}

.ogl_list > div > *:not(.ogl_button)
{
    align-items:center;
    background:var(--secondary);
    border-radius:3px;
    display:flex;
    justify-content:center;
    line-height:24px !important;
    padding:0 5px;
}

.ogl_list > div > .ogl_flagPicker
{
    padding:0;
}

.ogl_pinned .ogl_list > div
{
    grid-template-columns:auto 70px 30px 30px;
}

.ogl_pinned .ogl_list > div > *:first-child
{
    justify-content:left;
}

.ogl_pinned .ogl_list .ogl_grid
{
    display:grid;
    grid-template-columns:repeat(2, 1fr);
}

.ogl_pinned .ogl_list .material-icons
{
    cursor:pointer;
    font-size:17px !important;
    height:24px !important;
    user-select:none;
    text-align:right;
}

.ogl_pinned .ogl_list .material-icons:hover
{
    filter:brightness(1.3);
}

.ogl_pinned .ogl_list .material-icons:last-child
{
    color:#915454;
}

.ogl_pinned .ogl_detail
{
    cursor:pointer;
}

.ogl_pinned .ogl_detail:hover
{
    color:#fff;
}

.ogl_pinned .ogl_tabs
{
    display:flex;
    grid-template-columns:repeat(9, 1fr);
    justify-content:space-between;
    text-align:center;
}

.ogl_pinned .ogl_tabs > [data-flag]
{
    align-items:center;
    display:grid;
    justify-content:center;
    padding:5px 7px 7px 7px;
}

.ogl_pinned .ogl_tabs .ogl_active
{
    background:#0e1116;
    border-radius:3px 3px 0 0;
}

.ogl_pinned span:hover
{
    cursor:pointer;
    text-decoration:underline;
}

.ogl_expeditionFiller
{
    display:grid;
    grid-template-columns:repeat(8, 1fr);
}

.ogl_expeditionFiller h2
{
    grid-column:1 / -1;
}

.ogl_expeditionFiller .ogl_icon:before
{
    height:38px;
    width:38px;
}

.ogl_expeditionFiller .ogl_icon:hover:before
{
    cursor:pointer;
    box-shadow:0 0 0 2px var(--ogl);
}

.ogl_expeditionFiller .ogl_icon.ogl_active:before
{
    box-shadow:0 0 0 2px #fff;
}

.ogl_wrapperloading
{
    align-items:center;
    background:rgba(0,0,0, .7);
    display:flex;
    height:100%;
    justify-content:center;
    width:100%;
}

.ogl_loading
{
    animation:spinAlt .75s infinite linear;
    background:conic-gradient(#ffffff00, var(--ogl));
    mask:radial-gradient(#0000 40%, #fff 43%, #fff 0);
    border-radius:50%;
    height:25px;
    width:25px;
}

@keyframes spinAlt
{
    0% { transform:rotate(0); }
    100% { transform:rotate(360deg); }
}

.ogl_pinDetail h2
{
    display:flex;
    grid-gap:5px;
}

.ogl_pinDetail h2 .ogl_flagPicker
{
    margin:0;
}

.ogl_pinDetail .ogl_actions
{
    display:flex;
    grid-gap:3px;
    margin-bottom:20px;
}

.ogl_pinDetail .ogl_actions .ogl_button
{
    align-items:center;
    display:grid;
    flex:1;
    font-size:16px !important;
    justify-content:center;
}

.ogl_pinDetail .ogl_score
{
    grid-template-columns:repeat(2, 1fr);
    margin-bottom:20px;
}

.ogl_pinDetail .ogl_score > div
{
    padding:4px 5px;
}

.ogl_pinDetail .ogl_list > div
{
    grid-template-columns:20px auto 60px 38px 38px 67px;
}

.ogl_pinDetail .ogl_list [data-galaxy]
{
    justify-content:left;
}

.ogl_pinDetail .ogl_list .ogl_spyIcon
{
    color:#687a89;
    font-size:16px !important;
    justify-content:space-between;
    padding:0 3px;
}

.ogl_pinDetail .ogl_list .ogl_spyIcon:hover
{
    color:#fff;
}

.ogl_spyIcon
{
    align-items:center;
    cursor:pointer !important;
    display:flex;
}

.ogl_spyIcon span
{
    font-family:Verdana, Arial, SunSans-Regular, sans-serif;
    font-size:11px;
    margin-left:3px;
}

.ogl_pinDetail date
{
    display:grid;
    font-size:10px;
    grid-gap:5px;
}

.ogl_pinDetail date span:nth-child(1) { color:var(--date); }
.ogl_pinDetail date span:nth-child(2) { color:var(--time); }

.ogl_nextQuickTarget
{
    color:#687a89;
    font-size:16px !important;
}

.ogl_nextQuickTarget.ogl_active
{
    color:var(--red);
}

.ogl_tagged .ogl_grid
{
    align-items:center;
    display:flex;
    grid-gap:5px;
    justify-content:end;
}

.ogl_tagged .ogl_grid label
{
    align-items:center;
    display:flex;
}

.ogl_tagged .ogl_list > div
{
    grid-template-columns:30px auto 30px 30px 30px 30px;
}

.ogl_tagged .ogl_list > div > div:first-child
{
    text-align:center;
}

.ogl_tagged .ogl_list .ogl_spyIcon
{
    color:#687a89;
    font-size:16px !important;
}

.ogl_tagged .ogl_list .ogl_spyIcon:hover
{
    color:#fff;
}

.ogl_tagged .ogl_tabs
{
    display:flex;
    grid-gap:12px 6px;
    margin-bottom:8px;
    text-align:center;
}

.ogl_tagged .ogl_tabs > *
{
    flex:1;
}

.ogl_tagged .ogl_actions
{
    align-items:center;
    display:grid;
    grid-gap:0 4px;
    grid-template-columns:repeat(15, 1fr);
}

.ogl_tagged .ogl_actions input
{
    background:#121518 !important;
    border:none !important;
    border-bottom:1px solid #212830 !important;
    border-radius:3px !important;
    border-top:1px solid #080b10 !important;
    box-shadow:none !important;
    color:#5d738d !important;
    font-weight:bold !important;
}

.ogl_tagged .ogl_actions label
{
    align-items:center;
    background:linear-gradient(to bottom, #405064, #2D3743 2px, #181E25);
    border-radius:50px;
    cursor:pointer;
    display:flex;
    justify-content:center;
}

.ogl_tagged .ogl_actions .material-icons
{
    color:#7d8caa;
    cursor:default;
    font-size:16px !important;
    text-align:center;
    user-select:none;
}

.ogl_tagged .ogl_actions input,
.ogl_tagged .ogl_actions .ogl_button,
.ogl_tagged .ogl_actions label
{
    align-self:flex-start;
    grid-column:span 2;
    line-height:24px !important;
    text-align:center;
    user-select:none;
    width:auto;
}

.ogl_tagged .ogl_actions .ogl_button,
.ogl_tagged .ogl_list .ogl_button
{
    cursor:pointer;
    display:inline-block;
    grid-template-columns:auto;
    line-height:26px;
    padding:0 4px;
    text-align:center;
    user-select:none;
}

.ogl_tagged .ogl_actions .ogl_button:hover,
.ogl_tagged .ogl_list .ogl_button:hover
{
    color:#fff;
}

.ogl_planetTooltip
{
    min-width:150px;
}

.ogl_planetTooltip [class*='ogl_lifeform']
{
    background:#000;
    border:2px solid var(--lifeform);
    border-radius:50%;
    box-shadow:0 0 5px 2px #000;
    position:absolute;
    right:50%;
    transform:translate(30px, -10px) scale(.75);
}

.ogl_planetTooltip [class*='ogl_lifeform']:before
{
    border-radius:50%;
}

.ogl_planetTooltip h3 span
{
    display:inline;
}

.ogl_planetTooltip img
{
    border:1px solid #000;
    border-radius:50%;
    box-shadow:0 0 10px -3px #000;
    display:block;
    margin:0 auto 7px auto;
}

.ogl_planetTooltip a
{
    display:block;
}

.ogl_planetTooltip a:hover
{
    color:#fff !important;
}

.ogl_planetTooltip h3
{
    text-align:center;
}

.ogl_planetTooltip .ogl_mineRecap
{
    font-size:14px;
    font-weight:bold;
    text-align:center;
}

#empire #siteFooter .content, #siteFooter .content
{
    width:1045px !important;
}

.ogl_danger
{
    color:#ff665b !important;
}

.ogl_warning
{
    color:var(--amber) !important;
}

.ogl_caution
{
    color:var(--yellow) !important;
}

.ogl_ok
{
    color:#77ddae !important;
}

.ogl_ping
{
    color:#aaa;
    font-size:10px;
    font-weight:bold;
    position:absolute;
    right:-14px;
    top:14px;
}

.secondcol .material-icons
{
    background:linear-gradient(to bottom, #2d6778 50%, #254650 50%);
    border-radius:2px !important;
    color:#fff;
    cursor:pointer;
    font-size:20px !important;
    height:26px !important;
    line-height:26px !important;
    text-align:center !important;
    text-decoration:none !important;
    text-shadow: 1px 1px #000 !important;
    transform:scale(1) !important;
    width:38px !important;
}

.secondcol #resetall.material-icons
{
    background:linear-gradient(to bottom, #812727 50%, #5c1515 50%);
}

.secondcol #sendall.material-icons
{
    background:linear-gradient(to bottom, #b76908 50%, #9b4a11 50%);
}

.ogl_tooltip > div.ogl_resourcesPreselection:not(.ogl_tooltipTriangle):not(.ogl_close)
{
    display:grid !important;
    grid-gap:5px;
}

.ogl_tooltip > div.ogl_resourcesPreselection .ogl_icon
{
    padding:0;
}

.ogl_resourcesPreselection .ogl_icon:before
{
    color:#ffc800;
    content:'chevron-double-right';
    font-family:'Material Icons';
    font-size:20px;
    line-height:18px;
    text-align:center;
    text-shadow:1px 1px 2px #000;
}

.ogl_resourcesPreselection hr
{
    border:none;
    height:2px;
    width:100%;
}

.ogl_resourcesPreselection .ogl_button
{
    line-height:30px;
}

[data-spy="prepare"] { color:var(--amber) !important; }
[data-spy="done"] { color:var(--teal) !important; }
[data-spy="fail"] { color:var(--red) !important; }
[data-spy="recent"] { color:var(--purple) !important; }
[data-spy]:not(.ogl_spyIcon) { box-shadow:0 0 0 2px currentColor !important; border-radius:2px !important; }

#highscoreContent div.content table#ranks tbody tr
{
    background:#181b24 !important;
}

#highscoreContent div.content table#ranks tbody tr.allyrank /* blue */
{
    background:linear-gradient(192deg, #2e3066, #1c2534 70%) !important;
}

#highscoreContent div.content table#ranks tbody tr.buddyrank /* violet */
{
    background:linear-gradient(192deg, #652e66, #251c34 70%) !important;
}

#highscoreContent div.content table#ranks tbody tr.myrank /* green */
{
    background:linear-gradient(192deg, #23575c, #1c2a34 70%) !important;
}

#highscoreContent div.content table#ranks tbody tr td
{
    background:none !important;
    height:22px;
}

#highscoreContent .honorRank
{
    position:absolute;
}

#highscoreContent .honorScore
{
    pointer-events:none;
}

#highscoreContent .playername
{
    color:#eee;
    display:inline-block;
    font-weight:bold;
    max-width:125px;
    overflow:hidden;
    position:relative;
    text-overflow:ellipsis;
    text-indent:21px;
    vertical-align:bottom;
    white-space:nowrap;
}

#highscoreContent .playername:hover
{
    text-decoration:underline;
}

#highscoreContent a
{
    position:relative;
}

#highscoreContent .ally-tag
{
    float:right;
    font-weight:bold;
}

#highscoreContent .ally-tag > a
{
    color:hsl(213deg 22% 56%) !important;
}

#highscoreContent .honorScore
{
    display:none !important;
    font-size:0 !important;
    left:20px;
    position:absolute;
    top:6px;
}

#highscoreContent .honorScore span,
#highscoreContent .stats_counter
{
    font-size:9px !important;
    font-weight:bold;
}

#highscoreContent #ranks tbody .score
{
    color:hsl(208deg 17% 47%) !important;
    font-size:11px;
    padding:2px 4px;
    position:relative;
}

#highscoreContent [data-category="1"][data-type="0"] #ranks tbody .score
{
    vertical-align:top;
}

#highscoreContent #ranks tbody .score .ogl_scoreDiff
{
    bottom:0;
    font-size:10px;
    position:absolute;
    right:4px;
}

#highscoreContent #ranks tbody .score .small
{
    color:hsl(210deg 11% 57%);
    font-size:10px;
    font-weight:bold;
}

#highscoreContent #ranks .sendmsg_content
{
    align-items:center;
    display:flex;
    grid-gap:7px;
    justify-content:center;
    margin:auto;
}

#highscoreContent #ranks .sendmsg_content a
{
    height:16px !important;
    margin:0 !important;
    width:16px !important;
}

#highscoreContent .ogl_flagPicker
{
    float:right;
}

.ogl_rankSince
{
    padding:5px;
    position:absolute;
}

.ogl_bigScore .score:before,
.ogl_lowScore .score:before
{
    color:var(--green);
    content:'trending_up';
    float:left;
    font-family:'Material Icons';
    font-size:20px !important;
    margin-top:7px
}

.ogl_lowScore .score:before
{
    color:var(--red);
    content:'trending_down';
}

.expeditionDebrisSlotBox
{
    align-items:center;
    border:none !important;
    box-shadow:none !important;
    box-sizing:border-box !important;
    display:flex !important;
    padding:4px 16px !important;
    width:642px !important;
}

.expeditionDebrisSlotBox.ogl_hidden,
.expeditionDebrisSlotBox > div:has(h3), #expeditionDebrisSlotDebrisContainer
{
    display:none !important;
}

.expeditionDebrisSlotBox li
{
    list-style:none;
}

.expeditionDebrisSlotBox > div
{
    display:flex;
    grid-gap:20px;
    line-height:1.4;
    text-align:left;
}

.expeditionDebrisSlotBox > div:last-child
{
    display:grid;
    grid-gap:0;
    margin-left:auto;
}

.expeditionDebrisSlotBox a
{
    color:var(--green1);
}

.expeditionDebrisSlotBox a:hover
{
    text-decoration:underline;
}

.ogl_expeditionRow > div:not(:last-child)
{
    display:flex;
}

.ogl_expeditionDebris
{
    grid-gap:10px;
}

#galaxyContent .expeditionDebrisSlotBox > div
{
    flex:none !important;
}

.ogl_sideFleetTooltip:not(.ogl_tooltipTriangle):not(.ogl_close)
{
    display:grid !important;
    font-size:11px;
    grid-gap:2px;
    max-width:800px !important;
}

.ogl_sideFleetIcon
{
    align-items:center;
    display:grid;
    grid-gap:5px;
    grid-template-columns:70px 30px 70px 60px 20px 30px 70px 98px 98px 98px;
    justify-content:center;
}

.ogl_sideFleetIcon > *:not(img)
{
    background:var(--secondary);
    border-radius:3px;
}

.ogl_sideFleetIcon > *:not(img):not(.ogl_icon)
{
    line-height:24px;
    padding:0 3px;
    text-align:center;
}

.ogl_sideFleetIcon .material-icons
{
    color:#fff;
    font-size:14px !important;
    line-height:24px !important;
}

.ogl_sideFleetIcon > span
{
    color:#fff;
}

[data-return-flight="true"]
{
    filter:brightness(.7);
}

#movementcomponent .starStreak .route
{
    color:#aaa;
    text-align:center;
}

#movementcomponent .starStreak .route b
{
    color:#fff;
    font-weight:normal;
}

.msg gradient-button .custom_btn
{
    border:none !important;
}

gradient-button img
{
    pointer-events:none !important;
}

.ogl_messageButton
{
    /*background:linear-gradient(to top, #151a20, #2e3948) !important;*/
    background:linear-gradient(160deg, rgba(54,77,99,1) 0%, rgba(40,57,72,1) 33%, rgba(20,30,38,1) 66%, rgba(18,26,33,1) 100%) !important;
    /*box-shadow:inset 0 2px 2px #374454, 0 0 0 1px #181f26;*/
    box-shadow:0px 2px 3px 1px rgb(0,0,0,.55);
    border-radius:5px;
    color:#9ea5af !important;
    cursor:pointer;
    float:left;
    font-size:20px !important;
    font-weight:bold;
    height:26px;
    line-height:26px !important;
    text-align:center;
    width:26px;
}

.ogl_messageButton:hover
{
    /*background:linear-gradient(to bottom, #1a2027, #2e3948) !important;
    box-shadow:inset 0 -1px 3px #374454;*/
    background:linear-gradient(160deg, rgba(67, 107, 145, 1) 0%, rgba(52, 76, 97, 1) 33%, rgba(40, 58, 71, 1) 66%, rgba(20, 26, 32, 1) 100%) !important;
    box-shadow:0px 0px 0px 0px transparent;
}

message-footer-actions gradient-button[sq30]
{
    height:26px !important;
    width:26px !important;
}

.ogl_messageButton.ogl_ignore.ogl_active
{
    color:#c65757 !important;
}

.ogl_messageButton.ogl_ignore:before
{
    content:'toggle_off';
    font-family:'Material Icons';
    font-size:18px !important;
}

.ogl_messageButton.ogl_ignore.ogl_active:before
{
    content:'toggle_on';
}

.ogl_messageButton.ogl_ignore:hover:after
{
    display:inline-block;
}

.ogl_tooltip > .ogl_resourcesDetail:not(.ogl_tooltipTriangle):not(.ogl_close)
{
    display:grid !important;
    grid-gap:12px;
    grid-template-columns:repeat(2, 1fr);
    max-width:800px;
}

.ogl_resourcesDetail > div:last-child
{
    grid-column:1 / -1;
}

.ogl_resourcesDetail > div
{
    background:var(--secondary);
    border-radius:5px;
    padding:7px;
    position:relative;
    text-align:center;
}

.ogl_resourcesDetail h3
{
    color:#9ea4af;
    display:block;
    font-size:24px !important;
    margin-bottom:8px;
    text-align:center;
}

.ogl_resourcesDetail .ogl_todoDays span:not(.ogl_suffix)
{
    color:#fff;
}

[data-api-code]
{
    cursor:pointer;
}

.reversal
{
    overflow:unset !important;
}

.ogl_button[data-key-color]:before, .reversal a[data-key-color]:before
{
    color:transparent;
    content:'\\e98b';
    font-family:'Material Icons';
    font-size:11px;
    line-height:12px;
    pointer-events:none;
    position:absolute;
    right:-4px;
    text-shadow:-1px 1px 2px rgba(0,0,0,.4);
    top:-3px;
}

.reversal a:before
{
    right:-6px;
    top:0;
}

.ogl_button[data-key-color="orange"]:before { color:#ff7806; }
.ogl_button[data-key-color="violet"]:before { color:#fa59fd; }
.ogl_button[data-key-color="blue"]:before { color:var(--mission15); }
.ogl_button[data-key-color="cyan"]:before { color:#7bffed; }

.reversal a[data-key-color="orange"]:before { color:#ff7806; }
.reversal a[data-key-color="violet"]:before { color:#fa59fd; }

[data-key-color="undefined"]:before
{
    display:none !important;
}

.ogl_reverse
{
    color:#fff;
    font-size:16px !important;
    opacity:.6;
    position:absolute;
    right:5px;
    text-shadow:2px 1px 0 #000;
    top:3px;
    z-index:10;
}

.ogl_reverse:hover
{
    opacity:1;
}

.resourceIcon .ogl_reverse
{
    right:1px;
    top:1px;
}

.ogl_notification
{
    background:var(--tertiary);
    bottom:5px;
    box-shadow:0 0 20px 10px rgba(0,0,0,.7);
    font-weight:bold;
    max-height:500px;
    min-width:275px;
    opacity:0;
    overflow-y:auto;
    overflow-x:hidden;
    padding:14px 14px 11px 14px;
    pointer-events:none;
    position:fixed;
    right:5px;
    transform:scaleX(0);
    transform-origin:center right;
    transition:transform .2s;
    z-index:1000003;
}

.ogl_notification.ogl_active
{
    opacity:1;
    pointer-events:all;
    transform:scaleX(1);
}

.ogl_notificationLine
{
    border-bottom:1px solid #2d3644;
    display:flex;
    font-size:11px;
    grid-gap:7px;
    line-height:15px;
    padding:8px 0;
    max-width:380px;
}

.ogl_notificationLine:last-child
{
    border:none;
}

.ogl_notification > div > *:last-child > hr:last-child
{
    display:none;
}

.ogl_notification progress
{
    appearance:none;
    height:3px;
    left:0;
    position:absolute;
    top:0;
    width:100%;
}

.ogl_notification progress::-webkit-progress-value
{
    appearance:none;
    background:var(--ogl);
    transition:width .2s linear;
}

.ogl_notification progress::-moz-progress-bar
{
    appearance:none;
    background:var(--amber);
    transition:width .2s linear;
}

.ogl_notification .ogl_ok, .ogl_notification .ogl_danger
{
    font-size:12px !important;
    margin-left:4px;
    vertical-align:middle;
}

.ogl_notification h2
{
    font-size:14px;
    text-align:center;
}

.ogl_notification .ogl_grid
{
    display:grid;
    grid-gap:5px;
    grid-template-columns:repeat(2, 1fr);
    max-width:275px;
}

.ogl_notification .ogl_icon
{
    align-items:center;
    background:var(--secondary);
    border-radius:3px;
    display:flex;
}

.ogl_notification .ogl_icon:before
{
    margin-right:auto;
}

.ogl_notification .ogl_icon[class*="lifeform"]:before
{
    background-position-y:77%;
    background-size:335px;
    height:18px;
    image-rendering:auto;
    width:28px;
}

.ogl_notification .ogl_icon .ogl_suffix
{
    text-indent:0;
}

.ogl_notification .ogl_notificationTimer
{
    color:var(--date);
    display:inline-block;
    font-size:11px;
    margin-right:5px;
    opacity:.5;
}

.ogl_empireJumpgate
{
    font-size:20px !important;
    margin-top:3px;
    text-align:center;
    width:100%;
}

#eventboxContent .eventFleet, #eventboxContent .allianceAttack
{
    align-items:center;
    display:grid;
    grid-gap:2px;
    grid-template-columns:82px 62px 23px 70px 87px auto 19px 87px 70px 20px 21px 20px;
    white-space:nowrap;
}

#eventboxContent .eventFleet > td
{
    align-items:center;
    box-shadow:0 0 0 2px rgba(0,0,0,.25);
    box-sizing:border-box;
    border-radius:3px;
    display:flex;
    height:calc(100% - 2px);
    justify-content:left;
    overflow:hidden;
    padding:2px 4px;
    text-align:center;
    width:100%;
}

#eventboxContent .eventFleet { td.arrivalTime, td.coordsOrigin, td.destCoords { justify-content:center; }}
#eventboxContent .eventFleet > td:not(.icon_movement):not(.icon_movement_reserve) { padding:2px 2px; }
#eventboxContent .eventFleet > td:nth-child(3) { background:none !important; }
#eventboxContent .eventFleet > td:nth-child(5) { grid-column:4;grid-row:1; }

#eventboxContent .eventFleet > td:nth-child(10) span,
#eventboxContent .eventFleet > td:nth-child(11) span,
#eventboxContent .eventFleet > td:nth-child(12) span
{
    display:flex !important;
}

#eventboxContent .eventFleet > td a
{
    text-decoration:none !important;
}

#eventboxContent .eventFleet > td a:hover
{
    color:var(--ogl) !important;
}

.eventFleet [data-output-time]
{
    justify-self:flex-start;
}

.icon_movement, .icon_movement_reserve
{
    background-position:center !important;
}

.originFleet, .destFleet
{
    align-items:center;
    display:flex;
    grid-gap:2px;
    justify-content:center;
}

.originFleet .tooltip[data-title]:not(figure),
.destFleet .tooltip[data-title]:not(figure)
{
    align-items:center;
    display:inline-flex !important;
    font-size:0;
    grid-gap:1px;
}

.originFleet .tooltip[data-title]:not(figure):after,
.destFleet .tooltip[data-title]:not(figure):after
{
    content:attr(data-title);
    font-size:11px;
    overflow:hidden;
    text-overflow:ellipsis;
}

.originFleet figure, .destFleet figure
{
    flex-shrink:0;
}

#technologydetails .ogl_queueShip
{
    display:flex;
    position:absolute;
    top:52px;
}

#technologydetails .ogl_queueShip .ogl_button
{
    border-radius:3px 0 0 3px;
    width:60px;
}

#technologydetails .ogl_queueShip input
{
    background:#121518;
    border:none;
    border-bottom:1px solid #242a32;
    border-radius:0 3px 3px 0;
    border-top:1px solid #080b10;
    box-shadow:none;
    box-sizing:border-box;
    color:#5d738d;
    padding:0 4px;
    text-align:left;
    width:45px;
}

.fleetDetails
{
    background:linear-gradient(to bottom, #1a1d24, #0e1014 26px) !important;
    border:none !important;
    border-radius:0 !important;
    box-shadow:0 0 20px -5px #000, 0 0 0 1px #000 !important;
    display:inline-block !important;
    line-height:18px !important;
    margin:12px 0 0 6px !important;
    overflow:unset !important;
    padding:5px !important;
    position:relative !important;
    width:96% !important;
}

.fleetDetails.detailsOpened
{
    height:auto !important;
}

.fleetDetails .starStreak, .fleetDetails .nextMission,
.fleetDetails .mission, .fleetDetails.detailsClosed .ogl_shipsBlock,
.fleetDetails.detailsClosed .ogl_resourcesBlock,
.fleetDetails.detailsClosed .fedAttack,
.fleetDetails.detailsClosed .sendMail,
.fleetDetails .fleetDetailButton, .fleetDetails .marker01, .fleetDetails .marker02
{
    display:none !important;
}

.fleetDetails hr
{
    background:#1e252e;
    border:none;
    height:2px;
}

.fleetDetails .openDetails
{
    left:auto !important;
    position:absolute !important;
    right:0 !important;
    top:-2px !important;
}

.fleetDetails.detailsOpened .timer
{
    height:auto !important;
}

.ogl_resourcesBlock
{
    box-sizing:border-box;
    display:grid;
    font-size:11px;
    grid-gap:5px;
    grid-template-columns:repeat(8, 1fr);
    margin-top:5px;
    text-wrap:nowrap;
    width:100%;
}

.ogl_resourcesBlock .ogl_icon
{
    background:#191d26;
    margin:0;
    padding:3px;
    justify-content:end;
}

.ogl_resourcesBlock .ogl_icon:before
{
    display:block;
    margin:0 auto 0 0;
}

.ogl_shipsBlock
{
    box-sizing:border-box;
    color:#fff;
    display:grid;
    grid-template-columns:repeat(3, 1fr);
}

.ogl_backTimer
{
    align-items:center;
    box-shadow:0 0 0 1px #000;
    box-sizing:border-box;
    font-size:0;
    grid-column:-3 / -1;
    grid-row:1;
    line-height:14px !important;
    padding:5px 32px 5px 5px;
    text-align:right;
}

.ogl_backTimer:before, .ogl_backTimer:after
{
    font-size:11px;
}

.ogl_backTimer:hover
{
    box-shadow:0 0 0 2px var(--ogl);
    color:transparent !important;
}

.fleetDetails .reversal_time
{
    left:auto !important;
    pointer-events:none !important;
    position:absolute !important;
    right:10px !important;
    top:31px !important;
    z-index:2 !important;
}

.fleetDetails.detailsClosed .reversal_time
{
    pointer-events:all !important;
    right:0 !important;
    top:14px !important;
}

.ogl_timeBlock
{
    align-items:center;
    border-radius:3px;
    display:grid;
    grid-gap:78px;
    grid-template-columns:repeat(2, 1fr);
}

.ogl_timeBlockLeft, .ogl_timeBlockRight
{
    border-radius:3px;
    display:grid;
    grid-template-columns:70px 70px auto;
    padding:1px;
    justify-content:start;
}

.ogl_timeBlockRight
{
    grid-template-columns:auto 70px 70px;
    justify-content:end;
    text-align:right;
}

.ogl_timeBlock > div > *
{
    left:0 !important;
    line-height:14px !important;
    margin:0 !important;
    padding:0 !important;
    position:relative !important;
    text-align:inherit !important;
    top:0 !important;
    width:auto !important;
}

.ogl_timeBlock .tooltip
{
    color:inherit !important;
}

.ogl_timeBlock .originData, .ogl_timeBlock .destinationData
{
    display:flex;
    grid-gap:5px;
    justify-content:center;
}

.ogl_timeBlock .originPlanet, .ogl_timeBlock .destinationPlanet,
.ogl_timeBlock .originCoords, .ogl_timeBlock .destinationCoords
{
    left:0 !important;
    padding:0 !important;
    position:relative !important;
}

.detailsOpened .destinationPlanet, .detailsClosed .destinationPlanet,
.detailsOpened .originPlanet
{
    width:auto !important;
}

.ogl_actionsBlock
{
    align-items:center;
    background:var(--tertiary);
    border-radius:3px;
    box-shadow:0 3px 5px -2px #000;
    display:grid;
    grid-gap:5px;
    grid-template-columns:repeat(2, 1fr);
    justify-content:center;
    left:50%;
    padding:2px;
    position:absolute;
    top:-5px;
    transform:translateX(-50%);
    z-index:2;
}

.ogl_actionsBlock *
{
    justify-self:center;
    left:0 !important;
    margin:0 !important;
    padding:0 !important;
    position:relative !important;
    top:0 !important;
    width:18px !important;
}

.ogl_actionsBlock .ogl_icon[class*="ogl_mission"]:not(.ogl_mission18):before
{
    background-size:212px !important;
}

.ogl_actionsBlock .ogl_icon[class*="ogl_mission"]:before
{
    margin:0;
    width:18px;
}

.fleetDetails .allianceName
{
    bottom:auto !important;
    left:auto !important;
    right:3px !important;
    top:-17px !important;
}

.ogl_phalanxLastUpdate
{
    background:var(--secondary);
    border-radius:4px;
    margin-bottom:10px;
    padding:5px;
    text-align:center;
}

.ogl_phalanxLastUpdate b
{
    color:var(--amber);
}

.ogl_universeName
{
    color:#aeaac1;
    font-size:12px;
    font-weight:bold;
    line-height:12px;
    pointer-events:none;
    position:absolute;
    text-align:right;
    top:92px;
    width:138px;
}

.ogl_universeInfoTooltip
{
    line-height:1.4;
}

.ogl_universeInfoTooltip div
{
    color:var(--amber);
    display:inline-block;
    float:right;
    font-size:11px;
    text-indent:10px;
}

.ogl_popup .ogl_frameSelector
{
    display:grid;
    grid-gap:5px;
    grid-template-columns:repeat(6, 1fr);
    margin-bottom:10px;
}

.ogl_popup .ogl_frameSelector .ogl_button
{
    min-width:80px;
}

.ogl_popup .ogl_frameSelector .ogl_button.ogl_active
{
    box-shadow:0 0 0 2px var(--ogl);
}

.ogl_ptreContent
{
    display:grid;
    grid-gap:10px;
    grid-template-columns:auto auto;
}

.ogl_ptreContent b
{
    align-items:center;
    border-bottom:1px solid #1b222b;
    border-top:1px solid #1b222b;
    color:#ff4646;
    display:flex;
    font-size:12px;
    justify-content:center;
    margin-bottom:10px;
    padding:5px 0;
}

.ogl_ptreContent b .material-icons
{
    font-size:16px !important;
    margin-right:5px;
}

.ogl_ptreContent h3
{
    font-size:18px;
    grid-column:1 / -1;
    padding:8px;
    text-align:center;
}

.ogl_ptreContent hr
{
    background:#151e28;
    border:none;
    grid-column:1 / -1;
    height:2px;
    width:100%;
}

.ogl_ptreActivityBlock, .ogl_ptreBestReport
{
    background:rgba(0,0,0,.2);
    border-radius:9px;
    padding:10px;
}

.ogl_ptreLegend
{
    color:var(--blue);
    font-size:10px;
    margin-top:20px;
    text-align:left;
}

.ogl_ptreActivities [data-check]
{
    align-self:center;
    background:currentColor;
    border:3px solid currentColor;
    border-radius:50%;
    height:0;
    padding:4px;
    width:0;
}

.ogl_ptreActivities [data-check].ogl_active
{
    background:none;
}

.ogl_ptreActivities > span
{
    color:var(--red);
}

.ogl_ptreActivities > div
{
    display:grid;
    grid-gap:5px;
    grid-template-columns:repeat(12, 1fr);
}

.ogl_ptreActivities > div > *
{
    align-items:center;
    background:var(--secondary);
    border-radius:2px;
    color:#656f78;
    display:grid;
    height:45px;
    padding:3px;
}

.ogl_ptreActivities > div > * > *
{
    display:inline-block;
    margin:auto;
}

.ogl_ptreActivities .ptreDotStats
{
    height:30px;
    position:relative;
    width:30px;
}

.ogl_ptreContent
{
    text-align:center;
}

.ogl_ptreBestReport > div:first-child
{
    padding:10px;
}

.ogl_checked
{
    color:var(--green);
    font-size:19px !important;
    vertical-align:middle;
}

.ogl_log > div:not(.ogl_close):not(.ogl_share)
{
    border-bottom:1px solid #20262c;
    display:grid;
    grid-template-columns:100px 100px 300px;
    margin-top:5px;
    padding-bottom:5px;
}

.ogl_log h2
{
    grid-column:1 / -1;
}

.ogl_ptreActionIcon
{
    align-items:center;
    display:inline-flex;
    justify-content:center;
}

.ogl_ptreActionIcon i
{
    color:inherit;
    font-size:12px !important;
}

.ogl_ptreActionIcon i.ogl_active
{
    animation:blink 1.5s linear infinite;
}

@keyframes blink
{
  50% { opacity: 0; }
}

.ogl_leftMenuIcon
{
    background:linear-gradient(to bottom, #1b2024 50%, #000 50%);
    border-radius:4px;
    display:block;
    height:27px;
    margin-right:11px;
    user-select:none;
    text-align:center;
    width:27px !important;
}

.ogl_leftMenuIcon a
{
    align-items:center;
    color:#353a3c !important;
    display:flex !important;
    height:100%;
    justify-content:center;
}

.ogl_leftMenuIcon a i
{
    font-size:21px !important;
    line-height:27px !important;
}

.ogl_leftMenuIcon a:hover
{
    color:#d39343 !important;
}

.ogl_resourceBoxStorage
{
    display:none;
    font-size:10px;
    left:0;
    pointer-events:none;
    position:absolute;
    top:12px;
    width:100%;
}

#resources:hover .ogl_resourceBoxStorage
{
    display:block;
}

#resources:hover .resource_tile .resourceIcon.metal,
#resources:hover .resource_tile .resourceIcon.crystal,
#resources:hover .resource_tile .resourceIcon.deuterium
{
    box-shadow:inset 0 0 0 20px rgba(0,0,0, .8);
}

.ogl_manageData .ogl_grid
{
    display:grid;
    grid-gap:5px;
}

.ogl_manageData .ogl_button
{
    align-items:center;
    display:flex;
    justify-content:center;
    padding:3px 9px;
}

.ogl_manageData .ogl_button .material-icons
{
    margin-left:auto;
}

.ogl_manageData .ogl_button.ogl_danger
{
    background:linear-gradient(to bottom, #7c4848, #5a3535 2px, #3a1818);
    color:#b7c1c9 !important;
}

.ogl_manageData .ogl_button.ogl_danger:hover
{
    color:var(--ogl) !important;
}

.ogl_manageData hr
{
    background:#151e28;
    border:none;
    grid-column:1 / -1;
    height:2px;
    width:100%;
}

.chat_msg .msg_date
{
    position:absolute;
}

.ogl_acsInfo .value span
{
    margin-left:5px;
}

.ogl_blackHoleButton
{
    bottom:5px;
    font-size:16px !important;
    position:absolute;
    right:5px;
    width:28px;
}

.ogl_blackhole .ogl_button
{
    float:right;
    margin-top:10px;
    width:70px;
}

.ogl_buildIconList
{
    bottom:0;
    display:flex;
    left:30px;
    pointer-events:none;
    position:absolute;
}

.ogl_buildIcon
{
    color:#73fff2;
}

.ogl_baseShip
{
    color:#ffcb55;
}

.ogl_buildIcon.ogl_lfBuilding
{
    color:#e598ff;
}

.ogl_buildList
{
    margin-top:5px;
}

.ogl_buildList li
{
    align-items:center;
    display:flex;
}

.ogl_buildList li span
{
    display:inline-block;
    max-width:100px;
}

.ogl_buildList .material-icons
{
    margin:0 7px;
}

.ogl_buildList .material-icons:first-child
{
    font-size:8px !important;
    margin:0 4px 0 0;
}

.ogl_buildList b
{
    color:var(--amber);
    font-size:12px;
    font-weight:bold;
}

[data-debug]
{
    position:relative;
}

[data-debug]:after
{
    background:rgba(0,0,0,.7);
    color:yellow !important;
    content:attr(data-debug);
    display:block;
    left:0;
    opacity:.8;
    position:absolute;
    text-shadow:1px 1px #000;
    top:12px;
    width:max-content;
}

.ogl_datePicker
{
    display:grid !important;
    grid-gap:10px;
    grid-template-columns:repeat(3, 1fr);
    user-select:none;
}

.ogl_datePicker .ogl_dateItem
{
    align-items:center;
    display:flex;
    font-size:14px;
    justify-content:center;
}

.ogl_datePicker .material-icons
{
    font-size:16px !important;
}

#jumpgate #selecttarget select
{
    display:block !important;
    visibility:visible !important;
}

#jumpgate #selecttarget .dropdown
{
    display:none !important;
}

#jumpgate select
{
    font-size:12px !important;
    padding:2px !important;
}

.ogl_boardMessageTab .tabs_btn_img
{
    background:linear-gradient(135deg, #375063 33.33%, #23394a 33.33%, #23394a 50%, #375063 50%, #375063 83.33%, #23394a 83.33%, #23394a 100%) !important;
    background-size:3px 3px !important;
    border-bottom:1px solid #385365 !important;
    border-left:2px solid #3c596c !important;
    border-right:2px solid #3c596c !important;
    border-top:1px solid #385365 !important;
    border-radius:7px !important;
    box-shadow:inset 0 0 10px 6px #1c2831 !important;
    cursor:pointer !important;
    height:50px !important;
    margin-top:1px !important;
    position:relative !important;
    text-decoration:none !important;
    width:48px !important;
}

.ogl_boardMessageTab .tabs_btn_img:hover
{
    filter:brightness(1.2);
}

.ogl_boardMessageTab .tabs_btn_img:before
{
    background:#395467;
    border-radius:6px;
    content:'';
    filter:blur(0.5px);
    height:calc(50% + 2px);
    left:0;
    opacity:.6;
    position:absolute;
    right:0;
    top:-2px;
}

.ogl_boardMessageTab .tabs_btn_img:after
{
    background:#395467;
    border-radius:7px;
    bottom:2px;
    content:'';
    filter:blur(1px);
    height:4px;
    left:3px;
    opacity:.6;
    position:absolute;
    right:3px;
}

.ogl_boardMessageTab.ui-tabs-active .marker
{
    left:-10px !important;
    top:-9px !important;
}

.ogl_boardMessageTab .icon_caption
{
    margin:0 !important;
    position:relative !important;
    width:100% !important;
    z-index:1 !important;
}

.tabs_btn_img .material-icons
{
    align-items:center;
    background:linear-gradient(to bottom, #d7dfe5 50%, #d4d9dd 50%);
    background-clip:text;
    color:transparent;
    display:flex;
    font-size:36px !important;
    height:100%;
    justify-content:center;
    margin-bottom:4px;
    width:100%;
}

#oglBoardTab *
{
    max-width:100%;
}

#oglBoardTab .msg
{
    padding:10px;
}

#oglBoardTab .msg_content
{
    margin-top:10px;
    padding:0;
}

#oglBoardTab .msg_title
{
    display:inline-block !important
}

#oglBoardTab .msg_title:hover
{
    color:#fff;
    cursor:pointer;
    text-decoration:underline;
}

#oglBoardTab .msg_title i
{
    color:var(--pink);
}

#oglBoardTab .spoilerBox
{
    display:none !important;
}

.ogl_sidenote
{
    color:#aaa;
    font-style:italic;
}

`;

GM_addStyle(css);

const oglMaterial =
`
@font-face
{
    font-family:'Material Icons';
    font-style:normal;
    font-weight:400;
    src:url('data:font/woff2;base64,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') format('woff2');
}
`;

GM_addStyle(oglMaterial);

const miniImage =
`
/*css*/
body[data-minipics="true"]
{
    .maincontent > div header, .maincontent .planet-header
    {
        height:34px !important;
    }

    .maincontent #overviewcomponent #planet,
    .maincontent #overviewcomponent #detailWrapper
    {
        height:auto !important;
        min-height:208px !important;
        position:relative !important;
    }

    .maincontent #technologydetails_wrapper:not(.slide-down)
    {
        position:relative !important;
    }

    .maincontent #detail.detail_screen
    {
        height:300px !important;
        position:relative !important;
    }
}
/*!css*/
`;

GM_addStyle(miniImage);

const altStyle =
`
/*css*/
body[data-menulayout="1"], body[data-menulayout="2"]
{
    #bannerSkyscrapercomponent
    {
        margin-left:260px !important;
    }

    /*#pageContent, #mainContent
    {
        width:1016px !important;
        width:990px !important;
    }*/

    #commandercomponent
    {
        transform:translateX(27px);
    }

    #bar ul li.OGameClock
    {
        transform:translateX(29px);
    }

    .ogl_topbar
    {
        font-size:15px;
        width:100%;
    }

    #planetbarcomponent #rechts
    {
        width:170px !important;
    }

    #planetList
    {
        transform:translate(0);
        width:100%;
    }

    .smallplanet
    {
        background:#0e1116;
        box-sizing:border-box;
        height:38px !important;
    }

    .smallplanet .planetlink, .smallplanet .moonlink
    {
        border-radius:4px !important;
        height:100% !important;
    }

    .smallplanet .planet-name
    {
        top:6px !important;
    }

    .smallplanet .planet-koords
    {
        bottom:7px !important;
    }

    .smallplanet .planetPic
    {
        box-shadow:0 0 2px #000000 !important;
        left:8px !important;
        top:7px !important;
        transform:scale(1.2);
    }

    .smallplanet .icon-moon
    {
        box-shadow:0 0 3px #000000 !important;
        left:11px !important;
        top:11px !important;
        transform:scale(1.1);
    }
}

body[data-menulayout="1"]
{
    .smallplanet { grid-template-columns:127px 38px; }
    .smallplanet .ogl_available { display:none; }
    .smallplanet .planet-name, .smallplanet .planet-koords { left:40px !important; }
    .ogl_refreshTimer { background:none;font-size:11px;left:auto;right:3px; }
    &.ogl_destinationPicker .smallplanet .planetlink.ogl_currentDestination:after { top:9px !important;left:9px !important; }
    &.ogl_destinationPicker .smallplanet .moonlink.ogl_currentDestination:after { top:9px !important;left:10px !important; }
    .ogl_buildIconList { left:4px; }
}

body[data-menulayout="2"]
{
    .smallplanet { grid-template-columns:101px 64px; }
    .smallplanet .ogl_available { line-height:10px; }
    .smallplanet .planet-name, .smallplanet .planet-koords { opacity:0 !important; }
    .smallplanet .icon-moon { left:4px !important; }
    &.ogl_destinationPicker .smallplanet .planetlink.ogl_currentDestination:after { top:9px !important;left:9px !important; }
    &.ogl_destinationPicker .smallplanet .moonlink.ogl_currentDestination:after { top:9px !important;left:4px !important; }
}

/*!css*/
`;

GM_addStyle(altStyle);

class CSSManager
{
    static miniMenu(layout)
    {
        document.body.setAttribute('data-menulayout', layout);
        localStorage.setItem('ogl_menulayout', layout)
    }

    static miniImage(state)
    {
        document.body.setAttribute('data-minipics', state);
        localStorage.setItem('ogl_minipics', state)
    }
}


