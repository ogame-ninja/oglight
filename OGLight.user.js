// ==UserScript==
// @name         OGLight Ninja
// @namespace    https://openuserjs.org/users/nullNaN
// @version      5.1.1
// @description  OGLight script for OGame
// @author       Oz
// @license      MIT
// @copyright    2019, Oz
// @match        https://*.ogame.gameforge.com/game/*
// @match        *127.0.0.1*/bots/*/browser/html/*?page=*
// @match        *.ogame.ninja/bots/*/browser/html/*?page=*
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
"use strict";
	const universeNum = /browser\/html\/s(\d+)-(\w+)/.exec(window.location.href)[1];
	const lang = /browser\/html\/s(\d+)-(\w+)/.exec(window.location.href)[2];
	const UNIVERSE = "s" + universeNum + "-" + lang;
	const PROTOCOL = window.location.protocol;
	const HOST = window.location.host;

const oglRedirection = localStorage.getItem("ogl-redirect");

function goodbyeTipped() {
  if ("undefined" != typeof Tipped)
    for (let [e] of Object.entries(Tipped)) Tipped[e] = function () {
      return !1
    };
  else requestAnimationFrame((() => goodbyeTipped()))
}
oglRedirection?.indexOf("https") > -1 && (GM_addStyle("\n        body { background:#000 !important; }\n        body * { display:none !important; }\n    "), setTimeout((() => window.location.replace(oglRedirection))), localStorage.setItem("ogl-redirect", !1)), goodbyeTipped(), unsafeWindow?.ogl && (unsafeWindow.ogl = null);
const updateOGLBody = () => {
  document.body.setAttribute("data-minipics", localStorage.getItem("ogl_minipics") || !1), document.body.setAttribute("data-menulayout", localStorage.getItem("ogl_menulayout") || 0)
};
if (document.body ? updateOGLBody() : new MutationObserver((function () {
    document.body && (updateOGLBody(), this.disconnect())
  })).observe(document, {
    childList: !0
  }), void 0 === GM_getTab) var GM_getTab = e => {
  e(JSON.parse(GM_getValue("ogl_tab") || "{}"))
};
if (void 0 === GM_saveTab) var GM_saveTab = e => {
  GM_setValue("ogl_tab", JSON.stringify(e || {}))
};
let betaVersion = "-b5",
  oglVersion = "5.1.0";
class OGLight {
  constructor(e) {
    const n=document.querySelector('head meta[name="ogame-player-id"]').getAttribute('content').replace(/\D/g, '');
    this.DBName = `${n}-${window.location.host.split(".")[0]}`, this.db = this.load(), !GM_getValue(this.DBName) && GM_getValue(window.location.host) && (GM_setValue(this.DBName, GM_getValue(window.location.host)), GM_deleteValue(window.location.host), window.location.reload()), this.db.lastServerUpdate = this.db.lastServerUpdate || 0, this.db.lastEmpireUpdate = this.db.lastEmpireUpdate || 0, this.db.lastLFBonusUpdate = this.db.lastLFBonusUpdate || 0, this.db.lastProductionQueueUpdate = this.db.lastProductionQueueUpdate || 0, this.db.udb = this.db.udb || {}, this.db.pdb = this.db.pdb || {}, this.db.tdb = this.db.tdb || {}, this.db.myPlanets = this.db.myPlanets || {}, this.db.dataFormat = this.db.dataFormat || 0, this.db.tags = 13 == Object.keys(this.db.tags || {}).length ? this.db.tags : {
      red: !0,
      orange: !0,
      yellow: !0,
      lime: !0,
      green: !0,
      blue: !0,
      dblue: !0,
      violet: !0,
      magenta: !0,
      pink: !0,
      brown: !0,
      gray: !0,
      none: !1
    }, this.db.lastPinTab = this.db.lastPinTab || "miner", this.db.shipsCapacity = this.db.shipsCapacity || {}, this.db.spytableSort = this.db.spytableSort || "total", this.db.lastTaggedInput = this.db.lastTaggedInput || [], this.db.lastPinnedList = this.db.lastPinnedList || [], this.db.initialTime = this.db.initialTime || Date.now(), this.db.fleetLimiter = this.db.fleetLimiter || {
      data: {},
      jumpgateData: {},
      shipActive: !1,
      resourceActive: !1,
      jumpgateActive: !1
    }, this.db.keepEnoughCapacityShip = this.db.keepEnoughCapacityShip || 200, this.db.keepEnoughCapacityShipJumpgate = this.db.keepEnoughCapacityShipJumpgate || 200, this.db.spyProbesCount = this.db.spyProbesCount || 6, this.db.configState = this.db.configState || {
      fleet: !0,
      general: !0,
      expeditions: !0,
      stats: !0,
      messages: !0,
      data: !0
    }, this.db.options = this.db.options || {}, this.db.options.defaultShip = this.db.options.defaultShip || 202, this.db.options.defaultMission = this.db.options.defaultMission || 3, this.db.options.resourceTreshold = this.db.options.resourceTreshold || 3e5, this.db.options.ignoreConsumption = this.db.options.ignoreConsumption || !1, this.db.options.ignoreExpeShipsLoss = this.db.options.ignoreExpeShipsLoss || !1, this.db.options.useClientTime = this.db.options.useClientTime || !1, this.db.options.displayMiniStats = void 0 !== this.db.options.displayMiniStats ? this.db.options.displayMiniStats : "day", this.db.options.collectLinked = this.db.options.collectLinked || !1, this.db.options.expeditionValue = this.db.options.expeditionValue || 0, this.db.options.expeditionBigShips = this.db.options.expeditionBigShips || [204, 205, 206, 207, 215], this.db.options.expeditionRandomSystem = this.db.options.expeditionRandomSystem || 0, this.db.options.expeditionRedirect = this.db.options.expeditionRedirect || !1, this.db.options.expeditionShipRatio = Math.min(this.db.options.expeditionShipRatio, 100), this.db.options.displayPlanetTimers = !1 !== this.db.options.displayPlanetTimers, this.db.options.reduceLargeImages = this.db.options.reduceLargeImages || !1, this.db.options.showMenuResources = this.db.options.showMenuResources || 0, this.db.options.autoCleanReports = this.db.options.autoCleanReports || !1, this.db.options.tooltipDelay = !1 !== this.db.options.tooltipDelay ? Math.max(this.db.options.tooltipDelay, 100) : 400, this.db.options.spyIndicatorDelay = this.db.options.spyIndicatorDelay || 36e5, this.db.options.debugMode = this.db.options.debugMode || !1, this.db.options.sim = this.db.options.sim || !1, this.db.options.boardTab = !1 !== this.db.options.boardTab, this.db.options.msu = this.db.options.msu || "3:2:1", this.db.options.disablePlanetTooltips = this.db.options.disablePlanetTooltips || !1, this.db.options.displaySpyTable = !1 !== this.db.options.displaySpyTable, this.db.options.shortcutsOnRight = this.db.options.shortcutsOnRight || !1, this.db.options.keyboardActions = this.db.options.keyboardActions || {}, this.db.options.keyboardActions.menu = this.db.options.keyboardActions.menu || "²", this.db.options.keyboardActions.previousPlanet = this.db.options.keyboardActions.previousPlanet || "i", this.db.options.keyboardActions.nextPlanet = this.db.options.keyboardActions.nextPlanet || "o", this.db.options.keyboardActions.nextPinnedPosition = this.db.options.keyboardActions.nextPinnedPosition || "m", this.db.options.keyboardActions.fleetRepeat = this.db.options.keyboardActions.fleetRepeat || "p", this.db.options.keyboardActions.fleetSelectAll = this.db.options.keyboardActions.fleetSelectAll || "a", this.db.options.keyboardActions.fleetReverseAll = this.db.options.keyboardActions.fleetReverseAll || "r", this.db.options.keyboardActions.expeditionSC = this.db.options.keyboardActions.expeditionSC || "s", this.db.options.keyboardActions.expeditionLC = this.db.options.keyboardActions.expeditionLC || "l", this.db.options.keyboardActions.expeditionPF = this.db.options.keyboardActions.expeditionPF || "f", this.db.options.keyboardActions.quickRaid = this.db.options.keyboardActions.quickRaid || "t", this.db.options.keyboardActions.fleetResourcesSplit = this.db.options.keyboardActions.fleetResourcesSplit || "2-9", this.db.options.keyboardActions.galaxyUp = this.db.options.keyboardActions.galaxyUp || ("fr" == window.location.host.split(/[-.]/)[1] ? "z" : "w"), this.db.options.keyboardActions.galaxyLeft = this.db.options.keyboardActions.galaxyLeft || ("fr" == window.location.host.split(/[-.]/)[1] ? "q" : "a"), this.db.options.keyboardActions.galaxyDown = this.db.options.keyboardActions.galaxyDown || "s", this.db.options.keyboardActions.galaxyRight = this.db.options.keyboardActions.galaxyRight || "d", this.db.options.keyboardActions.galaxySpySystem = this.db.options.keyboardActions.galaxySpySystem || "r", this.db.options.keyboardActions.backFirstFleet = this.db.options.keyboardActions.backFirstFleet || "f", this.db.options.keyboardActions.backLastFleet = this.db.options.keyboardActions.backLastFleet || "l", this.db.options.keyboardActions.discovery = this.db.options.keyboardActions.discovery || "u", this.db.options.keyboardActions.showMenuResources = this.db.options.keyboardActions.showMenuResources || "v", "loading" !== document.readyState ? this.init(e.cache) : document.onreadystatechange = () => {
      "loading" === document.readyState || this.isReady || (this.isReady = !0, this.init(e.cache))
    }
  }
  init(e) {
    if (document.body.classList.add("oglight"), this.db.options.showMenuResources && CSSManager.miniMenu(this.db.options.showMenuResources), this.db.options.reduceLargeImages && CSSManager.miniImage(this.db.options.reduceLargeImages), this.id = GM_getValue("ogl_id") || !1, this.version = GM_info.script.version.indexOf("b") > -1 ? oglVersion + betaVersion : oglVersion, this.tooltipEvent = new Event("tooltip"), this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), this.mode = parseInt(new URLSearchParams(window.location.search).get("oglmode")) || 0, this.page = new URL(window.location.href).searchParams.get("component") || new URL(window.location.href).searchParams.get("page"), this.resourcesKeys = {
        metal: "metal",
        crystal: "crystal",
        deut: "deuterium",
        food: "food",
        population: "population",
        energy: "energy",
        darkmatter: "darkmatter"
      }, this.shipsList = [202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 213, 214, 215, 218, 219], this.fretShips = [202, 203, 209, 210, 219], this.ptreKey = localStorage.getItem("ogl-ptreTK") || !1, this.planetType = document.querySelector('head meta[name="ogame-planet-type"]').getAttribute("content"), this.flagsList = ["friend", "rush", "danger", "skull", "fridge", "star", "trade", "money", "ptre", "none"], this.server = {}, this.server.id=document.querySelector('head meta[name="ogame-universe"]').getAttribute('content').replace(/\D/g,""), this.server.name = document.querySelector('head meta[name="ogame-universe-name"]').getAttribute("content"), this.server.lang = document.querySelector('head meta[name="ogame-language"]').getAttribute("content"), this.server.economySpeed = parseInt(document.querySelector('head meta[name="ogame-universe-speed"]').getAttribute("content")), this.server.peacefulFleetSpeed = parseInt(document.querySelector('head meta[name="ogame-universe-speed-fleet-peaceful"]').getAttribute("content")), this.server.holdingFleetSpeed = parseInt(document.querySelector('head meta[name="ogame-universe-speed-fleet-holding"]').getAttribute("content")), this.server.warFleetSpeed = parseInt(document.querySelector('head meta[name="ogame-universe-speed-fleet-war"]').getAttribute("content")), 300 != this.server.id || "en" != this.server.lang)
      if (this.account = {}, this.account.id = document.querySelector('head meta[name="ogame-player-id"]').getAttribute("content"), this.account.class = document.querySelector("#characterclass .sprite")?.classList.contains("miner") ? 1 : document.querySelector("#characterclass .sprite")?.classList.contains("warrior") ? 2 : 3, this.account.name = document.querySelector('head meta[name="ogame-player-name"]').getAttribute("content"), this.account.rank = document.querySelector('#bar a[href*="searchRelId"]')?.parentNode.innerText.replace(/\D/g, ""), this.account.lang=lang, this.db.serverData = this.db.serverData || {}, this.db.serverData.serverTimeZoneOffsetInMinutes = 0 === unsafeWindow.serverTimeZoneOffsetInMinutes ? 0 : unsafeWindow.serverTimeZoneOffsetInMinutes || this.db.serverData.serverTimeZoneOffsetInMinutes || 0, this.db.serverData.metal = unsafeWindow.loca?.LOCA_ALL_METAL || this.db.serverData.metal || "Metal", this.db.serverData.crystal = unsafeWindow.loca?.LOCA_ALL_CRYSTAL || this.db.serverData.crystal || "Crystal", this.db.serverData.deut = unsafeWindow.loca?.LOCA_ALL_DEUTERIUM || this.db.serverData.deut || "Deut", this.db.serverData.food = unsafeWindow.loca?.LOCA_ALL_FOOD || this.db.serverData.food || "Food", this.db.serverData.dm = unsafeWindow.LocalizationStrings?.darkMatter || this.db.serverData.dm || "Darkmatter", this.db.serverData.energy = unsafeWindow.resourcesBar?.resources?.energy.tooltip.split("|")[0] || this.db.serverData.energy || "Energy", this.db.serverData.conso = unsafeWindow.loca?.LOCA_FLEET_FUEL_CONSUMPTION || this.db.serverData.conso || "Conso", this.db.serverData.noob = unsafeWindow.loca?.LOCA_GALAXY_PLAYER_STATUS_N || this.db.serverData.noob || "n", this.db.serverData.vacation = unsafeWindow.loca?.LOCA_GALAXY_PLAYER_STATUS_U || this.db.serverData.vacation || "v", this.db.serverData.population = "Population", this.db.serverData.item = "Item", this.db.serverData.topScore = this.db.serverData.topScore || 0, this.db.serverData.probeCargo = this.db.serverData.probeCargo || 0, this.db.serverData.debrisFactor = this.db.serverData.debrisFactor || 30, this.db.serverData.probeCargo || (this.fretShips = [202, 203, 209, 219]), this.account.lang == this.db.userLang || "fleetdispatch" == this.page || "intro" == this.page) {
        if ("intro" != this.page && (this.db.userLang = this.account.lang), this.cache = e || {}, window.location.href.indexOf("&relogin=1") > -1 && (this.cache = {}), this.updateJQuerySettings(), "empire" != this.page) {
          if (!this.id || !this.id[0]) {
            let e = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
            GM_setValue("ogl_id", e), this.id
          }
          new PopupManager(this), this.checkDataFormat(), new LangManager(this), new TimeManager(this), new FetchManager(this), this.getPlanetData(), this.getServerData(), new UIManager(this), new ShortcutManager(this), new TopbarManager(this), new FleetManager(this), new TooltipManager(this), new NotificationManager(this), new StatsManager(this), new GalaxyManager(this), new MessageManager(this), new MovementManager(this), new TechManager(this), new JumpgateManager(this), new EmpireManager(this), this.PTRE = new PTRE(this), this.excludeFromObserver = ["OGameClock", "resources_metal", "resources_crystal", "resources_deuterium", "smallplanet", "resources_food", "resources_population", "resources_energy", "resources_darkmatter", "mmoNewsticker", "mmoTickShow", "tempcounter", "counter-eventlist", "js_duration", "ogl_tooltip", "ogl_tooltipTriangle", "ogl_ready", "ogl_addedElement"], Util.observe(document.body, {
            childList: !0,
            subtree: !0,
            attributes: !0
          }, (e => {
            Array.from(e.target.classList).some((e => this.excludeFromObserver.includes(e))) || this.excludeFromObserver.includes(e.target.id) || this.excludeFromObserver.some((t => e.target.id.startsWith(t))) || (e.target.classList.contains("ui-dialog") && e.target.querySelector(".detail_msg") ? Util.runAsync(this._message.checkDialog, this._message) : "stat_list_content" == e.target.getAttribute("id") && document.querySelector("#stat_list_content #ranks") ? (Util.runAsync(this._ui.updateHighscore, this._ui), Util.runAsync(this._ui.updateStatus, this._ui)) : "right" != e.target.id || document.querySelector(".ogl_topbar") || (this.getPlanetData(!0), this._topbar.load(), this._ui.load(!0), this._movement.load(!0), this._topbar.checkUpgrade()))
          }), this);
          let e = `<ul class="ogl_universeInfoTooltip">\n                <li>Economy:<div>x${this.server.economySpeed}</div></li>\n                <li>Debris:<div>${this.db.serverData.debrisFactor}%</div></li>\n                <hr>\n                <li>Peaceful fleets:<div>x${this.server.peacefulFleetSpeed}</div></li>\n                <li>Holding fleets:<div>x${this.server.holdingFleetSpeed}</div></li>\n                <li>War fleets:<div>x${this.server.warFleetSpeed}</div></li>\n            </ul>`;
          (document.querySelector("#pageReloader") || document.querySelector("#logoLink")).classList.add("tooltipBottom"), (document.querySelector("#pageReloader") || document.querySelector("#logoLink")).setAttribute("title", e), document.querySelector("#pageContent").appendChild(Util.addDom("div", {
            class: "ogl_universeName",
            child: `${this.server.name}.${this.server.lang}`
          })), this.checkPTRECompatibility()
        }
        else this._fleet = new FleetManager(this), this._empire = new EmpireManager(this);
        window.addEventListener("beforeunload", (() => {
          this.save()
        }))
      }
    else window.location.href = `?page=ingame&component=fleetdispatch`
  }
  load(e) {
    return "string" == typeof (e = e || GM_getValue(this.DBName) || {}) ? JSON.parse(e) : e
  }
  save(e, t) {
    try {
      e && "object" == typeof e && (this.db = e), GM_saveTab({
        cache: this.cache
      }), GM_setValue(this.DBName, JSON.stringify(this.db))
    }
    catch (e) {
      this.readyToUnload = !0
    }
  }
  getServerData() {
    (!this.db.serverData.topScore || Date.now() > this.db.lastServerUpdate + 36e5) && this._fetch.pending.push({
      url:`${PROTOCOL}//${HOST}/api/s${universeNum}/${lang}/serverData.xml`,
      callback: e => {
        let t = (new DOMParser).parseFromString(e, "text/html");
        this.db.serverData.topScore = parseInt(Number(t.querySelector("topscore").innerText)), this.db.serverData.probeCargo = parseInt(t.querySelector("probeCargo").innerText), this.db.serverData.debrisFactor = 100 * parseFloat(t.querySelector("debrisFactor").innerText), this.db.serverData.researchSpeed = parseInt(t.querySelector("researchDurationDivisor").innerText), this.db.lastServerUpdate = Date.now()
      }
    })
  }
  getPlanetData() {
    const e = document.querySelector('head meta[name="ogame-planet-id"]').getAttribute("content");
    this.currentPlanet = {}, this.currentPlanet.dom = {}, this.currentPlanet.dom.element = document.querySelector(".smallplanet .active"), this.currentPlanet.dom.list = Array.from(document.querySelectorAll(".smallplanet")), this.currentPlanet.dom.activeIndex = Array.from(this.currentPlanet.dom.list).findIndex((e => e.querySelector(".active"))), this.currentPlanet.dom.prevWithMoon = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex, !0).find((e => e.querySelector(".moonlink"))), this.currentPlanet.dom.nextWithMoon = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex + 1).find((e => e.querySelector(".moonlink"))), this.currentPlanet.dom.nextNextWithMoon = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex + 1)[1], this.currentPlanet.dom.prev = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex, !0)[0], this.currentPlanet.dom.next = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex + 1)[0], this.currentPlanet.dom.nextNext = Util.reorderArray(this.currentPlanet.dom.list, this.currentPlanet.dom.activeIndex + 1)[1];
    const t = !!this.db.myPlanets?.[e];
    (!this.db.lastLFBonusUpdate || Date.now() > this.db.lastLFBonusUpdate + 24e4 && "fleetdispatch" != this.page) && setTimeout((() => this._fetch.fetchLFBonuses()), t ? 2e4 : 0), (!this.db.lastEmpireUpdate || Date.now() > this.db.lastEmpireUpdate + 18e4 && "fleetdispatch" != this.page) && setTimeout((() => this._fetch.fetchEmpire()), t ? 1e4 : 0), (!this.db.lastProductionQueueUpdate || Date.now() > this.db.lastProductionQueueUpdate + 3e4 && "fleetdispatch" != this.page) && setTimeout((() => this._fetch.fetchProductionQueue()), t ? 5e3 : 0), this.db.myPlanets[e] = this.db.myPlanets[e] || {}, this.currentPlanet.obj = this.db.myPlanets[e], this.currentPlanet.obj.type = document.querySelector('head meta[name="ogame-planet-type"]').getAttribute("content"), this.currentPlanet.obj.metal = Math.floor(resourcesBar.resources.metal?.amount || 0), this.currentPlanet.obj.crystal = Math.floor(resourcesBar.resources.crystal?.amount || 0), this.currentPlanet.obj.deut = Math.floor(resourcesBar.resources.deuterium?.amount || 0), this.currentPlanet.obj.energy = Math.floor(resourcesBar.resources.energy?.amount || 0), this.currentPlanet.obj.food = Math.floor(resourcesBar.resources.food?.amount || 0), this.currentPlanet.obj.population = Math.floor(resourcesBar.resources.population?.amount || 0), this.currentPlanet.obj.lifeform = document.querySelector("#lifeform .lifeform-item-icon")?.className.replace(/\D/g, ""), this.currentPlanet.obj.lastRefresh = this._time.serverTime, ["metal", "crystal", "deut"].forEach((e => {
      let t = resourcesBar.resources[e.replace("deut", "deuterium")].production;
      t > 0 && (this.currentPlanet.obj[`prod${e}`] = t);
      const n = document.querySelector(`#${e.replace("deut","deuterium")}_box`);
      if ("moon" == this.currentPlanet.obj.type || n.querySelector(".ogl_resourceBoxStorage")) return;
      t *= 3600;
      const o = this.currentPlanet.obj[`${e}Storage`],
        a = t > 0 ? Math.floor((o - this.currentPlanet.obj[e]) / t) || 0 : 1 / 0,
        i = Math.max(0, Math.floor(a / 24)),
        r = Math.max(0, Math.floor(a % 24));
      let l = i > 365 ? `> 365${LocalizationStrings.timeunits.short.day}` : `${i}${LocalizationStrings.timeunits.short.day} ${r}${LocalizationStrings.timeunits.short.hour}`;
      Util.addDom("div", {
        class: "ogl_resourceBoxStorage",
        child: l,
        parent: n
      })
    })), document.querySelectorAll(".planetlink, .moonlink").forEach((e => {
      const t = new URLSearchParams(e.getAttribute("href")).get("cp").split("#")[0];
      this.db.myPlanets[t] = this.db.myPlanets[t] || {}, ["metal", "crystal", "deut"].forEach((n => {
        let o = this.db.myPlanets[t]?.[n] || 0,
          a = this.db.myPlanets[t]?.[n + "Storage"] || 0,
          i = e.querySelector(".ogl_available") || Util.addDom("span", {
            class: "ogl_available",
            parent: e
          });
        Util.addDom("span", {
          class: "ogl_" + n,
          parent: i,
          child: Util.formatToUnits(o, 0)
        });
        const r = e.querySelector(".ogl_available .ogl_" + n);
        r.innerHTML = Util.formatToUnits(o, 1), o >= a && e.classList.contains("planetlink") ? r.classList.add("ogl_danger") : o >= .9 * a && e.classList.contains("planetlink") ? r.classList.add("ogl_warning") : (r.classList.remove("ogl_warning"), r.classList.remove("ogl_danger"))
      })), this.addRefreshTimer(t, e), this.db.options.displayPlanetTimers || document.querySelector("#planetList").classList.add("ogl_alt"), this.cache.toSend && 3 !== this.mode && delete this.cache.toSend, e.classList.contains("planetlink") ? (e.classList.add("tooltipLeft"), e.classList.remove("tooltipRight"), e.querySelector(".planet-koords").innerHTML = `<span class="ogl_hidden">[</span>${e.querySelector(".planet-koords").textContent.slice(1,-1)}<span class="ogl_hidden">]</span>`) : (e.classList.add("tooltipRight"), e.classList.remove("tooltipLeft"))
    }))
  }
  addRefreshTimer(e, t) {
    let n = Util.addDom("div", {
        class: "ogl_refreshTimer",
        parent: t
      }),
      o = () => {
        let t = serverTime.getTime() - (this.db.myPlanets[e]?.lastRefresh || 1);
        t = Math.min(Math.floor(t / 6e4), 60), n.innerText = t.toString(), n.style.color = t > 30 ? "#ef7676" : t > 15 ? "#d99c5d" : "#67ad7d"
      };
    o(), setInterval((() => o()), 6e4)
  }
  updateJQuerySettings() {
    const e = this;
    $(document).on("ajaxSend", (function (t, n, o) {
      if (o.url.indexOf("page=messages&tab=") >= 0) {
        20 != new URLSearchParams(o.url).get("tab") && e._message.spytable && e._message.spytable.classList.add("ogl_hidden")
      }
    })), $(document).on("ajaxSuccess", (function (t, n, o) {
      if (o.url.indexOf("action=getMessagesList") >= 0) {
        const t = parseInt(new URLSearchParams(o.data).get("activeSubTab")) || -1;
        e._message.tabID = t, e._message.check()
      }
      else if (o.url.indexOf("page=messages") >= 0) {
        if (o.data?.indexOf("messageId=-1") >= 0 && (e._message.check(), 20 == ogame.messages.getCurrentMessageTab() && e._message.spytable?.querySelector(".curPage"))) {
          const t = new URLSearchParams(o.data).get("pagination") || 0,
            n = e._message.spytable?.querySelector(".curPage").innerText.split("/");
          e._message.spytable.querySelector(".curPage").innerText = `${t}/${n[1]}`
        }
      }
      else o.url.indexOf("action=fetchGalaxyContent") >= 0 ? e._galaxy.check(JSON.parse(n.responseText)) : o.url.indexOf("action=checkTarget") >= 0 && document.querySelector("#planetList").classList.remove("ogl_notReady")
    })), $.ajaxSetup({
      beforeSend: function (t) {
        this.url.indexOf("action=checkTarget") >= 0 && !e?._fleet?.firstLoadCancelled ? window.fleetDispatcher && (fleetDispatcher.fetchTargetPlayerDataTimeout = null, e._fleet.firstLoadCancelled = !0, t.abort()) : this.url.indexOf("action=fetchGalaxyContent") >= 0 && (e._galaxy.xhr && e._galaxy.xhr.abort(), e._galaxy.xhr = t)
      }
    })
  }
  checkPTRECompatibility() {
    if (serverTime.getTime() > this.id[1] + 864e5) {
      let e = {
        ogl_id: this.id[0] || "-",
        version: this.version || "-",
        script_name: GM_info.script.name || "-",
        script_namespace: GM_info.script.downloadURL || "-"
      };
      this.PTRE.postPTRECompatibility(e)
    }
  }
  createPlayer(e) {
    return this.db.udb[e] = {
      uid: parseInt(e)
    }, this.db.udb[e]
  }
  removeOldPlanetOwner(e, t) {
    Object.values(this.db.udb).filter((t => t.planets?.indexOf(e) > -1)).forEach((n => {
      if (n.uid != t) {
        const t = this.db.udb[n.uid].planets.indexOf(e);
        this.db.udb[n.uid].planets.splice(t, 1), this.db.udb[n.uid].planets.length < 1 && delete this.db.udb[n.uid], this.db.udb[n.uid] && document.querySelector(".ogl_side.ogl_active") && this.db.currentSide == n.uid && document.querySelector(".ogl_side.ogl_active") && this.db.currentSide == n.uid && this._topbar.openPinnedDetail(n.uid)
      }
    }))
  }
  checkDataFormat() {
    if (this.db.dataFormat < 10) {
      let e = `ogl_test_${this.server.id}-${this.server.lang}_${this.account.id}`,
        t = JSON.parse(GM_getValue(e) || "{}");
      (t.pinnedList?.length > 0 || t.positions?.length > 0) && confirm("Do you want to import v4 pinned targets ?") ? (this._popup.open(Util.addDom("div", {
        child: '<div>importing v4 targets, please wait...</div><hr><div class="ogl_loading"></div>'
      })), t.pinnedList.forEach((e => {
        this.db.lastPinnedList = Array.from(new Set([e, ...this.db.lastPinnedList]))
      })), this.db.lastPinnedList.length > 30 && (this.db.lastPinnedList.length = 30), t.positions.filter((e => e.color)).forEach((e => {
        this.db.tdb[e.rawCoords] = {
          tag: e.color.replace("half", "")
        }
      })), this.db.dataFormat = 10, this._popup.close(), window.location.reload()) : this.db.dataFormat = 10
    }
    this.db.dataFormat < 12 && (document.querySelectorAll(".planetlink, .moonlink").forEach((e => {
      const t = new URLSearchParams(e.getAttribute("href")).get("cp").split("#")[0];
      this.db.myPlanets[t] && delete this.db.myPlanets[t].todolist
    })), this.cache && delete this.cache.toSend, this.db.dataFormat = 12), this.db.dataFormat < 14 && (this.db.initialTime = Date.now(), this.db.stats = {}, this.cache.raid = {}, this.db.dataFormat = 14), this.db.dataFormat < 15 && (Object.entries(this.db.stats || {}).forEach((e => {
      if (e[0].indexOf("-") > -1) return;
      const t = parseInt(e[0]),
        n = e[1],
        o = new Date(t),
        a = `${o.getFullYear()}-${o.getMonth()}-${o.getDate()}`;
      this.db.stats[a] || (this.db.stats[a] = n, delete this.db.stats[t])
    })), this.db.dataFormat = 15), this.db.dataFormat < 16 && (Object.entries(this.db.stats || {}).forEach((e => {
      const t = e[0].split("-");
      let n = parseInt(t[1]) + 1,
        o = parseInt(t[0]);
      n > 12 && (n = 1, o++);
      const a = e[1],
        i = `${o}-${n}-${t[2]}`;
      delete this.db.stats[t.join("-")], this.db.stats[i] = a
    })), this.db.dataFormat = 16), this.db.dataFormat < 17 && (this.db.options.msu = "3:2:1", this.db.dataFormat = 17)
  }
  calcExpeditionMax() {
    const e = [{
        topScore: 1e4,
        base: 10,
        max: 4e4
      }, {
        topScore: 1e5,
        base: 125,
        max: 5e5
      }, {
        topScore: 1e6,
        base: 300,
        max: 12e5
      }, {
        topScore: 5e6,
        base: 450,
        max: 18e5
      }, {
        topScore: 25e6,
        base: 600,
        max: 24e5
      }, {
        topScore: 5e7,
        base: 750,
        max: 3e6
      }, {
        topScore: 75e6,
        base: 900,
        max: 36e5
      }, {
        topScore: 1e8,
        base: 1050,
        max: 42e5
      }, {
        topScore: 1 / 0,
        base: 1250,
        max: 5e6
      }].find((e => e.topScore >= this.db.serverData.topScore)),
      t = 3 == this.account.class ? 3 * e.max * this.server.economySpeed : 2 * e.max,
      n = this.db.options.expeditionValue || t * (1 + (this.db.lfBonuses?.Characterclasses3?.bonus || 0) / 100) * (1 + (this.db.lfBonuses?.ResourcesExpedition?.bonus || 0) / 100);
    return {
      max: Math.round(n),
      treshold: e
    }
  }
}
GM_getTab((e => unsafeWindow.ogl = new OGLight(e)));
class Manager {
  constructor(e) {
    this.ogl = e, this.ogl["_" + this.constructor.name.toLowerCase().replace("manager", "")] = this, this.load()
  }
}
class LangManager extends Manager {
  load() {
    this.raw = {
      metal: "Metal",
      crystal: "Crystal",
      deut: "Deuterium",
      artefact: "Artefact",
      dm: "Dark Matter",
      202: "Small Cargo",
      203: "Large Cargo",
      204: "Light Fighter",
      205: "Heavy Fighter",
      206: "Cruiser",
      207: "Battleship",
      208: "Colony Ship",
      209: "Recycler",
      210: "Espionage Probe",
      211: "Bomber",
      212: "Solar Satellite",
      213: "Destroyer",
      214: "Deathstar",
      215: "Battlecruiser",
      216: "Trade Ship",
      217: "Crawler",
      218: "Reaper",
      219: "Pathfinder",
      220: "Trade Ship"
    }, this.en = {
      ship: "Ships",
      item: "Item",
      other: "Other",
      resource: "Resources",
      battle: "Battle",
      blackhole: "Black hole",
      early: "Early",
      late: "Late",
      trader: "Trader",
      nothing: "Nothing",
      pirate: "Pirates",
      alien: "Aliens",
      duration: "Duration",
      defaultShip: "Default ship type",
      defaultMission: "Default mission type",
      useClientTime: "Use client time",
      displayMiniStats: "Stats range",
      displaySpyTable: "Display spy table",
      displayPlanetTimers: "Display planets timer",
      disablePlanetTooltips: "Disable planets menu tooltips",
      showMenuResources: "Planets menu layout",
      reduceLargeImages: "Fold large images",
      ignoreExpeShips: "Ignore ships found in expeditions",
      ignoreExpeShipsLoss: "Ignore ships lost in expeditions",
      ignoreConsumption: "Ignore fleet consumption",
      resourceTreshold: "Resource treshold",
      tooltipDelay: "Tooltip delay (ms)",
      galaxyUp: "Next galaxy",
      galaxyDown: "Previous galaxy",
      galaxyLeft: "Previous system",
      galaxyRight: "Next system",
      previousPlanet: "Previous planet",
      nextPlanet: "Next planet",
      nextPinnedPosition: "Next pinned position",
      fleetRepeat: "Repeat last fleet",
      fleetSelectAll: "<div>Select all ships (fleet1)<hr>Select all resources (fleet2)</div>",
      expeditionSC: "Small cargo expedition",
      expeditionLC: "Large cargo expedition",
      expeditionPF: "Pathfinder expedition",
      galaxySpySystem: "System spy",
      collectLinked: "Collect to linked planet/moon",
      keyboardActions: "Keyboard settings",
      expeditionValue: "Expedition value",
      expeditionValueTT: "The custom value aimed by your expeditions.<br> Set it to <b>0</b> to use the default calculated value",
      expeditionBigShips: "Allowed biggest ships",
      expeditionRandomSystem: "Random system",
      expeditionShipRatio: "Ships found value (%)",
      fleetLimiter: "Fleet limiter",
      fleetLimiterTT: "Chose the amount of ships / resources to keep on your planets",
      menu: "Toggle OGLight menu",
      quickRaid: "Quick raid",
      attackNext: "Attack next planet",
      autoCleanReports: "Auto clean reports",
      noCurrentPin: "Error, no target pinned",
      backFirstFleet: "Back first fleet",
      backLastFleet: "Back last fleet sent",
      fleetReverseAll: "Reverse selection",
      fleetResourcesSplit: "Split ships/resources",
      manageData: "Manage OGLight data",
      profileButton: "Profile limiters",
      limiters: "Limiters",
      expeditionRedirect: "Redirect to the next planet/moon",
      playerProfile: "Player profile",
      topReportDetails: "Top report details",
      reportFound: "Top report",
      discovery: "Send a discovery",
      collectResources: "Collect resources",
      accountSummary: "Account summary",
      stats: "Stats",
      taggedPlanets: "Tagged planets",
      pinnedPlayers: "Pinned players",
      oglSettings: "OGLight settings",
      coffee: "Buy me a coffee",
      syncEmpire: "Sync empire data",
      repeatQueue: "Repeat the amount above in a new queue X time.<br>This operation can take a while",
      spyPlanet: "Spy this planet",
      spyMoon: "Spy this moon",
      resourceLimiter: "Substract the amount of resources defined in your profile limiter",
      fleetLimiter: "Substract the amount of ships defined in your profile limiter",
      forceKeepCapacity: "Keep enough capacity on you planet to move your resources (has priority over limiters)",
      forceIgnoreFood: "Ignore food (has priority over limiters)",
      resetStats: "Reset stats",
      resetTaggedPlanets: "Reset tagged planets",
      resetPinnedPlayers: "Reset pinned players",
      resetAll: "Reset all data",
      resetStatsLong: "Do you really want to reset OGLight stats data ?",
      resetTaggedPlanetsLong: "Do you really want to reset OGLight tagged planets data ?",
      resetPinnedPlayersLong: "Do you really want to reset OGLight pinned players data ?",
      resetAllLong: "Do you really want to reset all OGLight data ?",
      reportBlackhole: "Report a black hole",
      reportBlackholeLong: "Do you really want to add this black hole ?",
      emptyPlayerList: "There is no player in this list",
      debugMode: "Debug mode",
      sim: "Battle sim",
      converter: "Battle converter",
      siblingPlanetMoon: "Sibling planet / moon",
      oglMessageDone: "This message has been red by OGLight",
      boardTab: "Display board news",
      msu: "Metal standard unit",
      notifyNoProbe: "Feature disabled :(",
      shortcutsOnRight: "Display shortcuts under the planet menu",
      ptreTeamKey: "Team key",
      ptreLogs: "Display PTRE errors",
      ptreActivityImported: "activity imported to PTRE",
      ptreActivityAlreadyImported: "activity already imported to PTRE",
      ptreSyncTarget: "Sync with PTRE",
      ptreManageTarget: "Manage on PTRE"
    }, this.fr = {
      ship: "Vaisseaux",
      item: "Item",
      other: "Autre",
      resource: "Ressources",
      battle: "Combat",
      blackhole: "Trou noir",
      early: "Avance",
      late: "Retard",
      trader: "Marchand",
      nothing: "Rien",
      pirate: "Pirates",
      alien: "Aliens",
      duration: "Durée",
      defaultShip: "Type de vaisseau par défaut",
      defaultMission: "Type de mission par défaut",
      useClientTime: "Utiliser l'heure du client",
      displayMiniStats: "Fourchette",
      displaySpyTable: "Afficher le tableau d'espio",
      displayPlanetTimers: "Afficher les timers des planètes",
      disablePlanetTooltips: "Cacher les tooltips du menu des planètes",
      showMenuResources: "Affichage du menu des planètes",
      reduceLargeImages: "Réduire les grandes images",
      ignoreExpeShips: "Ignorer les vaisseaux trouvés en expédition",
      ignoreExpeShipsLoss: "Ignorer les vaisseaux perdus en expédition",
      ignoreConsumption: "Ignorer la consommation des flottes",
      resourceTreshold: "Seuil de ressources",
      tooltipDelay: "Délai des tooltips (ms)",
      galaxyUp: "Galaxie suivante",
      galaxyDown: "Galaxie précédente",
      galaxyLeft: "Système précédent",
      galaxyRight: "Système suivant",
      previousPlanet: "Planète précédente",
      nextPlanet: "Planète suivante",
      nextPinnedPosition: "Position épinglée suivante",
      fleetRepeat: "Répéter la dernière flotte",
      fleetSelectAll: "<div>Selectionner tous les vaisseaux (fleet1)<hr>Selectionner toutes les ressources (fleet2)</div>",
      expeditionSC: "Expédition au petit transporteur",
      expeditionLC: "Expédition au grand transporteur",
      expeditionPF: "Expédition à l'éclaireur",
      galaxySpySystem: "Espionnage du système",
      collectLinked: "Rapatrier vers les planètes/lunes liée",
      keyboardActions: "Raccourcis clavier",
      expeditionValue: "Valeur max. expédition",
      expeditionValueTT: "La valeur visée par les expédition.<br> Laisser à <b>0</b> pour utiliser la valeur calculée par OGLight",
      expeditionBigShips: "Gros vaisseaux autorisés",
      expeditionRandomSystem: "Système aléatoire",
      expeditionShipRatio: "Valeur vaisseaux trouvés (%)",
      fleetLimiter: "Limiteur de flotte",
      fleetLimiterTT: "Choisir le nombre de vaisseau et la quantité de ressources à garder sur les planètes/lunes",
      menu: "Afficher/masquer le menu OGLight",
      quickRaid: "Raid rapide",
      attackNext: "Attaquer la planète suivante",
      autoCleanReports: "Nettoyage automatique des rapports",
      noCurrentPin: "Pas de cible épinglée actuellement",
      backFirstFleet: "Rappeler la prochaine flotte",
      backLastFleet: "Rappeler la dernière flotte envoyée",
      fleetReverseAll: "Inverser la sélection",
      fleetResourcesSplit: "Diviser les vaisseaux/ressources",
      manageData: "Gestion des données OGLight",
      profileButton: "Configuration des limiteurs",
      limiters: "Limiteurs",
      expeditionRedirect: "Rediriger vers la planète/lune suivante",
      playerProfile: "Profil du joueur",
      topReportDetails: "Détails du meilleur rapport",
      reportFound: "Meilleur rapport",
      discovery: "Envoyer une exploration",
      collectResources: "Rapatrier les ressources",
      accountSummary: "Résumé du compte",
      stats: "Statistiques",
      taggedPlanets: "Planètes marquées",
      pinnedPlayers: "Joueurs épinglés",
      oglSettings: "Configuration d'OGLight",
      coffee: "Buy me a coffee",
      syncEmpire: "Synchroniser les données de l'empire",
      repeatQueue: "Répéter le nombre ci-dessus dans une nouvelle file X fois.<br>Cette opération peut prendre un moment",
      spyPlanet: "Espionner cette planète",
      spyMoon: "Espionner cette lune",
      resourceLimiter: "Soustraire le montant de ressources indiqué dans le limiteur",
      fleetLimiter: "Soustraire le nombre de vaisseaux indiqué dans le limiteur",
      forceKeepCapacity: "Garder assez de capacité sur la planète pour bouger les ressources (a la priorité sur le limiteur)",
      forceIgnoreFood: "Ignorer la nourriture (a la priorité sur le limiteur)",
      resetStats: "Réinitialiser stats",
      resetTaggedPlanets: "Réinitialiser les planètes marquées",
      resetPinnedPlayers: "Réinitialiser les joueurs épinglés",
      resetAll: "Réinitialiser toutes les données OGLight",
      resetStatsLong: "Voulez-vous vraiment réinitialiser les stats ?",
      resetTaggedPlanetsLong: "Voulez-vous vraiment réinitialiser les planètes marquées ?",
      resetPinnedPlayersLong: "Voulez-vous vraiment réinitialiser les joueurs épinglés ?",
      resetAllLong: "Voulez-vous vraiment réinitialiser toutes les données OGLight ?",
      reportBlackhole: "Signaler un trou noir",
      reportBlackholeLong: "Voulez vous vraiment ajouter ce trou noir ?",
      emptyPlayerList: "Cette liste de joueurs est vide",
      debugMode: "Mode debug",
      sim: "Simulateur de combat",
      converter: "Convertisseur de combat",
      siblingPlanetMoon: "Planète / lune liée",
      oglMessageDone: "Ce message a été traité par OGLight",
      boardTab: "Afficher les annonces du board",
      msu: "Metal standard unit",
      notifyNoProbe: "Fonctionnalité desactivée :(",
      shortcutsOnRight: "Raccourcis sous le menu des planètes",
      ptreTeamKey: "Team key",
      ptreLogs: "Afficher les erreurs PTRE",
      ptreActivityImported: "Activité importée dans PTRE",
      ptreActivityAlreadyImported: "Activité déjà importée dans PTRE",
      ptreSyncTarget: "Synchroniser avec PTRE",
      ptreManageTarget: "Gérer sur PTRE"
    }
  }
  find(e, t) {
    return "darkmatter" == e && (e = "dm"), t && this.raw[e] ? this.raw[e] : this[this.ogl.account.lang] && this[this.ogl.account.lang][e] ? this[this.ogl.account.lang][e] : this.ogl.db.serverData[e] ? this.ogl.db.serverData[e] : this.en[e] ? this.en[e] : "TEXT_NOT_FOUND"
  }
}
class TimeManager extends Manager {
  load() {
    if (this.units = LocalizationStrings.timeunits.short, this.serverTimeZoneOffset = 6e4 * this.ogl.db.serverData.serverTimeZoneOffsetInMinutes, this.clientTimeZoneOffset = 6e4 * serverTime.getTimezoneOffset(), this.UTC = serverTime.getTime() + this.serverTimeZoneOffset, this.serverTime = serverTime.getTime(), this.clientTime = this.UTC - this.clientTimeZoneOffset, this.observeList = [".OGameClock", ".ogl_backTimer", ".ogl_backWrapper"], this.updateList = [".OGameClock", ".arrivalTime", ".absTime", ".nextabsTime", ".ui-dialog .msg_date"], this.productionBoxes = {
        restTimebuilding: "productionboxbuildingcomponent",
        restTimeresearch: "productionboxresearchcomponent",
        restTimeship2: "productionboxshipyardcomponent",
        restTimelfbuilding: "productionboxlfbuildingcomponent",
        restTimelfresearch: "productionboxlfresearchcomponent",
        mecha: "productionboxextendedshipyardcomponent"
      }, "fleetdispatch" == this.ogl.page) {
      let e, t, n = 0;
      document.querySelectorAll("#fleet2 #arrivalTime, #fleet2 #returnTime").forEach(((n, o) => {
        0 == o ? e = Util.addDom("div", {
          class: "ogl_missionTime",
          parent: n.parentNode,
          child: "loading..."
        }) : t = Util.addDom("div", {
          class: "ogl_missionTime",
          parent: n.parentNode,
          child: "loading..."
        }), n.remove()
      })), this.timeLoop = o => {
        const a = serverTime.getTime();
        if (unsafeWindow.fleetDispatcher && (a != n || o)) {
          const o = 1e3 * (fleetDispatcher.getDuration() || 0),
            i = this.ogl.db.options.useClientTime ? this.clientTimeZoneOffset : this.serverTimeZoneOffset,
            r = a + o + this.serverTimeZoneOffset,
            l = 15 == fleetDispatcher.mission ? a + 2 * o + this.serverTimeZoneOffset + 36e5 * fleetDispatcher.expeditionTime : 5 == fleetDispatcher.mission ? a + 2 * o + this.serverTimeZoneOffset + 36e5 * fleetDispatcher.holdingTime : a + 2 * o + this.serverTimeZoneOffset,
            s = new Date(r - i),
            d = new Date(l - i);
          e.setAttribute("data-output-date", s.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })), e.setAttribute("data-output-time", s.toLocaleTimeString("de-DE")), t.setAttribute("data-output-date", d.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })), t.setAttribute("data-output-time", d.toLocaleTimeString("de-DE")), n = a
        }
        o || requestAnimationFrame((() => this.timeLoop()))
      }, this.timeLoop()
    }
    const e = (performance.timing.responseEnd - performance.timing.requestStart) / 1e3;
    let t = Util.addDom("li", {
      class: "ogl_ping",
      child: `${e} s`,
      parent: document.querySelector("#bar ul")
    });
    e >= 2 ? t.classList.add("ogl_danger") : e >= 1 && t.classList.add("ogl_warning"), Util.runAsync(this.update, this), Util.runAsync(this.observe, this)
  }
  update(e, t) {
    (e = e || this).updateList.forEach((n => {
      (t ? [t] : document.querySelectorAll(`${n}:not(.ogl_updated)`)).forEach((t => {
        t.classList.add("ogl_updated");
        const n = e.ogl.db.options.useClientTime ? e.clientTimeZoneOffset : e.serverTimeZoneOffset,
          o = e.dateStringToTime(t.innerText) + e.serverTimeZoneOffset,
          a = new Date(o - n);
        t.innerText.split(/\.|:| /).length > 5 && (t.setAttribute("data-output-date", a.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        })), t.setAttribute("data-time-utc", o), t.setAttribute("data-time-server", o - e.serverTimeZoneOffset), t.setAttribute("data-time-client", o - e.clientTimeZoneOffset)), t.setAttribute("data-output-time", a.toLocaleTimeString("de-DE"))
      }))
    }))
  }
  observe(e) {
    (e = e || this).observeList.forEach((t => {
      document.querySelectorAll(`${t}:not(.ogl_observed)`).forEach((t => {
        t.classList.add("ogl_observed");
        let n = () => {
          const n = e.ogl.db.options.useClientTime ? e.clientTimeZoneOffset : e.serverTimeZoneOffset,
            o = e.dateStringToTime(t.textContent) + e.serverTimeZoneOffset,
            a = new Date(o - n);
          t.setAttribute("data-output-date", a.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })), t.setAttribute("data-output-time", a.toLocaleTimeString("de-DE")), t.setAttribute("data-time-utc", o), t.setAttribute("data-time-server", o - e.serverTimeZoneOffset), t.setAttribute("data-time-client", o - e.clientTimeZoneOffset)
        };
        n(), Util.observe(t, {
          childList: !0
        }, n)
      }))
    }))
  }
  getClientTime(e) {
    let t, n, o;
    return e ? (t = e + this.serverTimeZoneOffset, n = e, o = t - this.clientTimeZoneOffset) : (t = serverTime.getTime() + this.serverTimeZoneOffset, n = serverTime.getTime(), o = t - this.clientTimeZoneOffset), o
  }
  clientToServer(e) {
    return this.clientToUTC(e) - this.serverTimeZoneOffset
  }
  clientToUTC(e) {
    return e + 6e4 * new Date(e).getTimezoneOffset()
  }
  serverToUTC(e) {
    return e + this.serverTimeZoneOffset
  }
  serverToClient(e) {
    return e - this.serverTimeZoneOffset + 6e4 * new Date(e).getTimezoneOffset()
  }
  convertTimestampToDate(e, t) {
    const n = this.ogl.db.options.useClientTime ? this.clientTimeZoneOffset : this.serverTimeZoneOffset,
      o = e + this.serverTimeZoneOffset,
      a = new Date(o - n);
    let i = Util.addDom("time", {
      child: a.toLocaleTimeString("de-DE")
    });
    return t && (i = Util.addDom("time", {
      child: `${a.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})} ${a.toLocaleTimeString("de-DE")}`
    })), i
  }
  updateMovements() {
    const e = new Date;
    document.querySelectorAll("[data-mission-type]").forEach((t => {
      if (t.querySelector(".ogl_backTimer")) return;
      const n = t.querySelector(".reversal_time a");
      if (!n) return;
      const o = Util.addDom("div", {
        class: "ogl_backTimer ogl_button",
        parent: t.querySelector(".ogl_resourcesBlock"),
        onclick: () => n.click()
      });
      let a = n.getAttribute("data-title") || n.getAttribute("title");
      if (!a) return;
      a = a.replace("<br>", " "), a = a.replace(/ \.$/, ""), a = a.trim().replace(/[ \.]/g, ":"), a = a.split(":"), a = new Date(`${a[4]}-${a[3]}-${a[2]}T${a[5]}:${a[6]}:${a[7]}`).getTime() - this.serverTimeZoneOffset + this.clientTimeZoneOffset, this.updateBackTimer(e, a, o);
      const i = Util.addDom("div");
      Util.addDom("div", {
        class: "ogl_backWrapper",
        parent: i,
        child: o.innerText
      }), n.addEventListener("tooltip", (() => this.ogl._tooltip.update(i))), setInterval((() => this.updateBackTimer(e, a, o)), 500)
    }))
  }
  updateBackTimer(e, t, n) {
    const o = new Date - e,
      a = new Date(t + timeDelta - 1e5 * Math.round(timeDiff / 1e5) + 2 * o);
    n.innerText = `${a.toLocaleDateString("de-DE")} ${a.toLocaleTimeString("de-DE")}`
  }
  dateStringToTime(e) {
    return (e = e.split(/\.|:| /)).length <= 5 && (e = ["01", "01", "2000"].concat(e)), 2 == (e = e.map((e => e.padStart(2, "0"))))[2].length && (e[2] = "20" + e[2]), new Date(`${e[2]}-${e[1]}-${e[0]}T${e[3]}:${e[4]}:${e[5]}`).getTime()
  }
  timeToHMS(e) {
    return new Date(e).toISOString().slice(11, 19)
  }
}
class FetchManager extends Manager {
  load() {
    this.fetched = {
      empire0: 1,
      empire1: 1,
      lf: 1,
      prod: 1
    }, this.apiCooldown = 6048e5, this.pending = [], setInterval((() => this.resolve()), 500)
  }
  resolve() {
    if (this.pending.length < 1) return;
    let e = this.pending.splice(0, 7);
    Promise.all(e.map((e => fetch(e.url).then((e => e.text())).then((t => ({
      result: t,
      callback: e.callback
    })))))).then((e => {
      e.forEach((e => {
        e.callback(e.result)
      }))
    }))
  }
  fetchEmpire() {
    this.ogl._topbar.syncBtn.classList.add("ogl_active"), this.fetched.empire0 = 0, this.fetched.empire1 = 0;
    for (let e = 0; e <= 1; e++) fetch(`?page=ajax&component=empire&ajax=1&planetType=${e}&asJson=1`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    }).then((e => e.json())).then((t => {
      this.ogl._empire.update(JSON.parse(t.mergedArray), e), this.ogl.save(), this.fetched["empire" + e] = 1, Object.values(this.fetched).indexOf(0) < 0 && this.ogl._topbar.syncBtn.classList.remove("ogl_active")
    }))
  }
  fetchLFBonuses() {
    this.ogl._topbar.syncBtn.classList.add("ogl_active"), this.fetched.lf = 0, fetch(`?page=ajax&component=lfbonuses`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    }).then((e => e.text())).then((e => {
      let t = (new DOMParser).parseFromString(e, "text/html");
      this.ogl._empire.getLFBonuses(t), this.ogl.db.lastLFBonusUpdate = Date.now(), this.fetched.lf = 1, Object.values(this.fetched).indexOf(0) < 0 && this.ogl._topbar.syncBtn.classList.remove("ogl_active")
    }))
  }
  fetchProductionQueue() {
    this.ogl._topbar.syncBtn.classList.add("ogl_active"), this.fetched.prod = 1, fetch(`?page=ajax&component=productionqueue&ajax=1`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    }).then((e => e.text())).then((e => {
      let t = (new DOMParser).parseFromString(e, "text/html");
      document.querySelectorAll(".planetlink, .moonlink").forEach((e => {
        const n = new URLSearchParams(e.getAttribute("href")).get("cp").split("#")[0],
          o = {
            baseBuilding: t.querySelector(`time.building${n}`),
            ship: t.querySelector(`time.ship${n}`),
            lfBuilding: t.querySelector(`time.lfbuilding${n}`),
            lfResearch: t.querySelector(`time.lfresearch${n}`),
            mechaShip: t.querySelector(`time.ship_2nd${n}`)
          };
        this.ogl.db.myPlanets[n].upgrades = this.ogl.db.myPlanets[n].upgrades || {};
        for (let [e] of Object.entries(o))
          if (o[e]) {
            const t = o[e].closest(".productionDetails")?.querySelector(".productionLevel")?.innerText?.replace(/\D/g, "") || "0",
              a = {};
            a.name = o[e].closest(".productionDetails").querySelector(".productionName").childNodes[0].textContent, a.lvl = parseInt(t), a.end = 1e3 * parseInt(o[e].getAttribute("data-end")), a.type = e, this.ogl.db.myPlanets[n].upgrades[e] = [a]
          }
        else this.ogl.db.myPlanets[n].upgrades[e] = []
      })), this.ogl._topbar.checkUpgrade(), this.ogl.db.lastProductionQueueUpdate = Date.now(), this.fetched.prod = 1, Object.values(this.fetched).indexOf(0) < 0 && this.ogl._topbar.syncBtn.classList.remove("ogl_active")
    }))
  }
  fetchPlayerAPI(e, t, n) {
    if (!e) return;
    const o = this.ogl.db.udb[e] || this.ogl.createPlayer(e);
    o.uid = o.uid || e, o.api = o.api || 0, o.planets = o.planets || [], o.name = t || o.name, serverTime.getTime() - o.api > this.apiCooldown ? this.pending.push({
      url:`${PROTOCOL}//${HOST}/api/s${universeNum}/${lang}/playerData.xml?id=${o.uid}`,
      callback: e => {
        const t = (new DOMParser).parseFromString(e, "text/html");
        if (!t.querySelector("playerdata")) return;
        const a = 1e3 * parseInt(t.querySelector("playerdata").getAttribute("timestamp"));
        o.name || (o.name = t.querySelector("playerdata").getAttribute("name")), o.score = o.score || {}, o.score.global = Math.floor(t.querySelector('positions position[type="0"]').getAttribute("score")), o.score.economy = Math.floor(t.querySelector('positions position[type="1"]').getAttribute("score")), o.score.research = Math.floor(t.querySelector('positions position[type="2"]').getAttribute("score")), o.score.lifeform = Math.floor(t.querySelector('positions position[type="8"]').getAttribute("score")), o.score.military = Math.floor(t.querySelector('positions position[type="3"]').getAttribute("score")), o.score.globalRanking = Math.floor(t.querySelector('positions position[type="0"]').innerText), o.score.economyRanking = Math.floor(t.querySelector('positions position[type="1"]').innerText), o.score.researchRanking = Math.floor(t.querySelector('positions position[type="2"]').innerText), o.score.lifeformRanking = Math.floor(t.querySelector('positions position[type="8"]').innerText), o.score.militaryRanking = Math.floor(t.querySelector('positions position[type="3"]').innerText), o.api = a, t.querySelectorAll("planet").forEach(((e, t) => {
          const n = e.getAttribute("id"),
            i = e.getAttribute("coords"),
            r = e.querySelector("moon")?.getAttribute("id");
          this.ogl.db.pdb[i] = this.ogl.db.pdb[i] || {};
          const l = this.ogl.db.pdb[i];
          l.api = l.api || 0, l.api <= a && (l.uid = o.uid, l.pid = n, l.mid = r, l.coo = i, l.api = a, 0 == t && (l.home = !0)), o.planets.indexOf(i) < 0 && o.planets.push(i)
        })), o.planets.forEach(((e, t) => {
          this.ogl.db.pdb[e]?.api < a && (o.planets.splice(t, 1), this.ogl.db.pdb[e].uid == o.uid && delete this.ogl.db.pdb[e])
        })), n && n()
      }
    }) : n && n(!1)
  }
}
class UIManager extends Manager {
  load(e) {
    document.querySelector("#planetList").classList.add("ogl_ogameDiv"), document.querySelector(".ogl_side") || (this.side = Util.addDom("div", {
      class: "ogl_side " + (this.ogl.db.currentSide ? "ogl_active" : ""),
      parent: document.body
    })), document.querySelector(".ogl_recap") || (this.resourceDiv = Util.addDom("div", {
      class: "ogl_recap",
      parent: document.querySelector("#planetList")
    }), Util.addDom("div", {
      class: "ogl_icon ogl_metal",
      parent: this.resourceDiv,
      child: "0"
    }), Util.addDom("div", {
      class: "ogl_icon ogl_crystal",
      parent: this.resourceDiv,
      child: "0"
    }), Util.addDom("div", {
      class: "ogl_icon ogl_deut",
      parent: this.resourceDiv,
      child: "0"
    }), Util.addDom("div", {
      class: "ogl_icon ogl_msu",
      parent: this.resourceDiv,
      child: "0"
    })), e || (Util.addDom("li", {
      before: document.querySelector("#bar .OGameClock"),
      child: document.querySelector("#countColonies").innerText
    }), this.checkImportExport(), this.updateLeftMenu(), this.updateFooter()), this.attachGlobalClickEvent(e), this.displayResourcesRecap(), this.groupPlanets(), "highscore" != this.ogl.page || e || (this.updateHighscore(), this.updateStatus())
  }
  openSide(e, t, n) {
    let o = Util.addDom("div", {
      class: "material-icons ogl_close",
      child: "close",
      onclick: () => {
        this.side.classList.remove("ogl_active"), delete this.ogl.db.currentSide, this.ogl._shortcut.load(), this.ogl._shortcut.updateShortcutsPosition()
      }
    });
    !n || this.ogl.db.currentSide != t || this.side.querySelector(".ogl_loading") ? (this.side.innerText = "", this.side.appendChild(o), this.side.appendChild(e), this.side.classList.add("ogl_active"), this.lastOpenedSide != t && this.ogl._shortcut.load(), this.ogl.db.currentSide = t, this.lastOpenedSide = t, this.ogl._shortcut.updateShortcutsPosition(), document.querySelectorAll(".ogl_inputCheck").forEach((e => Util.formatInput(e)))) : o.click()
  }
  attachGlobalClickEvent(e) {
    e || (document.addEventListener("keyup", (e => {
      let t = document.activeElement.tagName;
      "INPUT" != t && "TEXTAREA" != t || document.activeElement.classList.contains("ogl_inputCheck") && Util.formatInput(document.activeElement)
    })), document.querySelectorAll(".planetlink, .moonlink").forEach((e => {
      e.addEventListener("pointerenter", (e => {
        if (!unsafeWindow.fleetDispatcher || !this.ogl._fleet?.isReady || !document.body.classList.contains("ogl_destinationPicker")) return;
        if (fleetDispatcher.fetchTargetPlayerDataTimeout) return;
        const t = e.target.closest(".smallplanet").querySelector(".planet-koords").innerText.split(":"),
          n = e.target.classList.contains("moonlink") ? 3 : 1,
          o = 3 == n ? e.target.querySelector(".icon-moon").getAttribute("alt") : e.target.querySelector(".planetPic").getAttribute("alt");
        document.querySelector("#galaxy").value = fleetDispatcher.targetPlanet.galaxy, document.querySelector("#system").value = fleetDispatcher.targetPlanet.system, document.querySelector("#position").value = fleetDispatcher.targetPlanet.position, fleetDispatcher.targetPlanet.type = n, fleetDispatcher.targetPlanet.galaxy = t[0], fleetDispatcher.targetPlanet.system = t[1], fleetDispatcher.targetPlanet.position = t[2], fleetDispatcher.targetPlanet.name = o, fleetDispatcher.refresh()
      })), e.addEventListener("pointerleave", (() => {
        /Android|iPhone/i.test(navigator.userAgent) || unsafeWindow.fleetDispatcher && this.ogl._fleet?.isReady && document.body.classList.contains("ogl_destinationPicker") && (document.querySelector("#galaxy").value = fleetDispatcher.realTarget.galaxy, document.querySelector("#system").value = fleetDispatcher.realTarget.system, document.querySelector("#position").value = fleetDispatcher.realTarget.position, fleetDispatcher.targetPlanet.galaxy = fleetDispatcher.realTarget.galaxy, fleetDispatcher.targetPlanet.system = fleetDispatcher.realTarget.system, fleetDispatcher.targetPlanet.position = fleetDispatcher.realTarget.position, fleetDispatcher.targetPlanet.type = fleetDispatcher.realTarget.type, fleetDispatcher.targetPlanet.name = fleetDispatcher.realTarget.name, fleetDispatcher.refresh())
      }))
    })), document.addEventListener("click", (e => {
      if ("svg" != e.target.tagName && "path" != e.target.tagName) {
        if (e.target.className.indexOf("tooltip") < 0 && !e.target.closest('[class*="tooltip"]') && this.ogl._tooltip.close(), e.target.getAttribute("data-galaxy")) {
          let t = e.target.getAttribute("data-galaxy").split(":");
          if ("galaxy" === this.ogl.page) galaxy = t[0], system = t[1], loadContentNew(galaxy, system);
          else {
            const n = `?page=ingame&component=galaxy&galaxy=${t[0]}&system=${t[1]}`;
            e.ctrlKey ? window.open(n, "_blank") : window.location.href = n
          }
        }
        if ((e.target.classList.contains("planetlink") || e.target.classList.contains("moonlink") || e.target.closest(".planetlink, .moonlink")) && document.body.classList.contains("ogl_destinationPicker")) {
          e.preventDefault();
          const t = e.target.closest(".smallplanet").querySelector(".planet-koords").innerText.split(":"),
            n = e.target.closest(".planetlink, .moonlink").classList.contains("moonlink") ? 3 : 1,
            o = 3 == n ? e.target.closest(".smallplanet").querySelector(".icon-moon").getAttribute("alt") : e.target.closest(".smallplanet").querySelector(".planetPic").getAttribute("alt");
          if (document.body.classList.contains("ogl_initHarvest")) window.location.href = `?page=ingame&component=fleetdispatch&galaxy=${t[0]}&system=${t[1]}&position=${t[2]}&type=${n}&oglmode=1`;
          else {
            if (!unsafeWindow.fleetDispatcher || !this.ogl._fleet?.isReady) return;
            fleetDispatcher.targetPlanet.type = n, fleetDispatcher.targetPlanet.galaxy = t[0], fleetDispatcher.targetPlanet.system = t[1], fleetDispatcher.targetPlanet.position = t[2], fleetDispatcher.targetPlanet.name = o, fleetDispatcher.refresh(), this.ogl._fleet.setRealTarget(JSON.parse(JSON.stringify(fleetDispatcher.targetPlanet))), "fleet1" == fleetDispatcher.currentPage ? fleetDispatcher.focusSubmitFleet1() : "fleet2" == fleetDispatcher.currentPage && (fleetDispatcher.focusSendFleet(), fleetDispatcher.updateTarget())
          }
        }
        e.target.getAttribute("data-api-code") && (navigator.clipboard.writeText(e.target.getAttribute("data-api-code")), fadeBox("API code copied")), e.target.classList.contains("js_actionKillAll") && 20 == ogame?.messages?.getCurrentMessageTab() && (ogl.cache.reports = {})
      }
    })))
  }
  openFleetProfile() {
    const e = Util.addDom("div", {
      class: "ogl_keeper"
    });
    Util.addDom("h2", {
      child: "Limiters",
      parent: e
    });
    const t = Util.addDom("div", {
        parent: e
      }),
      n = Util.addDom("label", {
        class: "ogl_limiterLabel tooltip",
        "data-limiter-type": "resource",
        title: this.ogl._lang.find("resourceLimiter"),
        parent: t,
        child: "Resources"
      }),
      o = Util.addDom("input", {
        type: "checkbox",
        parent: n,
        onclick: () => {
          this.ogl.db.fleetLimiter.resourceActive = !this.ogl.db.fleetLimiter.resourceActive, this.ogl._fleet.updateLimiter(), document.querySelectorAll(`[data-limiter-type="${n.getAttribute("data-limiter-type")}"] input`).forEach((e => e.checked = this.ogl.db.fleetLimiter.resourceActive))
        }
      }),
      a = Util.addDom("div", {
        parent: t,
        class: "ogl_resourceLimiter"
      });
    Util.addDom("br", {
      parent: t
    });
    const i = Util.addDom("label", {
        class: "ogl_limiterLabel tooltip",
        "data-limiter-type": "ship",
        title: this.ogl._lang.find("fleetLimiter"),
        parent: t,
        child: "Ships"
      }),
      r = Util.addDom("input", {
        type: "checkbox",
        parent: i,
        onclick: () => {
          this.ogl.db.fleetLimiter.shipActive = !this.ogl.db.fleetLimiter.shipActive, this.ogl._fleet.updateLimiter(), document.querySelectorAll(`[data-limiter-type="${i.getAttribute("data-limiter-type")}"] input`).forEach((e => e.checked = this.ogl.db.fleetLimiter.shipActive))
        }
      }),
      l = Util.addDom("div", {
        parent: t,
        class: "ogl_shipLimiter"
      });
    Util.addDom("br", {
      parent: t
    });
    const s = Util.addDom("label", {
        class: "ogl_limiterLabel tooltip",
        "data-limiter-type": "jumpgate",
        title: this.ogl._lang.find("fleetLimiter"),
        parent: t,
        child: "Jumpgate"
      }),
      d = Util.addDom("input", {
        type: "checkbox",
        parent: s,
        onclick: () => {
          this.ogl.db.fleetLimiter.jumpgateActive = !this.ogl.db.fleetLimiter.jumpgateActive, this.ogl._jumpgate.updateLimiter(), document.querySelectorAll(`[data-limiter-type="${s.getAttribute("data-limiter-type")}"] input`).forEach((e => e.checked = this.ogl.db.fleetLimiter.jumpgateActive))
        }
      }),
      c = Util.addDom("div", {
        parent: t,
        class: "ogl_jumpgateLimiter"
      });
    return this.ogl.db.fleetLimiter.resourceActive && (o.checked = !0), this.ogl.db.fleetLimiter.shipActive && (r.checked = !0), this.ogl.db.fleetLimiter.jumpgateActive && (d.checked = !0), Object.keys(this.ogl.resourcesKeys).concat(this.ogl.shipsList).forEach((e => {
      if ("population" != e && "darkmatter" != e && "energy" != e) {
        const t = isNaN(e) ? a : l,
          n = Util.addDom("div", {
            parent: t,
            class: `ogl_icon ogl_${e}`,
            "data-id": e
          }),
          o = Util.addDom("input", {
            class: "ogl_inputCheck",
            parent: n,
            value: this.ogl.db.fleetLimiter.data[e] || 0,
            oninput: () => {
              setTimeout((() => {
                this.ogl.db.fleetLimiter.data[e] = parseInt(o.value.replace(/\D/g, "")) || 0, this.ogl._fleet.updateLimiter(!0)
              }), 200)
            }
          });
        if (!isNaN(e)) {
          const t = Util.addDom("div", {
              parent: c,
              class: `ogl_icon ogl_${e}`,
              "data-id": e
            }),
            n = Util.addDom("input", {
              class: "ogl_inputCheck",
              parent: t,
              value: this.ogl.db.fleetLimiter.jumpgateData[e] || 0,
              oninput: () => {
                setTimeout((() => {
                  this.ogl.db.fleetLimiter.jumpgateData[e] = parseInt(n.value.replace(/\D/g, "")) || 0, this.ogl._fleet.updateLimiter()
                }), 200)
              }
            })
        }
      }
    })), e.querySelectorAll(".ogl_inputCheck").forEach((e => Util.formatInput(e))), e
  }
  openKeyboardActions() {
    const e = Util.addDom("div", {
        class: "ogl_keyboardActions"
      }),
      t = {};
    return Util.addDom("h2", {
      parent: e,
      child: this.ogl._lang.find("keyboardActions")
    }), Object.entries(this.ogl.db.options.keyboardActions).forEach((n => {
      const o = Util.addDom("label", {
          parent: e,
          child: `${this.ogl._lang.find(n[0])}`
        }),
        a = Util.addDom("input", {
          maxlength: "1",
          type: "text",
          value: n[1],
          parent: o,
          onclick: () => {
            a.value = "", a.select()
          },
          onblur: () => {
            "" == a.value && (a.value = n[1])
          },
          oninput: () => {
            t[n[0]] = a.value
          }
        });
      "fleetResourcesSplit" == n[0] && (a.classList.add("ogl_disabled"), a.disabled = !0)
    })), Util.addDom("button", {
      parent: e,
      class: "ogl_button",
      child: "save",
      onclick: () => {
        Object.entries(t).forEach((e => {
          this.ogl.db.options.keyboardActions[e[0]] = t[e[0]], window.location.reload()
        }))
      }
    }), e
  }
  openExpeditionFiller() {
    const e = Util.addDom("div", {
      class: "ogl_expeditionFiller"
    });
    return Util.addDom("h2", {
      parent: e,
      child: this.ogl._lang.find("expeditionBigShips")
    }), [204, 205, 206, 207, 215, 211, 213, 218].forEach((t => {
      const n = Util.addDom("div", {
        class: `ogl_icon ogl_${t}`,
        parent: e,
        onclick: () => {
          this.ogl.db.options.expeditionBigShips.indexOf(t) > -1 ? (this.ogl.db.options.expeditionBigShips = this.ogl.db.options.expeditionBigShips.filter((e => e !== t)), n.classList.remove("ogl_active")) : (this.ogl.db.options.expeditionBigShips.push(t), n.classList.add("ogl_active"))
        }
      });
      this.ogl.db.options.expeditionBigShips.indexOf(t) > -1 && n.classList.add("ogl_active")
    })), e
  }
  openDataManager() {
    const e = Util.addDom("div", {
      class: "ogl_manageData"
    });
    Util.addDom("h2", {
      parent: e,
      child: this.ogl._lang.find("manageData")
    });
    const t = Util.addDom("div", {
      class: "ogl_grid",
      parent: e
    });
    Util.addDom("label", {
      class: "ogl_button",
      for: "ogl_import",
      child: "Import data",
      parent: t
    });
    const n = Util.addDom("input", {
      id: "ogl_import",
      class: "ogl_hidden",
      accept: "application/JSON",
      type: "file",
      parent: t,
      onchange: () => {
        const e = n.files[0],
          t = new FileReader;
        t.onload = () => {
          let e, n;
          try {
            e = JSON.parse(t.result)
          }
          catch (e) {
            n = "cannot read file"
          }!n && e && e.dataFormat > 10 ? (this.ogl.db = e, document.location.reload()) : this.ogl._notification.addToQueue(`Error, ${n||"wrong data format"}`, !1)
        }, t.readAsText(e)
      }
    });
    return Util.addDom("a", {
      class: "ogl_button",
      download: `oglight_${this.ogl.server.name}_${this.ogl.server.lang}_${serverTime.getTime()}`,
      child: "Export data",
      parent: t,
      href: URL.createObjectURL(new Blob([JSON.stringify(this.ogl.db)], {
        type: "application/json"
      }))
    }), Util.addDom("hr", {
      parent: t
    }), Util.addDom("div", {
      class: "ogl_button ogl_danger",
      child: this.ogl._lang.find("resetStats") + ' <i class="material-icons">donut_large</i>',
      parent: t,
      onclick: () => {
        confirm(this.ogl._lang.find("resetStatsLong")) && (this.ogl.cache.raids = {}, this.ogl.db.stats = {}, window.location.reload(), this.ogl.db.initialTime = Date.now())
      }
    }), Util.addDom("div", {
      class: "ogl_button ogl_danger",
      child: this.ogl._lang.find("resetTaggedPlanets") + ' <i class="material-icons">stroke_full</i>',
      parent: t,
      onclick: () => {
        confirm(this.ogl._lang.find("resetTaggedPlanetsLong")) && (this.ogl.db.tdb = {}, this.ogl.db.quickRaidList = [], window.location.reload())
      }
    }), Util.addDom("div", {
      class: "ogl_button ogl_danger",
      child: this.ogl._lang.find("resetPinnedPlayers") + ' <i class="material-icons">push_pin</i>',
      parent: t,
      onclick: () => {
        confirm(this.ogl._lang.find("resetPinnedPlayersLong")) && (this.ogl.db.pdb = {}, this.ogl.db.udb = {}, this.ogl.db.lastPinnedList = [], this.ogl.db.quickRaidList = [], window.location.reload())
      }
    }), Util.addDom("div", {
      class: "ogl_button ogl_danger",
      child: this.ogl._lang.find("resetAll"),
      parent: t,
      onclick: () => {
        confirm(this.ogl._lang.find("resetAllLong")) && (this.ogl.cache = {}, this.ogl.db = {}, window.location.reload(), this.ogl.db.initialTime = Date.now())
      }
    }), e
  }
  groupPlanets() {
    let e = 0,
      t = 1;
    document.querySelectorAll(".smallplanet").forEach((n => {
      let o = Util.coordsToID(n.querySelector(".planet-koords").innerText).slice(0, -3);
      e === o ? n.setAttribute("data-group", t) : n.previousElementSibling?.getAttribute("data-group") && t++, e = o
    }))
  }
  checkImportExport() {
    (this.ogl.db.nextImportExport || 0) < Date.now() && document.querySelector(".menubutton[href*=traderOverview]").classList.add("ogl_active"), window.addEventListener("beforeunload", (() => {
      let e = document.querySelector(".bargain_text"),
        t = document.querySelector(".import_bargain.hidden");
      if (e && t) {
        let t = new Date(serverTime.getTime()),
          n = new Date(serverTime.getTime() + 864e5);
        e.innerText.match(/\d+/g) ? this.ogl.db.nextImportExport = new Date(t.getFullYear(), t.getMonth(), t.getDate(), e.innerText.match(/\d+/g)[0], 0, 0).getTime() : this.ogl.db.nextImportExport = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 1).getTime(), this.ogl.save()
      }
      else e && "" == e.innerText && (this.ogl.db.nextImportExport = serverTime.getTime(), this.ogl.save())
    }))
  }
  turnIntoPlayerLink(e, t, n) {
    t.setAttribute("title", "loading..."), t.classList.add("tooltipUpdate"), t.classList.add("tooltipRight"), t.classList.add("tooltipClose"), t.addEventListener("click", (t => {
      e == this.ogl.account.id || t.ctrlKey || (t.preventDefault(), this.ogl._topbar.openPinnedDetail(e))
    })), t.addEventListener("tooltip", (() => {
      const o = Util.addDom("div", {
        child: '<div class="ogl_loading"></div>'
      });
      t._tippy ? t._tippy.setContent(o) : this.ogl._tooltip.tooltip.appendChild(o), this.ogl._fetch.fetchPlayerAPI(e, n, (() => {
        document.querySelector(".ogl_pinDetail") && this.ogl.db.currentSide == e && this.ogl._topbar.openPinnedDetail(e), t._tippy && t._tippy.setContent(this.getPlayerTooltip(e)), (document.querySelector(`.ogl_tooltip #player${e}`) || this.ogl._tooltip.lastSender == t) && this.ogl._tooltip.update(this.getPlayerTooltip(e), t)
      }))
    }))
  }
  getPlayerTooltip(e) {
    const t = this.ogl.db.udb[e],
      n = Math.ceil(t.score.globalRanking / 100),
      o = Util.addDom("div", {
        class: "ogl_playerData",
        child: `\n            <h1 class="${t.status||"status_abbr_active"}">${t.name} <a href="?page=highscore&site=${n}&searchRelId=${e}">#${t.score.globalRanking}</a></h1>\n            <div class="ogl_grid">\n                <div class="ogl_tagSelector material-icons"></div>\n                <div class="ogl_leftSide">\n                    <div class="ogl_actions"></div>\n                    <div class="ogl_score">\n                        <div class="ogl_line"><i class="material-icons">trending_up</i><div>${Util.formatNumber(t.score.global)}</div></div>\n                        <div class="ogl_line"><i class="material-icons">diamond</i><div>${Util.formatNumber(t.score.economy)}</div></div>\n                        <div class="ogl_line"><i class="material-icons">science</i><div>${Util.formatNumber(t.score.research)}</div></div>\n                        <div class="ogl_line"><i class="material-icons">genetics</i><div>${Util.formatNumber(t.score.lifeform)}</div></div>\n                        <div class="ogl_line"><i class="material-icons">rocket_launch</i><div>${Util.formatNumber(Util.getPlayerScoreFD(t.score,"fleet"))}</div></div>\n                        <div class="ogl_line"><i class="material-icons">security</i><div>${Util.formatNumber(Util.getPlayerScoreFD(t.score,"defense"))}</div></div>\n                        <div class="ogl_line"><i class="material-icons">schedule</i><div>${new Date(t.api).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}</div></div>\n                    </div>\n                </div>\n                <div class="ogl_planetStalk"></div>\n            </div>`
      }),
      a = Util.addDom("div", {
        child: "edit",
        class: "material-icons ogl_button",
        parent: o.querySelector(".ogl_actions"),
        onclick: () => {
          document.querySelector("#chatBar") || (window.location.href = `?page=chat&playerId=${t.uid}`)
        }
      });
    document.querySelector("#chatBar") && (a.classList.add("js_openChat"), a.setAttribute("data-playerId", t.uid)), Util.addDom("a", {
      child: "account-plus",
      class: "material-icons ogl_button overlay",
      parent: o.querySelector(".ogl_actions"),
      href: `?page=ingame&component=buddies&action=7&id=${t.uid}&ajax=1`,
      onclick: () => {
        this.ogl._tooltip.close()
      }
    }), Util.addDom("div", {
      child: "block",
      class: "material-icons ogl_button",
      parent: o.querySelector(".ogl_actions"),
      onclick: () => {
        window.location.href = `?page=ignorelist&action=1&id=${t.uid}`
      }
    }), Util.addDom("div", {
      child: "query_stats",
      class: "material-icons ogl_button",
      parent: o.querySelector(".ogl_actions"),
      onclick: () => {
        window.open(Util.genMmorpgstatLink(this.ogl, t.uid), "_blank")
      }
    }), e != this.ogl.account.id && Util.addDom("div", {
      child: "arrow_forward",
      class: "material-icons ogl_button",
      parent: o.querySelector(".ogl_actions"),
      onclick: () => {
        this.ogl._topbar.openPinnedDetail(t.uid)
      }
    });
    const i = o.querySelector(".ogl_planetStalk");
    let r = 0,
      l = 1;
    if (t.planets.sort(((e, t) => Util.coordsToID(e) - Util.coordsToID(t))).forEach(((e, t) => {
        let n = e.split(":"),
          o = Util.addDom("div", {
            parent: i,
            child: `<div>${t+1}</div><div data-galaxy="${n[0]}:${n[1]}">${e}</div>`
          }),
          a = Util.coordsToID(n).slice(0, -3);
        r === a ? o.setAttribute("data-group", l) : o.previousElementSibling?.getAttribute("data-group") && l++, r = a, this.ogl.db.pdb[e]?.home && o.classList.add("ogl_home"), unsafeWindow.galaxy == n[0] && unsafeWindow.system == n[1] && o.querySelector("[data-galaxy]").classList.add("ogl_active"), this.addSpyIcons(o, n), this.ogl._ui.addTagButton(o, n, !0)
      })), t.uid != this.ogl.account.id) {
      const e = o.querySelector(".ogl_tagSelector");
      Object.keys(this.ogl.db.tags).forEach((n => {
        Util.addDom("div", {
          parent: e,
          "data-tag": n,
          onclick: () => {
            t.planets.forEach((e => {
              let t = Util.coordsToID(e.split(":"));
              "none" != n ? (this.ogl.db.tdb[t] = {
                tag: n
              }, document.querySelectorAll(`.ogl_tagPicker[data-raw="${t}"]`).forEach((e => e.setAttribute("data-tag", n)))) : this.ogl.db.tdb[t] && (delete this.ogl.db.tdb[t], document.querySelectorAll(`.ogl_tagPicker[data-raw="${t}"]`).forEach((e => e.removeAttribute("data-tag"))))
            }))
          }
        })
      }))
    }
    return o
  }
  addPinButton(e, t) {
    const n = this.ogl.db.udb[t],
      o = Util.addDom("div", {
        title: "loading...",
        class: "ogl_flagPicker material-icons tooltipLeft tooltipClick tooltipClose tooltipUpdate",
        "data-uid": t,
        parent: e,
        ontooltip: e => {
          o._tippy ? o._tippy.setContent(a) : this.ogl._tooltip.tooltip.appendChild(a)
        },
        onclick: e => {
          e.shiftKey && (e.preventDefault(), "none" == this.ogl.db.lastPinUsed && this.ogl.db.udb[t] ? (delete this.ogl.db.udb[t].pin, document.querySelectorAll(`.ogl_flagPicker[data-uid="${t}"]`).forEach((e => {
            e.removeAttribute("data-flag"), e.innerText = ""
          }))) : (this.ogl.db.udb[t] = this.ogl.db.udb[t] || this.ogl.createPlayer(t), this.ogl.db.udb[t].pin = this.ogl.db.lastPinUsed, document.querySelectorAll(`.ogl_flagPicker[data-uid="${t}"]`).forEach((e => {
            e.setAttribute("data-flag", this.ogl.db.lastPinUsed)
          }))))
        }
      }),
      a = Util.addDom("div", {
        class: "ogl_flagSelector material-icons"
      });
    this.ogl.flagsList.forEach((e => {
      if ("ptre" == e && !this.ogl.ptreKey) return;
      Util.addDom("div", {
        "data-flag": e,
        parent: a,
        onclick: () => {
          "none" == e && this.ogl.db.udb[t] ? (delete this.ogl.db.udb[t].pin, document.querySelectorAll(`.ogl_flagPicker[data-uid="${t}"]`).forEach((e => {
            e.removeAttribute("data-flag"), e.innerText = ""
          }))) : (this.ogl.db.udb[t] = this.ogl.db.udb[t] || this.ogl.createPlayer(t), this.ogl.db.udb[t].pin = e, document.querySelectorAll(`.ogl_flagPicker[data-uid="${t}"]`).forEach((t => {
            t.setAttribute("data-flag", e)
          }))), this.ogl.db.lastPinUsed = e, "none" != e && this.ogl._topbar.openPinnedDetail(t), this.ogl._tooltip.close()
        }
      })
    })), n?.pin && o.setAttribute("data-flag", n.pin)
  }
  addTagButton(e, t, n) {
    const o = Util.coordsToID(t),
      a = this.ogl.db.tdb[o],
      i = Util.addDom("div", {
        title: "loading...",
        class: "ogl_tagPicker material-icons tooltipLeft tooltipClick tooltipClose tooltipUpdate",
        "data-raw": o,
        parent: e,
        ontooltip: e => {
          n || (i._tippy ? i._tippy.setContent(r) : this.ogl._tooltip.tooltip.appendChild(r))
        },
        onclick: e => {
          e.shiftKey && !n && ("none" == this.ogl.db.lastTagUsed && this.ogl.db.tdb[o] ? (delete this.ogl.db.tdb[o], document.querySelectorAll(`.ogl_tagPicker[data-raw="${o}"]`).forEach((e => e.removeAttribute("data-tag")))) : (this.ogl.db.tdb[o] = this.ogl.db.tdb[o] || {}, this.ogl.db.tdb[o].tag = this.ogl.db.lastTagUsed, document.querySelectorAll(`.ogl_tagPicker[data-raw="${o}"]`).forEach((e => e.setAttribute("data-tag", this.ogl.db.lastTagUsed)))))
        }
      }),
      r = Util.addDom("div", {
        class: "ogl_tagSelector material-icons"
      });
    Object.keys(this.ogl.db.tags).forEach((e => {
      Util.addDom("div", {
        "data-tag": e,
        parent: r,
        onclick: () => {
          "none" == e && this.ogl.db.tdb[o] ? (delete this.ogl.db.tdb[o], document.querySelectorAll(`.ogl_tagPicker[data-raw="${o}"]`).forEach((e => e.removeAttribute("data-tag")))) : (this.ogl.db.tdb[o] = this.ogl.db.tdb[o] || {}, this.ogl.db.tdb[o].tag = e, document.querySelectorAll(`.ogl_tagPicker[data-raw="${o}"]`).forEach((t => t.setAttribute("data-tag", e)))), this.ogl.db.lastTagUsed = e, this.ogl._tooltip.close()
        }
      })
    })), a?.tag && i.setAttribute("data-tag", a.tag)
  }
  addSpyIcons(e, t, n, o) {
    if (t = "string" == typeof t ? t = t.split(":") : t, "planet" == n || !n) {
      const n = Util.addDom("div", {
          class: "material-icons ogl_spyIcon tooltip",
          title: this.ogl._lang.find("spyPlanet"),
          "data-spy-coords": `${t[0]}:${t[1]}:${t[2]}:1`,
          child: "language",
          parent: e,
          onclick: e => this.ogl._notification.addToQueue(this.ogl._lang.find("notifyNoProbe"), !1, !0)
        }),
        a = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.spy?.[0] || 0;
      if (serverTime.getTime() - a < this.ogl.db.options.spyIndicatorDelay && (n.setAttribute("data-spy", "recent"), n.setAttribute("title", "recently spied")), o) {
        const e = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.acti || [],
          o = serverTime.getTime() - e[2] < 36e5,
          a = Util.addDom("span", {
            parent: n,
            child: o ? e[0] : "?"
          });
        "*" == e[0] && o ? a.classList.add("ogl_danger") : 60 == e[0] && o ? a.classList.add("ogl_ok") : a.classList.add("ogl_warning")
      }
    }
    if ("moon" == n || !n && this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.mid) {
      const n = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.mid > 0 ? Util.addDom("div", {
          class: "material-icons ogl_spyIcon tooltip",
          title: this.ogl._lang.find("spyMoon"),
          "data-spy-coords": `${t[0]}:${t[1]}:${t[2]}:3`,
          child: "bedtime",
          parent: e,
          onclick: e => this.ogl._notification.addToQueue(this.ogl._lang.find("notifyNoProbe"), !1, !0)
        }) : Util.addDom("div", {
          parent: e
        }),
        a = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.spy?.[1] || 0;
      if (serverTime.getTime() - a < this.ogl.db.options.spyIndicatorDelay && (n.setAttribute("data-spy", "recent"), n.setAttribute("title", "recently spied")), o && this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.mid > -1) {
        const e = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.acti || [],
          o = serverTime.getTime() - e[2] < 36e5,
          a = Util.addDom("span", {
            parent: n,
            child: o ? e[1] : "?"
          });
        "*" == e[1] && o ? a.classList.add("ogl_danger") : 60 == e[1] && o ? a.classList.add("ogl_ok") : a.classList.add("ogl_warning")
      }
    }
    n || this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.mid || Util.addDom("div", {
      parent: e
    })
  }
  updateLeftMenu() {
    const e = document.querySelector("#menuTable"),
      t = oglVersion,
      n = Util.addDom("li", {
        parent: e
      });
    Util.addDom("span", {
      parent: n,
      class: "menu_icon ogl_leftMenuIcon",
      child: '<a class="tooltipRight" href="https://openuserjs.org/scripts/nullNaN/OGLight" target="_blank"><i class="material-icons">oglight_simple</i></a>'
    });
    if (Util.addDom("a", {
        parent: n,
        class: "menubutton tooltipRight",
        href: "https://board.fr.ogame.gameforge.com/index.php?thread/722955-oglight/",
        target: "_blank",
        child: `<span class="textlabel">OGLight ${t}</span>`
      }), this.ogl.ptreKey) {
      const t = Util.addDom("li", {
        parent: e
      });
      Util.addDom("span", {
        parent: t,
        class: "menu_icon ogl_leftMenuIcon ogl_ptreActionIcon",
        child: '<a class="tooltipRight" title="PTRE last request status" href="#"><i class="material-icons">sync_alt</i></a>',
        onclick: () => this.ogl.PTRE.displayLogs()
      }), Util.addDom("a", {
        parent: t,
        class: "menubutton tooltipRight",
        href: "https://ptre.chez.gg/",
        target: "_blank",
        child: '<span class="textlabel">PTRE</span>'
      })
    }
  }
  updateFooter() {
    const e = document.querySelector("#siteFooter .fright"),
      t = ["fr", "de", "en", "es", "pl", "it", "ru", "ar", "mx", "tr", "fi", "tw", "gr", "br", "nl", "hr", "sk", "cz", "ro", "us", "pt", "dk", "no", "se", "si", "hu", "jp", "ba"].indexOf(this.ogl.server.lang);
    e.innerHTML += `\n            | <a target="_blank" href="https://www.mmorpg-stat.eu/0_fiche_joueur.php?pays=${t}&ftr=${this.ogl.account.id}.dat&univers=_${this.ogl.server.id}">Mmorpg-stat</a>\n            | <a target="_blank" href="https://ogotcha.oplanet.eu/${this.ogl.server.lang}">Ogotcha</a>\n            | <a>OGL ${this.ogl.version}</a>\n        `
  }
  updateHighscore() {
    if (serverTime.getTime() - this.highscoreDelay < 500) return;
    this.highscoreDelay = serverTime.getTime();
    const e = {
      0: "global",
      1: "economy",
      2: "research",
      3: "military",
      8: "lifeform"
    };
    if (document.querySelector("#stat_list_content").setAttribute("data-category", currentCategory), document.querySelector("#stat_list_content").setAttribute("data-type", currentType), 1 != currentCategory || !e[currentType]) return;
    const t = JSON.parse(localStorage.getItem(`${window.location.host}_highscore`) || "{}");
    0 == currentType && Util.runAsync((() => this.displayScoreDiff(t))), (!t.timestamps?.[e[currentType]] || serverTime.getTime() - t.timestamps?.[e[currentType]] > 1728e5) && this.ogl._fetch.pending.push({
      url:`${PROTOCOL}//${HOST}/api/s${universeNum}/${lang}/highscore.xml?category=${currentCategory}&type=${currentType}`,
      callback: n => {
        console.log(`ranking ${e[currentType]} score fetched`), t.timestamps = t.timestamps || {};
        let o = (new DOMParser).parseFromString(n, "text/html");
        t.timestamps[e[currentType]] = 1e3 * parseInt(o.querySelector("highscore").getAttribute("timestamp")), o.querySelectorAll("player").forEach((n => {
          const o = n.getAttribute("id"),
            a = parseInt(n.getAttribute("score"));
          parseInt(n.getAttribute("position"));
          t[o] && typeof t[o] == typeof {} || (t[o] = {}), t[o][e[currentType]] = a
        })), localStorage.setItem(`${window.location.host}_highscore`, JSON.stringify(t)), 0 == currentType && this.displayScoreDiff(t)
      }
    })
  }
  updateStatus() {
    if (serverTime.getTime() - this.statusDelay < 500) return;
    if (this.statusDelay = serverTime.getTime(), 1 != currentCategory) return;
    const e = JSON.parse(localStorage.getItem(`${window.location.host}_highscore`) || "{}");
    Util.runAsync((() => this.displayStatus(e))), (!e.statusTimestamp || serverTime.getTime() - e.statusTimestamp > 864e5) && this.ogl._fetch.pending.push({
      url:`${PROTOCOL}//${HOST}/api/s${universeNum}/${lang}/players.xml`,
      callback: t => {
        console.log("ranking status fetched");
        let n = (new DOMParser).parseFromString(t, "text/html");
        e.statusTimestamp = 1e3 * parseInt(n.querySelector("players").getAttribute("timestamp")), n.querySelectorAll("player").forEach((t => {
          const n = t.getAttribute("id");
          let o = t.getAttribute("status") || "status_abbr_active";
          o.indexOf("v") > -1 && "status_abbr_active" != o ? o = "status_abbr_vacation" : "I" === o ? o = "status_abbr_longinactive" : "i" === o && (o = "status_abbr_inactive"), e[n] && typeof e[n] == typeof {} || (e[n] = {}), e[n].status = o, this.ogl.db.udb[n] && (this.ogl.db.udb[n].status = o)
        })), localStorage.setItem(`${window.location.host}_highscore`, JSON.stringify(e)), this.displayStatus(e)
      }
    })
  }
  displayScoreDiff(e) {
    if (document.querySelector("#ranks .ogl_scoreDiff") || 1 != currentCategory || 0 !== currentType) return;
    const t = Math.round((serverTime.getTime() - e.timestamps.global) / 36e5),
      n = [];
    Util.addDom("div", {
      class: "ogl_rankSince",
      prepend: document.querySelector("#stat_list_content"),
      child: `last ${t}h`
    }), document.querySelectorAll("#ranks tbody tr").forEach((t => {
      const o = t.getAttribute("id").replace("position", ""),
        a = t.querySelector(".score").innerText.replace(/\D/g, "") - e[o]?.global || 0;
      n.push({
        id: o,
        diff: a
      }), t.querySelector(".ogl_scoreDiff")?.remove();
      const i = Util.addDom("span", {
        class: "ogl_scoreDiff",
        parent: t.querySelector(".score"),
        child: (a > 0 ? "+" : "") + Util.formatNumber(a)
      });
      a > 0 ? i.classList.add("ogl_ok") : a < 0 && i.classList.add("ogl_danger")
    })), n.sort(((e, t) => t.diff - e.diff)).slice(0, 3).forEach((e => document.querySelector("#position" + e.id).classList.add("ogl_bigScore"))), n.sort(((e, t) => e.diff - t.diff)).slice(0, 3).forEach((e => {
      e.diff < 0 && document.querySelector("#position" + e.id).classList.add("ogl_lowScore")
    }))
  }
  displayStatus(e) {
    document.querySelectorAll("#ranks tbody tr").forEach((t => {
      const n = t.getAttribute("id").replace("position", ""),
        o = t.querySelector(".name > a");
      this.ogl.db.udb[n]?.name && o.querySelector(".playername").innerText.indexOf("...") >= 0 && (o.querySelector(".playername").innerText = this.ogl.db.udb[n].name), e[n] && o.querySelector(".playername").classList.add(e[n].status), this.turnIntoPlayerLink(n, o), t.querySelector(".ogl_flagPicker") || this.addPinButton(t.querySelector(".position"), n)
    })), initTooltips()
  }
  displayResourcesRecap() {
    this.resources = {}, this.resources.total = {
      metal: 0,
      crystal: 0,
      deut: 0,
      msu: 0
    }, this.resources.prod = {
      metal: 0,
      crystal: 0,
      deut: 0,
      msu: 0
    }, this.resources.fly = {
      metal: 0,
      crystal: 0,
      deut: 0
    }, this.resources.ground = {
      metal: 0,
      crystal: 0,
      deut: 0
    }, this.resources.todo = {
      metal: 0,
      crystal: 0,
      deut: 0
    }, document.querySelectorAll(".planetlink, .moonlink").forEach((e => {
      const t = new URLSearchParams(e.getAttribute("href")).get("cp").split("#")[0];
      ["metal", "crystal", "deut"].forEach((e => {
        this.resources.total[e] += this.ogl.db.myPlanets[t]?.[e] || 0, this.resources.ground[e] += this.ogl.db.myPlanets[t]?.[e] || 0, this.resources.prod[e] += this.ogl.db.myPlanets[t]?.["prod" + e] || 0
      })), Object.values(this.ogl.db.myPlanets[t]?.todolist || {}).forEach((e => {
        Object.values(e || {}).forEach((e => {
          e.cost && (this.resources.todo.metal += e.cost.metal, this.resources.todo.crystal += e.cost.crystal, this.resources.todo.deut += e.cost.deut)
        }))
      }))
    })), Object.entries(this.ogl.cache?.movements || {}).forEach((e => {
      e[1].forEach((e => {
        ["metal", "crystal", "deut"].forEach((t => {
          this.resources.total[t] += e[t] || 0, this.resources.fly[t] += e[t] || 0
        }))
      }))
    }));
    const e = this.ogl.db.options.msu;
    this.resources.total.msu = Util.getMSU(this.resources.total.metal, this.resources.total.crystal, this.resources.total.deut, e), this.resources.prod.metal = Math.floor(3600 * this.resources.prod.metal * 24), this.resources.prod.crystal = Math.floor(3600 * this.resources.prod.crystal * 24), this.resources.prod.deut = Math.floor(3600 * this.resources.prod.deut * 24), this.resources.prod.msu = Util.getMSU(this.resources.prod.metal, this.resources.prod.crystal, this.resources.prod.deut, e), this.resourceDiv.querySelector(".ogl_metal").innerHTML = `<span>${Util.formatToUnits(this.resources.total.metal)}</span><span>+${Util.formatToUnits(Math.floor(this.resources.prod.metal,1))}</span>`, this.resourceDiv.querySelector(".ogl_crystal").innerHTML = `<span>${Util.formatToUnits(this.resources.total.crystal)}</span><span>+${Util.formatToUnits(Math.floor(this.resources.prod.crystal,1))}</span>`, this.resourceDiv.querySelector(".ogl_deut").innerHTML = `<span>${Util.formatToUnits(this.resources.total.deut)}</span><span>+${Util.formatToUnits(Math.floor(this.resources.prod.deut,1))}</span>`, this.resourceDiv.querySelector(".ogl_msu").innerHTML = `<span>${Util.formatToUnits(this.resources.total.msu)}</span><span>+${Util.formatToUnits(Math.floor(this.resources.prod.msu,1))}</span>`, this.recapReady || (this.recapReady = !0, this.resourceDiv.classList.add("tooltipLeft"), this.resourceDiv.classList.add("tooltipClick"), this.resourceDiv.classList.add("tooltipClose"), this.resourceDiv.classList.add("tooltipUpdate"), this.resourceDiv.addEventListener("tooltip", (() => {
      const e = Util.addDom("div", {
        class: "ogl_resourcesDetail"
      });
      e.innerHTML = `\n                    <div>\n                        <h3 class="material-icons">precision_manufacturing</h3>\n                        <div class="ogl_metal">+${Util.formatToUnits(this.resources.prod.metal)}</div>\n                        <div class="ogl_crystal">+${Util.formatToUnits(this.resources.prod.crystal)}</div>\n                        <div class="ogl_deut">+${Util.formatToUnits(this.resources.prod.deut)}</div>\n                    </div>\n                    <div>\n                        <h3 class="material-icons">format_list_bulleted</h3>\n                        <div class="ogl_metal ogl_todoDays">${Util.formatToUnits(this.resources.todo.metal)} <span>(${Math.ceil(Math.max(0,this.resources.todo.metal-this.resources.total.metal)/this.resources.prod.metal)}${LocalizationStrings.timeunits.short.day})</span></div>\n                        <div class="ogl_crystal ogl_todoDays">${Util.formatToUnits(this.resources.todo.crystal)} <span>(${Math.ceil(Math.max(0,this.resources.todo.crystal-this.resources.total.crystal)/this.resources.prod.crystal)}${LocalizationStrings.timeunits.short.day})</span></div>\n                        <div class="ogl_deut ogl_todoDays">${Util.formatToUnits(this.resources.todo.deut)} <span>(${Math.ceil(Math.max(0,this.resources.todo.deut-this.resources.total.deut)/this.resources.prod.deut)}${LocalizationStrings.timeunits.short.day})</span></div>\n                    </div>\n                    <hr>\n                    <div>\n                        <h3 class="material-icons">globe_uk</h3>\n                        <div class="ogl_metal">${Util.formatToUnits(this.resources.ground.metal)}</div>\n                        <div class="ogl_crystal">${Util.formatToUnits(this.resources.ground.crystal)}</div>\n                        <div class="ogl_deut">${Util.formatToUnits(this.resources.ground.deut)}</div>\n                    </div>\n                    <div>\n                        <h3 class="material-icons">send</h3>\n                        <div class="ogl_metal">${Util.formatToUnits(this.resources.fly.metal)}</div>\n                        <div class="ogl_crystal">${Util.formatToUnits(this.resources.fly.crystal)}</div>\n                        <div class="ogl_deut">${Util.formatToUnits(this.resources.fly.deut)}</div>\n                    </div>\n                    <div>\n                        <h3 class="material-icons">sigma</h3>\n                        <div class="ogl_metal">${Util.formatToUnits(this.resources.total.metal)}</div>\n                        <div class="ogl_crystal">${Util.formatToUnits(this.resources.total.crystal)}</div>\n                        <div class="ogl_deut">${Util.formatToUnits(this.resources.total.deut)}</div>\n                    </div>\n                `, this.ogl._tooltip.update(e)
    })))
  }
}
class TopbarManager extends Manager {
  load(e) {
    this.topbar = Util.addDom("div", {
      class: "ogl_topbar",
      prepend: document.querySelector("#planetList")
    }), Util.addDom("i", {
      class: "material-icons tooltip",
      child: "conversion_path",
      title: this.ogl._lang.find("collectResources"),
      parent: this.topbar,
      onclick: e => {
        this.ogl.db.harvestCoords = !1, document.body.classList.toggle("ogl_destinationPicker"), document.body.classList.toggle("ogl_initHarvest")
      }
    }), Util.addDom("i", {
      class: "material-icons tooltip",
      child: "account_balance",
      parent: this.topbar,
      title: this.ogl._lang.find("accountSummary"),
      onclick: () => this.openAccount()
    }), Util.addDom("i", {
      class: "material-icons tooltip",
      child: "stroke_full",
      parent: this.topbar,
      title: this.ogl._lang.find("taggedPlanets"),
      onclick: () => this.openTagged(!0)
    }), Util.addDom("i", {
      class: "material-icons tooltip",
      child: "push_pin",
      parent: this.topbar,
      title: this.ogl._lang.find("pinnedPlayers"),
      onclick: () => this.openPinned(!0)
    }), Util.addDom("i", {
      class: "material-icons tooltip",
      child: "settings",
      parent: this.topbar,
      title: this.ogl._lang.find("oglSettings"),
      onclick: () => this.openSettings(!0)
    }), Util.addDom("a", {
      parent: this.topbar,
      class: "material-icons tooltip",
      child: "favorite",
      title: this.ogl._lang.find("coffee"),
      target: "_blank",
      href: "https://ko-fi.com/O4O22XV69"
    }), this.syncBtn = Util.addDom("i", {
      class: "material-icons tooltip",
      child: "directory_sync",
      title: this.ogl._lang.find("syncEmpire"),
      parent: this.topbar,
      onclick: () => {
        this.ogl._fetch.fetchValue = 0, this.ogl._fetch.fetchLFBonuses(), this.ogl._fetch.fetchEmpire(), this.ogl._fetch.fetchProductionQueue()
      }
    }), e || (isNaN(this.ogl.db.currentSide) ? "settings" == this.ogl.db.currentSide ? this.openSettings() : "pinned" == this.ogl.db.currentSide ? this.openPinned() : "tagged" == this.ogl.db.currentSide && this.openTagged() : this.openPinnedDetail(this.ogl.db.currentSide)), Util.addDom("button", {
      class: "ogl_button",
      child: this.ogl._lang.find("siblingPlanetMoon"),
      parent: this.topbar,
      onclick: () => {
        if (this.ogl.currentPlanet.obj.planetID || this.ogl.currentPlanet.obj.moonID) window.location.href = `?page=ingame&component=fleetdispatch&oglmode=2`;
        else {
          let e = "planet" == this.ogl.planetType ? this.ogl.currentPlanet.dom.nextWithMoon.getAttribute("id").replace("planet-", "") : this.ogl.currentPlanet.dom.nextWithMoon.querySelector(".moonlink").getAttribute("href").match(/cp=(\d+)/)[1];
          window.location.href = `?page=ingame&component=fleetdispatch&cp=${e}&oglmode=2`
        }
      }
    })
  }
  openAccount() {
    const e = Util.addDom("div", {
        class: "ogl_empire"
      }),
      t = document.querySelectorAll(".smallplanet").length,
      n = {
        fieldUsed: 0,
        fieldMax: 0,
        fieldLeft: 0,
        temperature: 0,
        metal: 0,
        crystal: 0,
        deut: 0,
        prodmetal: 0,
        prodcrystal: 0,
        proddeut: 0
      };
    Util.addDom("div", {
      class: "ogl_invisible",
      parent: e
    }), Util.addDom("div", {
      class: "ogl_invisible",
      parent: e
    }), Util.addDom("div", {
      class: "ogl_invisible",
      parent: e
    }), Util.addDom("div", {
      class: "ogl_invisible",
      parent: e
    }), Util.addDom("div", {
      class: "ogl_invisible",
      parent: e
    }), Util.addDom("div", {
      class: "ogl_invisible",
      parent: e
    }), Util.addDom("div", {
      class: "ogl_invisible",
      parent: e
    }), Util.addDom("div", {
      class: "ogl_icon ogl_metal",
      parent: e
    }), Util.addDom("div", {
      class: "ogl_icon ogl_crystal",
      parent: e
    }), Util.addDom("div", {
      class: "ogl_icon ogl_deut",
      parent: e
    }), Util.addDom("div", {
      child: "Coords",
      parent: e
    }), Util.addDom("div", {
      child: "P",
      parent: e
    }), Util.addDom("div", {
      child: "M",
      parent: e
    }), Util.addDom("div", {
      child: "Name",
      parent: e
    }), Util.addDom("div", {
      child: "Fields",
      parent: e
    }), Util.addDom("div", {
      child: "T°c",
      parent: e
    }), Util.addDom("div", {
      child: "LF",
      parent: e
    });
    let o = Util.addDom("div", {
        class: "ogl_metal",
        parent: e
      }),
      a = Util.addDom("div", {
        class: "ogl_crystal",
        parent: e
      }),
      i = Util.addDom("div", {
        class: "ogl_deut",
        parent: e
      });
    document.querySelectorAll(".smallplanet").forEach((t => {
      const o = t.getAttribute("id").replace("planet-", ""),
        a = this.ogl.db.myPlanets[o],
        i = t.querySelector(".planet-name").innerText;
      let r = Util.addDom("div", {
        parent: e,
        "data-galaxy": a.coords,
        child: a.coords
      });
      t.getAttribute("data-group") && r.setAttribute("data-group", t.getAttribute("data-group")), Util.addDom("a", {
        parent: e,
        href: t.querySelector(".planetlink").getAttribute("href"),
        child: Util.addDom("img", {
          src: t.querySelector(".planetPic").getAttribute("src")
        })
      }), t.querySelector(".moonlink") ? Util.addDom("a", {
        parent: e,
        href: t.querySelector(".moonlink").getAttribute("href"),
        child: Util.addDom("img", {
          src: t.querySelector(".moonlink img").getAttribute("src")
        })
      }) : Util.addDom("div", {
        class: "ogl_invisible",
        parent: e
      }), Util.addDom("div", {
        parent: e,
        child: i
      }), Util.addDom("div", {
        parent: e,
        child: `${a.fieldUsed}/${a.fieldMax} (<span>${a.fieldMax-a.fieldUsed}</span>)`
      }), n.fieldUsed += a.fieldUsed, n.fieldMax += a.fieldMax, n.fieldLeft += a.fieldMax - a.fieldUsed;
      let l = Util.addDom("div", {
        parent: e,
        child: a.temperature + 40 + "°C"
      });
      n.temperature += a.temperature + 40, a.temperature >= 110 ? l.style.color = "#af644d" : a.temperature >= 10 ? l.style.color = "#af9e4d" : a.temperature >= -40 ? l.style.color = "#4daf67" : a.temperature >= -140 ? l.style.color = "#4dafa6" : l.style.color = "#4d79af", Util.addDom("div", {
        class: `ogl_icon ogl_lifeform${a.lifeform||0}`,
        parent: e
      });
      let s = Util.addDom("div", {
        class: "ogl_metal",
        parent: e,
        child: `<strong>${a[1]}</strong><small>+${Util.formatToUnits(Math.round(3600*(a.prodmetal||0)*24))}</small>`
      });
      a.upgrades?.baseBuilding?.[0]?.name.trim() == this.ogl.db.serverData[1] && serverTime.getTime() < a.upgrades?.baseBuilding?.[0].end && (s.querySelector("strong").innerHTML += `<span>${a[1]+1}</span>`);
      let d = Util.addDom("div", {
        class: "ogl_crystal",
        parent: e,
        child: `<strong>${a[2]}</strong><small>+${Util.formatToUnits(Math.round(3600*(a.prodcrystal||0)*24))}</small>`
      });
      a.upgrades?.baseBuilding?.[0]?.name.trim() == this.ogl.db.serverData[2] && serverTime.getTime() < a.upgrades?.baseBuilding?.[0].end && (d.querySelector("strong").innerHTML += `<span>${a[2]+1}</span>`);
      let c = Util.addDom("div", {
        class: "ogl_deut",
        parent: e,
        child: `<strong>${a[3]}</strong><small>+${Util.formatToUnits(Math.round(3600*(a.proddeut||0)*24))}</small>`
      });
      n.metal += a[1], n.crystal += a[2], n.deut += a[3], n.prodmetal += a.prodmetal || 0, n.prodcrystal += a.prodcrystal || 0, n.proddeut += a.proddeut || 0, a.upgrades?.baseBuilding?.[0]?.name.trim() == this.ogl.db.serverData[3] && serverTime.getTime() < a.upgrades?.baseBuilding?.[0].end && (c.querySelector("strong").innerHTML += `<span>${a[3]+1}</span>`)
    })), o.innerHTML = `<strong>${(n.metal/t).toFixed(1)}</strong><small>+${Util.formatToUnits(Math.round(3600*(n.prodmetal||0)*24))}</small>`, a.innerHTML = `<strong>${(n.crystal/t).toFixed(1)}</strong><small>+${Util.formatToUnits(Math.round(3600*(n.prodcrystal||0)*24))}</small>`, i.innerHTML = `<strong>${(n.deut/t).toFixed(1)}</strong><small>+${Util.formatToUnits(Math.round(3600*(n.proddeut||0)*24))}</small>`, this.ogl._popup.open(e, !0)
  }
  openStats() {
    Util.runAsync((() => this.ogl._stats.buildStats(!1, !1))).then((e => this.ogl._popup.open(e, !0)))
  }
  openSettings(e) {
    const t = Util.addDom("div", {
      class: "ogl_config",
      child: '<h2>Settings<i class="material-icons">settings</i></h2>'
    });
    let n;
    ["defaultShip", "defaultMission", "profileButton", "resourceTreshold", "msu", "sim", "converter", "useClientTime", "keyboardActions", "showMenuResources", "tooltipDelay", "shortcutsOnRight", "disablePlanetTooltips", "reduceLargeImages", "displayPlanetTimers", "expeditionValue", "expeditionRandomSystem", "expeditionRedirect", "expeditionBigShips", "expeditionShipRatio", "ignoreExpeShipsLoss", "ignoreConsumption", "displaySpyTable", "autoCleanReports", "boardTab", "ptreTeamKey", "ptreLogs", "manageData", "debugMode"].forEach((e => {
      const o = "boolean" == typeof this.ogl.db.options[e],
        a = typeof this.ogl.db.options[e] != typeof [] && ("number" == typeof this.ogl.db.options[e] || Number(this.ogl.db.options[e]));
      let i;
      this.ogl.db.options[e] || this.ogl.db.options[e], "defaultShip" == e ? n = "fleet" : "resourceTreshold" == e ? n = "general" : "showMenuResources" == e ? n = "interface" : "expeditionValue" == e ? n = "expeditions" : "expeditionShipRatio" == e ? n = "stats" : "displaySpyTable" == e ? n = "messages" : "ptreTeamKey" == e ? n = "PTRE" : "manageData" == e && (n = "data"), t.querySelector(`[data-container="${n}"]`) ? i = t.querySelector(`[data-container="${n}"]`) : (i = Util.addDom("div", {
        parent: t,
        "data-container": n
      }), this.ogl.db.configState[n] && i.classList.add("ogl_active"), Util.addDom("h3", {
        parent: i,
        child: n,
        onclick: () => {
          i.classList.contains("ogl_active") ? (i.classList.remove("ogl_active"), this.ogl.db.configState[i.getAttribute("data-container")] = !1) : (i.classList.add("ogl_active"), this.ogl.db.configState[i.getAttribute("data-container")] = !0)
        }
      }));
      const r = Util.addDom("label", {
          parent: i,
          "data-label": `${this.ogl._lang.find(e)}`
        }),
        l = this.ogl._lang.find(e + "TT");
      if ("TEXT_NOT_FOUND" != l && (r.classList.add("tooltipLeft"), r.setAttribute("title", l)), "defaultShip" == e) this.ogl.fretShips.forEach((e => {
        let t = Util.addDom("div", {
          parent: r,
          class: `ogl_icon ogl_${e}`,
          onclick: (t, n) => {
            this.ogl.db.options.defaultShip = e, r.querySelector(".ogl_active")?.classList.remove("ogl_active"), n.classList.add("ogl_active"), "fleetdispatch" == this.ogl.page && (document.querySelectorAll(".ogl_fav").forEach((e => e.remove())), Util.addDom("div", {
              class: "material-icons ogl_fav",
              child: "star",
              parent: document.querySelector(`[data-technology="${this.ogl.db.options.defaultShip}"] .ogl_shipFlag`)
            }))
          }
        });
        this.ogl.db.options.defaultShip == e && t.classList.add("ogl_active")
      }));
      else if ("defaultMission" == e)[3, 4].forEach((e => {
        let t = Util.addDom("div", {
          parent: r,
          class: `ogl_icon ogl_mission${e}`,
          onclick: (t, n) => {
            this.ogl.db.options.defaultMission = e, r.querySelector(".ogl_active")?.classList.remove("ogl_active"), n.classList.add("ogl_active")
          }
        });
        this.ogl.db.options.defaultMission == e && t.classList.add("ogl_active")
      }));
      else if ("profileButton" == e) r.innerHTML = '<button class="material-icons">transit_enterexit</button>', r.querySelector("button").addEventListener("click", (() => {
        Util.runAsync((() => this.ogl._ui.openFleetProfile())).then((e => this.ogl._popup.open(e)))
      }));
      else if ("msu" == e) {
        r.classList.add("tooltipLeft"), r.setAttribute("title", "Format:<br>metal:crystal:deut");
        const t = Util.addDom("input", {
          type: "text",
          placeholder: "m:c:d",
          value: this.ogl.db.options[e],
          parent: r,
          oninput: () => {
            t.value && !/^[0-9]*[.]?[0-9]+:[0-9]*[.]?[0-9]+:[0-9]*[.]?[0-9]+$/.test(t.value) ? t.classList.add("ogl_danger") : (t.classList.remove("ogl_danger"), this.ogl.db.options[e] = t.value.match(/^[0-9]*[.]?[0-9]+:[0-9]*[.]?[0-9]+:[0-9]*[.]?[0-9]+$/)[0])
          }
        })
      }
      else if ("showMenuResources" == e) {
        r.innerHTML = "";
        const t = Util.addDom("select", {
          parent: r,
          onchange: () => {
            this.ogl.db.options[e] = parseInt(t.value), localStorage.setItem("ogl_menulayout", this.ogl.db.options[e]), document.body.setAttribute("data-menulayout", t.value)
          }
        });
        ["All", "Coords", "Resources"].forEach(((n, o) => {
          const a = Util.addDom("option", {
            parent: t,
            child: n,
            value: o
          });
          this.ogl.db.options[e] == o && (a.selected = !0)
        }))
      }
      else if (o && "sim" != e) {
        if ("boardTab" == e && "fr" != this.ogl.server.lang) return void r.remove();
        const t = Util.addDom("input", {
          type: "checkbox",
          parent: r,
          onclick: () => {
            this.ogl.db.options[e] = !this.ogl.db.options[e], t.checked = this.ogl.db.options[e], "ignoreExpeShipsLoss" == e && this.ogl.db.options.displayMiniStats || "ignoreConsumption" == e && this.ogl.db.options.displayMiniStats ? this.ogl._stats.miniStats() : "displayPlanetTimers" == e ? document.querySelector("#planetList").classList.toggle("ogl_alt") : "reduceLargeImages" == e ? (localStorage.setItem("ogl_minipics", this.ogl.db.options[e]), document.body.setAttribute("data-minipics", this.ogl.db.options[e])) : "displaySpyTable" == e && this.ogl._message?.spytable && 20 == this.ogl._message?.tabID && (this.ogl.db.options[e] ? this.ogl._message.spytable.classList.remove("ogl_hidden") : this.ogl._message.spytable.classList.add("ogl_hidden"))
          }
        });
        this.ogl.db.options[e] && (t.checked = !0)
      }
      else if (a) {
        const t = Util.addDom("input", {
          class: "ogl_inputCheck",
          type: "text",
          value: this.ogl.db.options[e],
          parent: r,
          oninput: () => {
            setTimeout((() => {
              "expeditionShipRatio" == e && (parseInt(t.value.replace(/\D/g, "")) < 0 ? t.value = 0 : parseInt(t.value.replace(/\D/g, "")) > 100 && (t.value = 100)), this.ogl.db.options[e] = parseInt(t.value.replace(/\D/g, "")) || !1, "expeditionShipRatio" == e && this.ogl._stats.miniStats()
            }), 200)
          }
        });
        "expeditionValue" == e && (t.classList.add("ogl_placeholder"), t.setAttribute("placeholder", `(${Util.formatNumber(this.ogl.calcExpeditionMax().max)})`))
      }
      else if ("keyboardActions" == e) r.innerHTML = '<button class="material-icons">keyboard_alt</button>', r.querySelector("button").addEventListener("click", (() => {
        Util.runAsync((() => this.ogl._ui.openKeyboardActions())).then((e => this.ogl._popup.open(e)))
      }));
      else if ("sim" == e || "converter" == e) {
        const t = "sim" == e ? Util.simList : Util.converterList;
        r.innerHTML = "";
        const n = Util.addDom("select", {
          parent: r,
          child: '<option value="false" selected disabled>-</option>',
          onchange: () => {
            this.ogl.db.options[e] = n.value
          }
        });
        Object.entries(t).forEach((t => {
          const o = Util.addDom("option", {
            parent: n,
            child: t[0],
            value: t[0]
          });
          this.ogl.db.options[e] == t[0] && (o.selected = !0)
        }))
      }
      else if ("expeditionBigShips" == e) r.innerHTML = '<button class="material-icons">rocket</button>', r.querySelector("button").addEventListener("click", (() => {
        Util.runAsync((() => this.ogl._ui.openExpeditionFiller())).then((e => this.ogl._popup.open(e)))
      }));
      else if ("displayMiniStats" == e) r.innerHTML = '<div class="ogl_choice" data-limiter="day">D</div><div class="ogl_choice" data-limiter="week">W</div><div class="ogl_choice" data-limiter="month">M</div>', r.querySelectorAll("div").forEach((t => {
        t.addEventListener("click", (() => {
          this.ogl.db.options[e] = t.getAttribute("data-limiter"), this.ogl._stats.miniStats(), r.querySelector(".ogl_active") && r.querySelector(".ogl_active").classList.remove("ogl_active"), t.classList.add("ogl_active")
        })), t.getAttribute("data-limiter") == this.ogl.db.options[e] && t.classList.add("ogl_active")
      }));
      else if ("ptreTeamKey" == e) {
        r.classList.add("tooltipLeft"), r.setAttribute("title", "Format:<br>TM-XXXX-XXXX-XXXX-XXXX");
        const e = Util.addDom("input", {
          type: "password",
          placeholder: "TM-XXXX-XXXX-XXXX-XXXX",
          value: localStorage.getItem("ogl-ptreTK") || "",
          parent: r,
          oninput: () => {
            !e.value || 18 == e.value.replace(/-/g, "").length && 0 == e.value.indexOf("TM") ? (e.classList.remove("ogl_danger"), localStorage.setItem("ogl-ptreTK", e.value), this.ogl.ptreKey = e.value) : e.classList.add("ogl_danger")
          },
          onfocus: () => e.type = "text",
          onblur: () => e.type = "password"
        })
      }
      else "ptreLogs" == e ? (r.innerHTML = '<button class="material-icons">bug</button>', r.querySelector("button").addEventListener("click", (() => {
        this.ogl.PTRE.displayLogs()
      }))) : "manageData" == e && (r.innerHTML = '<button class="material-icons">database</button>', r.querySelector("button").addEventListener("click", (() => {
        Util.runAsync((() => this.ogl._ui.openDataManager())).then((e => this.ogl._popup.open(e)))
      })))
    })), this.ogl._ui.openSide(t, "settings", e)
  }
  openPinned(e) {
    this.ogl._ui.openSide(Util.addDom("div", {
      class: "ogl_loading"
    }), "pinned", e), Util.runAsync((() => {
      const e = Util.addDom("div", {
          class: "ogl_pinned",
          child: '<h2>Pinned players<i class="material-icons">push_pin</i></h2>'
        }),
        t = Util.addDom("div", {
          class: "ogl_tabs ogl_flagSelector material-icons",
          parent: e
        }),
        n = Util.addDom("div", {
          class: "ogl_list",
          parent: e
        });
      this.ogl.flagsList.forEach((e => {
        if ("none" != e) {
          const o = Util.addDom("div", {
            parent: t,
            "data-flag": e,
            onclick: () => {
              if (n.innerText = "", t.querySelector("[data-flag].ogl_active")?.classList.remove("ogl_active"), o.classList.add("ogl_active"), this.ogl.db.lastPinTab = e, "ptre" == e && this.ogl.ptreKey) {
                const e = Util.addDom("div", {
                  class: "ogl_grid",
                  parent: n
                });
                Util.addDom("button", {
                  class: "ogl_button",
                  child: this.ogl._lang.find("ptreSyncTarget"),
                  parent: e,
                  onclick: () => {
                    this.ogl.PTRE.syncTargetList()
                  }
                }), Util.addDom("button", {
                  class: "ogl_button",
                  child: this.ogl._lang.find("ptreManageTarget"),
                  parent: e,
                  onclick: () => {
                    window.open(this.ogl.PTRE.manageSyncedListUrl, "_blank")
                  }
                }), Util.addDom("hr", {
                  parent: n
                })
              }
              Object.values(this.ogl.db.udb).filter((e => e.pin == this.ogl.db.lastPinTab)).forEach((e => {
                e.uid && this.addPinnedItemToList(e, n)
              })), n.querySelector("[data-uid]") || n.querySelector(".ogl_button") || (n.innerHTML = `<p class="ogl_emptyList">${this.ogl._lang.find("emptyPlayerList")}</p>`)
            }
          });
          e == this.ogl.db.lastPinTab && o.click()
        }
      }));
      const o = Util.addDom("div", {
        "data-flag": "recent",
        parent: t,
        onclick: () => {
          this.ogl.db.lastPinTab = "recent", n.innerText = "", t.querySelector("[data-flag].ogl_active")?.classList.remove("ogl_active"), o.classList.add("ogl_active"), this.ogl.db.lastPinnedList.forEach((e => {
            const t = this.ogl.db.udb[e];
            t.uid && this.addPinnedItemToList(t, n)
          })), n.querySelector("[data-uid]") || (n.innerText = this.ogl._lang.find("emptyPlayerList"))
        }
      });
      return "recent" == this.ogl.db.lastPinTab && o.click(), e
    })).then((t => this.ogl._ui.openSide(t, "pinned", e)))
  }
  addPinnedItemToList(e, t) {
    const n = Util.addDom("div", {
        parent: t
      }),
      o = Util.addDom("span", {
        class: `tooltipLeft tooltipClose tooltipUpdate ${e.status||"status_abbr_active"}`,
        parent: n,
        child: "string" == typeof e.name ? e.name : "?"
      });
    this.ogl._ui.turnIntoPlayerLink(e.uid, o);
    const a = Math.max(1, Math.ceil((e.score?.globalRanking || 100) / 100)),
      i = Util.addDom("a", {
        class: "ogl_ranking",
        href: `?page=highscore&site=${a}&searchRelId=${e.uid}`,
        child: "#" + e.score?.globalRanking || "?"
      });
    Util.addDom("div", {
      parent: n,
      child: i.outerHTML
    }), this.ogl._ui.addPinButton(n, e.uid), Util.addDom("i", {
      class: "material-icons",
      parent: n,
      child: "delete",
      onclick: () => {
        this.ogl.db.lastPinnedList.splice(this.ogl.db.lastPinnedList.findIndex((t => t == e.uid)), 1), n.remove(), delete this.ogl.db.udb[e.uid].pin
      }
    })
  }
  openPinnedDetail(e, t) {
    e = parseInt(e), this.ogl._ui.openSide(Util.addDom("div", {
      class: "ogl_loading"
    }), e);
    const n = () => {
      const n = this.ogl.db.udb[e];
      if (!n) return;
      const o = Util.addDom("div", {
        class: "ogl_pinDetail"
      });
      Util.addDom("div", {
        parent: o,
        class: "material-icons ogl_back",
        child: "arrow_back",
        onclick: () => {
          this.openPinned()
        }
      });
      const a = Util.addDom("h2", {
          class: n.status || "status_abbr_active",
          parent: o,
          child: n.name
        }),
        i = Util.addDom("div", {
          class: "ogl_score",
          parent: o
        }),
        r = Util.addDom("div", {
          class: "ogl_actions",
          parent: o
        }),
        l = Util.addDom("div", {
          class: "ogl_list",
          parent: o
        });
      this.ogl._ui.addPinButton(a, e);
      const s = Util.addDom("div", {
        child: "edit",
        class: "material-icons ogl_button",
        parent: r,
        onclick: () => {
          document.querySelector("#chatBar") || (window.location.href = `?page=chat&playerId=${e}`)
        }
      });
      document.querySelector("#chatBar") && (s.classList.add("js_openChat"), s.setAttribute("data-playerId", e)), Util.addDom("a", {
        child: "account-plus",
        class: "material-icons ogl_button overlay",
        parent: o.querySelector(".ogl_actions"),
        href: `?page=ingame&component=buddies&action=7&id=${e}&ajax=1`,
        onclick: () => {
          this.ogl._tooltip.close()
        }
      }), Util.addDom("div", {
        child: "block",
        class: "material-icons ogl_button",
        parent: r,
        onclick: () => {
          window.location.href = `?page=ignorelist&action=1&id=${e}`
        }
      }), Util.addDom("div", {
        child: "query_stats",
        class: "material-icons ogl_button",
        parent: r,
        onclick: () => {
          window.open(Util.genMmorpgstatLink(this.ogl, e), "_blank")
        }
      }), Util.addDom("div", {
        child: "ptre",
        class: "material-icons ogl_button",
        parent: r,
        onclick: () => {
          this.ogl.PTRE.getPlayerInfo({
            name: n.name,
            id: e
          })
        }
      }), Util.addDom("div", {
        child: "sync",
        class: "material-icons ogl_button",
        parent: r,
        onclick: () => {
          this.ogl.PTRE.getPlayerPositions({
            name: n.name,
            id: e
          })
        }
      }), this.ogl.db.lastPinnedList = Array.from(new Set([e, ...this.ogl.db.lastPinnedList].map(Number))), this.ogl.db.lastPinnedList.length > 30 && (this.ogl.db.lastPinnedList.length = 30), t || (Util.addDom("div", {
        class: "ogl_loading",
        parent: o
      }), this.ogl._ui.openSide(o, e), this.ogl.PTRE.getPlayerPositions({
        name: n.name,
        id: e
      }));
      const d = Math.max(1, Math.ceil((n.score?.globalRanking || 100) / 100)),
        c = Util.addDom("a", {
          class: "ogl_ranking",
          href: `?page=highscore&site=${d}&searchRelId=${n.uid}`,
          child: "#" + n.score?.globalRanking || "?"
        });
      a.innerHTML = `${n.name} ${c.outerHTML}`, this.ogl._ui.addPinButton(a, e), i.innerHTML = `\n                <div class="ogl_line"><i class="material-icons">trending_up</i><div>${Util.formatNumber(n.score?.global)}</div></div>\n                <div class="ogl_line"><i class="material-icons">diamond</i><div>${Util.formatNumber(n.score?.economy)}</div></div>\n                <div class="ogl_line"><i class="material-icons">science</i><div>${Util.formatNumber(n.score?.research)}</div></div>\n                <div class="ogl_line"><i class="material-icons">genetics</i><div>${Util.formatNumber(n.score?.lifeform)}</div></div>\n                <div class="ogl_line"><i class="material-icons">rocket_launch</i><div>${Util.formatNumber(Util.getPlayerScoreFD(n.score,"fleet"))}</div></div>\n                <div class="ogl_line"><i class="material-icons">security</i><div>${Util.formatNumber(Util.getPlayerScoreFD(n.score,"defense"))}</div></div>\n            `;
      let p = 0,
        g = 1,
        u = 1;
      n.planets.sort(((e, t) => Util.coordsToID(e) - Util.coordsToID(t))).forEach((e => {
        const t = this.ogl.db.pdb[e];
        if (!t) return;
        const n = new Date(t.api),
          o = Math.floor((serverTime.getTime() - n) / 864e5),
          a = Math.round((serverTime.getTime() - n % 864e5) % 36e5 / 6e4),
          i = Util.addDom("div", {
            parent: l
          });
        t.home && i.classList.add("ogl_home");
        let r = Util.coordsToID(t.coo).slice(0, -3);
        p === r ? i.setAttribute("data-group", g) : i.previousElementSibling?.getAttribute("data-group") && g++, p = r, Util.addDom("div", {
          child: u,
          parent: i
        }), Util.addDom("div", {
          child: t.coo,
          parent: i,
          "data-galaxy": t.coo
        }), Util.addDom("div", {
          class: "tooltip",
          title: "Debris<br>" + Util.formatNumber(t.debris || 0),
          child: Util.formatToUnits(t.debris || 0),
          parent: i
        }), this.ogl._ui.addSpyIcons(i, t.coo.split(":"), !1, !0);
        let s = o || 0 === o ? o > 0 ? `${o}${LocalizationStrings.timeunits.short.hour} ago` : `${a}${LocalizationStrings.timeunits.short.minute} ago` : "?";
        const d = Util.addDom("date", {
          class: "tooltipLeft",
          child: s,
          title: `<span>${n.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}</span> <span>${n.toLocaleTimeString("de-DE")}</span>`,
          parent: i
        });
        o >= 5 ? d.classList.add("ogl_danger") : o >= 3 && d.classList.add("ogl_warning"), u += 1
      })), this.ogl._ui.openSide(o, e), setTimeout((() => this.ogl._shortcut.load()), 50), this.ogl._galaxy.checkCurrentSystem()
    };
    Util.runAsync((() => {
      this.ogl._fetch.fetchPlayerAPI(e, !1, (() => n()))
    }))
  }
  openTagged(e) {
    this.ogl._ui.openSide(Util.addDom("div", {
      class: "ogl_loading"
    }), "tagged"), Util.runAsync((() => {
      const e = Util.addDom("div", {
          class: "ogl_tagged",
          child: '<h2>Tagged planets<i class="material-icons">stroke_full</i></h2>'
        }),
        t = Util.addDom("div", {
          class: "ogl_tabs ogl_tagSelector material-icons",
          parent: e
        }),
        n = Util.addDom("div", {
          class: "ogl_actions",
          parent: e
        });
      Util.addDom("hr", {
        parent: e
      });
      const o = Util.addDom("div", {
          class: "ogl_list",
          parent: e,
          child: '<p class="ogl_emptyList">Select a galaxy/system range</p>'
        }),
        a = () => {
          const e = Util.coordsToID(`${r.value}:${l.value}:000`),
            t = Util.coordsToID(`${s.value}:${d.value}:000`),
            n = this.getTaggedItems(e, t);
          if (o.innerText = "", n.length < 1) Util.addDom("p", {
            child: "No result",
            parent: o
          });
          else {
            let e = !1,
              t = [];
            n.forEach(((n, a) => {
              const i = n.match(/.{1,3}/g).map(Number).join(":"),
                r = Util.coordsToID(i),
                l = Util.addDom("div", {
                  parent: o
                });
              Util.addDom("div", {
                child: a + 1,
                parent: l
              }), Util.addDom("div", {
                child: i,
                "data-galaxy": i,
                parent: l
              });
              const c = Util.addDom("div", {
                class: "material-icons tooltip ogl_nextQuickTarget",
                title: "Select as next quick raid target",
                child: "swords",
                parent: l,
                onclick: () => {
                  const e = Util.coordsToID(i),
                    t = Util.coordsToID(`${s.value}:${d.value}:000`);
                  this.getTaggedItems(e, t, !0), this.ogl.db.quickRaidList = this.tmpRaidList, this.ogl._notification.addToQueue(`You can now use [${this.ogl.db.options.keyboardActions.quickRaid}] on fleet page to attack next target`, !0), setTimeout((() => this.ogl._shortcut.load()), 50), o.querySelectorAll(".ogl_nextQuickTarget.ogl_active").forEach((e => e.classList.remove("ogl_active"))), c.classList.add("ogl_active")
                }
              });
              this.ogl.db.quickRaidList && this.ogl.db.quickRaidList?.[0] == r && (c.classList.add("ogl_active"), e = !0), e && t.push(r), this.ogl._ui.addSpyIcons(l, i), this.ogl._ui.addTagButton(l, i)
            })), this.ogl.db.quickRaidList = e ? t : []
          }
        };
      Object.keys(this.ogl.db.tags).forEach((e => {
        if ("none" != e) {
          const n = Util.addDom("div", {
            parent: t,
            "data-tag": e,
            onclick: () => {
              this.ogl.db.tags[e] ? (this.ogl.db.tags[e] = !1, n.classList.add("ogl_off")) : (this.ogl.db.tags[e] = !0, n.classList.remove("ogl_off"))
            }
          });
          this.ogl.db.tags[e] || n.classList.add("ogl_off")
        }
      }));
      const i = this.ogl.currentPlanet.obj.coords.split(":"),
        r = Util.addDom("input", {
          type: "text",
          min: "1",
          max: "10",
          parent: n,
          value: this.ogl.db.lastTaggedInput[0] || i[0],
          onblur: e => e.target.value = e.target.value || 1,
          oninput: () => g()
        }),
        l = Util.addDom("input", {
          type: "text",
          min: "1",
          max: "499",
          parent: n,
          value: this.ogl.db.lastTaggedInput[1] || i[1],
          onblur: e => e.target.value = e.target.value || 1,
          oninput: () => g()
        });
      Util.addDom("div", {
        class: "material-icons",
        child: "arrow_right_alt",
        parent: n
      });
      const s = Util.addDom("input", {
          type: "text",
          min: "1",
          max: "10",
          parent: n,
          value: this.ogl.db.lastTaggedInput[2] || 1,
          onblur: e => e.target.value = e.target.value || 1,
          oninput: () => g()
        }),
        d = Util.addDom("input", {
          type: "text",
          min: "1",
          max: "499",
          parent: n,
          value: this.ogl.db.lastTaggedInput[3] || 1,
          onblur: e => e.target.value = e.target.value || 1,
          oninput: () => g()
        }),
        c = Util.addDom("label", {
          class: "status_abbr_noob",
          parent: n,
          child: this.ogl._lang.find("noob") + '<input class="ogl_hidden" type="checkbox">',
          onclick: () => {
            setTimeout((() => {
              this.ogl.db.lastTaggedInput[4] = c.querySelector("input").checked, this.ogl.db.lastTaggedInput[4] ? c.classList.remove("ogl_off") : c.classList.add("ogl_off"), a()
            }), 50)
          }
        }),
        p = Util.addDom("label", {
          class: "status_abbr_vacation",
          parent: n,
          child: this.ogl._lang.find("vacation") + '<input class="ogl_hidden" type="checkbox">',
          onclick: () => {
            setTimeout((() => {
              this.ogl.db.lastTaggedInput[5] = p.querySelector("input").checked, this.ogl.db.lastTaggedInput[5] ? p.classList.remove("ogl_off") : p.classList.add("ogl_off"), a()
            }), 50)
          }
        });
      Util.addDom("div", {
        class: "material-icons ogl_button",
        parent: n,
        child: "search",
        onclick: () => a()
      }), this.ogl.db.lastTaggedInput[0] && this.ogl.db.lastTaggedInput[1] && this.ogl.db.lastTaggedInput[2] && this.ogl.db.lastTaggedInput[3] && a(), this.ogl.db.lastTaggedInput[4] ? c.querySelector("input").checked = !0 : c.classList.add("ogl_off"), this.ogl.db.lastTaggedInput[5] ? p.querySelector("input").checked = !0 : p.classList.add("ogl_off");
      const g = () => {
        this.timeout && clearTimeout(this.timeout), this.ogl.db.lastTaggedInput[0] = r.value, this.ogl.db.lastTaggedInput[1] = l.value, this.ogl.db.lastTaggedInput[2] = s.value, this.ogl.db.lastTaggedInput[3] = d.value
      };
      return e
    })).then((t => {
      this.ogl._ui.openSide(t, "tagged", e), setTimeout((() => this.ogl._shortcut.load()), 50)
    }))
  }
  getTaggedItems(e, t, n) {
    e = parseInt(e), t = parseInt(t);
    const o = this.ogl.db.lastTaggedInput[4],
      a = this.ogl.db.lastTaggedInput[5];
    return n || (e <= t ? t += 15 : e += 15), this.tmpRaidList = Object.keys(this.ogl.db.tdb).sort(((n, o) => e <= t ? n - o : o - n)).filter((n => {
      const i = n.match(/.{1,3}/g).map(Number).join(":"),
        r = this.ogl.db.udb[this.ogl.db.pdb[i]?.uid]?.status;
      return this.ogl.db.tags[this.ogl.db.tdb[n].tag] && (e <= t ? n >= e && n <= t : n <= e && n >= t) && (o || !r || !o && r?.indexOf("noob") < 0) && (a || !r || !a && r?.indexOf("vacation") < 0 && r?.indexOf("banned") < 0)
    })), this.tmpRaidList
  }
  checkUpgrade() {
    this.PlanetBuildingtooltip = this.PlanetBuildingtooltip || {}, document.querySelectorAll(".planetlink, .moonlink").forEach((e => {
      e.querySelector(".ogl_buildIconList") && (e.querySelector(".ogl_buildIconList").innerText = "");
      const t = new URLSearchParams(e.getAttribute("href")).get("cp").split("#")[0];
      e.classList.contains("moonlink");
      this.PlanetBuildingtooltip[t] = Util.addDom("ul", {
        class: "ogl_buildList"
      });
      let n = !1,
        o = !1,
        a = !1;
      this.ogl.db.myPlanets[t] = this.ogl.db.myPlanets[t] || {}, Object.values(this.ogl.db.myPlanets[t].upgrades || {}).forEach((e => {
        let i = !1;
        e?.id || e.forEach((e => {
          serverTime.getTime() < e.end && (i || (i = !0, Util.addDom("li", {
            parent: this.PlanetBuildingtooltip[t],
            child: `<i class="material-icons">fiber_manual_record</i><span class="ogl_slidingText" data-text="${e.name}"></span><i class="material-icons">east</i><b>${e.lvl}</b>`
          }), "baseBuilding" == e.type || "baseResearch" == e.type ? n = !0 : "ship" == e.type || "def" == e.type || "mechaShip" == e.type ? o = !0 : "lfBuilding" != e.type && "lfResearch" != e.type || (a = !0)))
        }))
      }));
      const i = Util.addDom("div", {
        class: "ogl_buildIconList",
        parent: e
      });
      n && Util.addDom("div", {
        class: "ogl_buildIcon material-icons",
        child: "stat_0",
        parent: i
      }), o && Util.addDom("div", {
        class: "ogl_buildIcon ogl_baseShip material-icons",
        child: "stat_0",
        parent: i
      }), a && Util.addDom("div", {
        class: "ogl_buildIcon ogl_lfBuilding material-icons",
        child: "stat_0",
        parent: i
      })
    }))
  }
}
class FleetManager extends Manager {
  load() {
    if (this.spyReady = !0, this.validationReady = !0, this.spyInterval, this.updateSpyFunctions(), "fleetdispatch" == this.ogl.page) {
      this.totalCapacity = 0, this.capacityWrapper = Util.addDom("div", {
        class: "capacityProgress",
        parent: document.querySelector("#fleet1 .content"),
        onclick: () => document.querySelector(`.ogl_requiredShips .ogl_${this.ogl.db.options.defaultShip}`).click()
      }), this.capacityBar = Util.addDom("progress", {
        "data-capacity": "",
        max: 100,
        value: 0,
        parent: this.capacityWrapper
      }), this.resOnPlanet = {
        metal: "metalOnPlanet",
        crystal: "crystalOnPlanet",
        deut: "deuteriumOnPlanet",
        food: "foodOnPlanet"
      }, this.cargo = {
        metal: "cargoMetal",
        crystal: "cargoCrystal",
        deut: "cargoDeuterium",
        food: "cargoFood"
      }, this.initialTarget = JSON.parse(JSON.stringify(targetPlanet));
      let e = setInterval((() => {
        if (unsafeWindow.fleetDispatcher && (this.setRealTarget(this.initialTarget), JSON.stringify(fleetDispatcher.realTarget) == JSON.stringify(fleetDispatcher.currentPlanet) && this.setRealTarget(fleetDispatcher.realTarget, {
            type: 1 == fleetDispatcher.realTarget.type ? 3 : 1
          }), fleetDispatcher.targetPlanet = fleetDispatcher.realTarget, this.initialResOnPlanet = {
            metal: fleetDispatcher.metalOnPlanet,
            crystal: fleetDispatcher.crystalOnPlanet,
            deut: fleetDispatcher.deuteriumOnPlanet,
            food: fleetDispatcher.foodOnPlanet
          }, this.initialShipsOnPlanet = JSON.parse(JSON.stringify(fleetDispatcher.shipsOnPlanet)), this.overwrited || this.overwrite(), !fleetDispatcher.fetchTargetPlayerDataTimeout))
          if (unsafeWindow.shipsData && fleetDispatcher?.fleetHelper?.shipsData) this.init(), clearInterval(e);
          else {
            let t = {};
            fleetDispatcher.appendShipParams(t), fleetDispatcher.appendTargetParams(t), fleetDispatcher.appendTokenParams(t), t.union = fleetDispatcher.union, $.post(fleetDispatcher.checkTargetUrl, t, (t => {
              let n = JSON.parse(t);
              fleetDispatcher.fleetHelper.shipsData = n.shipsData, fleetDispatcher.updateToken(n.newAjaxToken), this.init(), clearInterval(e)
            }))
          }
      }), 50)
    }
  }
  overwrite() {
    this.overwrited = !0, fleetDispatcher.fleetHelper.getShipData = e => shipsData[e], fleetDispatcher.refreshDataAfterAjax = e => {
      fleetDispatcher.setOrders(e.orders), fleetDispatcher.mission = 0, fleetDispatcher.setTargetInhabited(e.targetInhabited), fleetDispatcher.setTargetPlayerId(e.targetPlayerId), fleetDispatcher.setTargetPlayerName(e.targetPlayerName), fleetDispatcher.setTargetIsStrong(e.targetIsStrong), fleetDispatcher.setTargetIsOutlaw(e.targetIsOutlaw), fleetDispatcher.setTargetIsBuddyOrAllyMember(e.targetIsBuddyOrAllyMember), fleetDispatcher.setTargetPlayerColorClass(e.targetPlayerColorClass), fleetDispatcher.setTargetPlayerRankIcon(e.targetPlayerRankIcon), fleetDispatcher.setPlayerIsOutlaw(e.playerIsOutlaw), fleetDispatcher.targetPlanet.galaxy = e.targetPlanet.galaxy, fleetDispatcher.targetPlanet.system = e.targetPlanet.system, fleetDispatcher.targetPlanet.position = e.targetPlanet.position, fleetDispatcher.targetPlanet.type = e.targetPlanet.type, fleetDispatcher.targetPlanet.name = e.targetPlanet.name, this.setRealTarget(JSON.parse(JSON.stringify(fleetDispatcher.targetPlanet))), JSON.stringify(fleetDispatcher.realTarget) == JSON.stringify(fleetDispatcher.currentPlanet) && this.setRealTarget(fleetDispatcher.realTarget, {
        type: 1 == fleetDispatcher.realTarget.type ? 3 : 1
      }), !e.targetOk && this.isQuickRaid && this.ogl.db.quickRaidList.shift(), setTimeout((() => {
        const e = (fleetDispatcher.getAvailableMissions() || []).indexOf(fleetDispatcher.mission) > -1;
        !e && this.lastMissionOrder && (fleetDispatcher.getAvailableMissions() || []).indexOf(this.lastMissionOrder) > -1 ? fleetDispatcher.mission = this.lastMissionOrder : e || "fleet2" != fleetDispatcher.currentPage || 1 != (fleetDispatcher.getAvailableMissions() || []).length ? !e && (fleetDispatcher.getAvailableMissions() || []).indexOf(this.ogl.db.options.defaultMission) > -1 ? fleetDispatcher.mission = this.ogl.db.options.defaultMission : e && (fleetDispatcher.mission = this.lastMissionOrder) : fleetDispatcher.mission = fleetDispatcher.getAvailableMissions()[0], fleetDispatcher.refresh()
      }), 50)
    }, fleetDispatcher.selectShip = (e, t) => {
      let n = fleetDispatcher.getNumberOfShipsOnPlanet(e);
      const o = document.querySelector(`[data-technology="${e}"] input`);
      0 === n || t > n && !document.querySelector(`[data-technology="${e}"]`)?.classList.contains("ogl_notEnough") ? o?.classList.add("ogl_flashNotEnough") : o.classList.remove("ogl_flashNotEnough"), (t = Math.min(n, t)) <= 0 ? fleetDispatcher.removeShip(e) : fleetDispatcher.hasShip(e) ? fleetDispatcher.updateShip(e, t) : fleetDispatcher.addShip(e, t), Util.formatInput(o, !1, !0), fleetDispatcher.refresh()
    }, fleetDispatcher.trySubmitFleet1 = () => {
      if ("fleet1" == fleetDispatcher.currentPage) {
        if (fleetDispatcher.targetPlanet = fleetDispatcher.realTarget, !1 === fleetDispatcher.validateFleet1()) return this.hasBeenInitialized && 0 == fleetDispatcher.shipsToSend.length && document.querySelector(`.ogl_requiredShips .ogl_${this.ogl.db.options.defaultShip}`).click(), void(this.validationReady = !0);
        fleetDispatcher.switchToPage("fleet2")
      }
    }, Util.overWrite("refresh", fleetDispatcher, !1, (() => {
      let e = fleetDispatcher.metalOnPlanet + fleetDispatcher.crystalOnPlanet + fleetDispatcher.deuteriumOnPlanet + fleetDispatcher.foodOnPlanet;
      this.totalCapacity = this.totalCapacity || 1;
      const t = Math.floor(fleetDispatcher.getCargoCapacity() / this.totalCapacity * 100) || 0,
        n = Math.floor(fleetDispatcher.getCargoCapacity() / e * 100) || 0,
        o = Math.floor(e / this.totalCapacity * 100) || 0;
      this.capacityBar.style.setProperty("--capacity", `linear-gradient(to right, #641717, #938108 ${.8*o}%, #055c54 ${o}%)`), this.capacityWrapper.style.setProperty("--currentCapacityPercent", Math.min(94, t) + "%"), this.capacityWrapper.setAttribute("data-percentResources", Math.min(100, n)), this.capacityWrapper.setAttribute("data-rawCargo", `${Util.formatNumber(fleetDispatcher.getCargoCapacity())} / ${Util.formatNumber(this.totalCapacity)} - (req. ${Util.formatNumber(e)})`), this.capacityBar.setAttribute("max", 100), this.capacityBar.setAttribute("value", t);
      const a = document.querySelector(".show_fleet_apikey");
      if (a) {
        const e = Util.addDom("div", {
          child: a.getAttribute("data-tooltip-title") || a.getAttribute("title") || a.getAttribute("data-title")
        });
        if (e) {
          const t = e.querySelector("#FLEETAPI_JSON").getAttribute("value");
          a.setAttribute("data-api-code", t)
        }
      }
      this.ogl._time.timeLoop && this.ogl._time.timeLoop(!0)
    })), Util.overWrite("updateTarget", fleetDispatcher, (() => {
      document.querySelector("#planetList").classList.add("ogl_notReady")
    })), fleetDispatcher.hasEnoughFuel = () => (this.initialResOnPlanet?.deut || fleetDispatcher.deuteriumOnPlanet) >= fleetDispatcher.getConsumption(), Util.overWrite("selectMission", fleetDispatcher, !1, (() => {
      this.lastMissionOrder = fleetDispatcher.mission
    })), Util.overWrite("switchToPage", fleetDispatcher, (() => {
      fleetDispatcher.getFreeCargoSpace() < 0 && fleetDispatcher.cargoFood && (fleetDispatcher.selectMinFood(), fleetDispatcher.selectMaxFood()), fleetDispatcher.getFreeCargoSpace() < 0 && fleetDispatcher.cargoMetal && (fleetDispatcher.selectMinMetal(), fleetDispatcher.selectMaxMetal()), fleetDispatcher.getFreeCargoSpace() < 0 && fleetDispatcher.cargoCrystal && (fleetDispatcher.selectMinCrystal(), fleetDispatcher.selectMaxCrystal()), fleetDispatcher.getFreeCargoSpace() < 0 && fleetDispatcher.cargoDeuterium && (fleetDispatcher.selectMinDeuterium(), fleetDispatcher.selectMaxDeuterium())
    }), (() => {
      "fleet2" == fleetDispatcher.currentPage ? (document.body.classList.add("ogl_destinationPicker"), fleetDispatcher.focusSendFleet()) : "fleet1" == fleetDispatcher.currentPage && (document.body.classList.remove("ogl_destinationPicker"), fleetDispatcher.focusSubmitFleet1())
    })), Util.overWrite("stopLoading", fleetDispatcher, (() => {
      "fleet2" == fleetDispatcher.currentPage && (this.validationReady = !0)
    })), fleetDispatcher.submitFleet2 = e => {
      if (this.sent) return !0;
      this.sent = !0, fleetDispatcher.realTarget && (fleetDispatcher.targetPlanet.galaxy = fleetDispatcher.realTarget.galaxy, fleetDispatcher.targetPlanet.system = fleetDispatcher.realTarget.system, fleetDispatcher.targetPlanet.position = fleetDispatcher.realTarget.position, fleetDispatcher.targetPlanet.type = fleetDispatcher.realTarget.type, fleetDispatcher.targetPlanet.name = fleetDispatcher.realTarget.name, fleetDispatcher.refresh()), fleetDispatcher.realSpeedPercent && (fleetDispatcher.speedPercent = fleetDispatcher.realSpeedPercent), e = e || !1;
      let t = this,
        n = fleetDispatcher,
        o = {};
      t.ajaxSuccess || (fleetDispatcher.appendTokenParams(o), fleetDispatcher.appendShipParams(o), fleetDispatcher.appendTargetParams(o), fleetDispatcher.appendCargoParams(o), fleetDispatcher.appendPrioParams(o), o.mission = fleetDispatcher.mission, o.speed = fleetDispatcher.speedPercent, o.retreatAfterDefenderRetreat = !0 === fleetDispatcher.retreatAfterDefenderRetreat ? 1 : 0, o.lootFoodOnAttack = !0 === fleetDispatcher.lootFoodOnAttack ? 1 : 0, o.union = fleetDispatcher.union, e && (o.force = e), o.holdingtime = fleetDispatcher.getHoldingTime(), fleetDispatcher.startLoading(), $.post(fleetDispatcher.sendFleetUrl, o, (function (e) {
        let o = JSON.parse(e);
        !0 === o.success ? (fadeBox(o.message, !1), $("#sendFleet").removeAttr("disabled"), t.fleetSent(o.redirectUrl)) : (setTimeout((() => t.sent = !1), 500), o.responseArray && o.responseArray.limitReached && !o.responseArray.force ? (n.updateToken(o.newAjaxToken || ""), errorBoxDecision(n.loca.LOCA_ALL_NETWORK_ATTENTION, n.locadyn.localBashWarning, n.loca.LOCA_ALL_YES, n.loca.LOCA_ALL_NO, (function () {
          n.submitFleet2(!0)
        }))) : (n.displayErrors(o.errors), n.updateToken(o.newAjaxToken || ""), $("#sendFleet").removeAttr("disabled"), n.stopLoading()))
      })))
    }, Util.overWrite("refreshTargetPlanet", fleetDispatcher, (() => {
      if (fleetDispatcher.union) {
        fleetDispatcher.mission = 2, fleetDispatcher.refresh();
        const e = 1e3 * (Object.values(fleetDispatcher.unions).find((e => e.id == fleetDispatcher.union))?.time || 0);
        if (e) {
          if (document.querySelector(".ogl_acsInfo")) return;
          Util.addDom("hr", {
            prepend: document.querySelector("#fleetBriefingPart1")
          });
          const t = Util.addDom("li", {
              class: "ogl_acsInfo",
              child: "Allowed max. duration:",
              prepend: document.querySelector("#fleetBriefingPart1")
            }),
            n = Util.addDom("li", {
              class: "ogl_acsInfo",
              child: "ACS offset:",
              prepend: document.querySelector("#fleetBriefingPart1")
            }),
            o = Util.addDom("span", {
              class: "ogl_warning value",
              parent: t
            }),
            a = Util.addDom("span", {
              class: "value",
              parent: n
            });
          clearInterval(this.acsInterval), this.acsInterval = setInterval((() => {
            if (!fleetDispatcher.getDuration()) return;
            const t = 1e3 * fleetDispatcher.getDuration(),
              n = e - serverTime.getTime() - 1e3 * timeZoneDiffSeconds,
              i = .3 * n,
              r = t - n;
            a.className = "value", t > n + i ? (a.textContent = " too late", a.classList.add("ogl_danger")) : t > n ? (a.textContent = ` +${new Date(r).toISOString().slice(11,19)}`, a.classList.add("ogl_warning")) : (a.textContent = " +00:00:00", a.classList.add("ogl_ok")), o.textContent = ` ${new Date(n+i).toISOString().slice(11,19)}`
          }), 333)
        }
      }
      if (!fleetDispatcher.mission) {
        let e = new URLSearchParams(window.location.search);
        e.get("mission") ? fleetDispatcher.mission = e.get("mission") : fleetDispatcher.mission = this.ogl.db.options.defaultMission, fleetDispatcher.refresh()
      }
    }))
  }
  init() {
    if (this.isReady = !0, document.querySelector(".planetlink.active, .moonlink.active")?.classList.add("ogl_disabled"), this.addLimiters(), 1 === this.ogl.mode || 2 === this.ogl.mode || 5 === this.ogl.mode) this.prepareRedirection();
    else if (3 === this.ogl.mode && this.ogl.cache.toSend) {
      let e = 0,
        t = [0, 0, 0],
        n = 0,
        o = [0, 0, 0];
      this.ogl.cache.toSend.forEach((e => {
        t[0] = t[0] + e.cost.metal, t[1] = t[1] + e.cost.crystal, t[2] = t[2] + e.cost.deut
      })), o[0] = Math.min(fleetDispatcher.metalOnPlanet, t[0]), o[1] = Math.min(fleetDispatcher.crystalOnPlanet, t[1]), o[2] = Math.min(fleetDispatcher.deuteriumOnPlanet, t[2]), n = o[0] + o[1] + o[2];
      let a = new URLSearchParams(window.location.search);
      if (a.get("substractMode") && a.get("targetid")) {
        const e = a.get("targetid");
        t[0] = Math.max(t[0] - (this.ogl.db.myPlanets[e]?.metal || 0), 0), t[1] = Math.max(t[1] - (this.ogl.db.myPlanets[e]?.crystal || 0), 0), t[2] = Math.max(t[2] - (this.ogl.db.myPlanets[e]?.deut || 0), 0)
      }
      e = t[0] + t[1] + t[2], fleetDispatcher.selectShip(this.ogl.db.options.defaultShip, this.shipsForResources(this.ogl.db.options.defaultShip, Math.min(e, n))), fleetDispatcher.shipsToSend.length > 0 && (fleetDispatcher.cargoMetal = Math.min(t[0], fleetDispatcher.metalOnPlanet), fleetDispatcher.cargoCrystal = Math.min(t[1], fleetDispatcher.crystalOnPlanet), fleetDispatcher.cargoDeuterium = Math.min(t[2], fleetDispatcher.deuteriumOnPlanet), fleetDispatcher.refresh())
    }
    else this.ogl.db.harvestCoords = void 0;
    if (this.updateSpeedBar(), this.ogl.shipsList.forEach((e => {
        if (fleetDispatcher.fleetHelper.shipsData?.[e]) {
          const t = fleetDispatcher.fleetHelper.shipsData[e],
            n = document.querySelector(`[data-technology="${e}"]`);
          if (this.ogl.db.shipsCapacity[e] = t.cargoCapacity || t.baseCargoCapacity, !n) return;
          n.setAttribute("title", `\n                    <div class="ogl_shipDataInfo">\n                        <div class="ogl_icon ogl_${e}">${t.name}</div><hr>\n                        <i class="material-icons">send</i> Amount : <b>${Util.formatNumber(parseInt(n.querySelector(".amount").getAttribute("data-value")))}</b><br>\n                        <i class="material-icons">package-variant-closed</i> Capacity : <b>${Util.formatNumber(t.cargoCapacity||t.baseCargoCapacity)}</b><br>\n                        <i class="material-icons">mode_heat</i> Consumption : <b>${Util.formatNumber(t.fuelConsumption)}</b><br>\n                        <i class="material-icons">speed</i> Speed : <b>${Util.formatNumber(t.speed)}</b>\n                    </div>\n                `)
        }
      })), fleetDispatcher.selectMission(parseInt(fleetDispatcher.mission) || parseInt(this.ogl.db.options.defaultMission)), fleetDispatcher.speedPercent = fleetDispatcher.speedPercent || 10, fleetDispatcher.realSpeedPercent = fleetDispatcher.speedPercent, 1 === this.ogl.mode || 2 === this.ogl.mode ? (fleetDispatcher.selectShip(this.ogl.db.options.defaultShip, this.shipsForResources()), fleetDispatcher.selectMaxAll()) : 5 === this.ogl.mode && this.ogl.db.options.expeditionRedirect && this.selectExpedition(this.ogl.db.lastExpeditionShip || this.ogl.db.options.defaultShip), fleetDispatcher.refresh(), fleetDispatcher.focusSubmitFleet1(), document.querySelector(".secondcol")) {
      Util.runAsync((() => {
        document.querySelector("#sendall").classList.add("material-icons"), document.querySelector("#sendall").innerText = "chevron-double-right", document.querySelector("#resetall").classList.add("material-icons"), document.querySelector("#resetall").innerText = "exposure_zero"
      }));
      const e = Util.addDom("div", {
        title: "loading...",
        child: "cube-send",
        class: "material-icons tooltipRight tooltipClose tooltipClick tooltipUpdate",
        parent: document.querySelector(".secondcol"),
        ontooltip: () => {
          const t = Util.addDom("div", {
              class: "ogl_resourcesPreselection"
            }),
            n = ["metal", "crystal", "deut", "food"];
          n.forEach((e => {
            const n = Util.addDom("div", {
                class: `ogl_icon ogl_${e}`,
                parent: t,
                onclick: () => {
                  o.value = o.value == fleetDispatcher[this.resOnPlanet[e]] ? 0 : fleetDispatcher[this.resOnPlanet[e]], fleetDispatcher[this.cargo[e]] = o.value, o.dispatchEvent(new Event("input"))
                }
              }),
              o = Util.addDom("input", {
                type: "text",
                parent: n,
                onclick: e => {
                  e.stopPropagation()
                },
                oninput: () => {
                  Util.formatInput(o, (() => {
                    o.value = Math.min(fleetDispatcher[this.resOnPlanet[e]], parseInt(o.value.replace(/\D/g, "")) || 0), fleetDispatcher[this.cargo[e]] = o.value, o.value = parseInt(o.value.replace(/\D/g, "") || 0).toLocaleString("fr-FR")
                  }))
                }
              })
          })), Util.addDom("hr", {
            parent: t
          }), Util.addDom("div", {
            class: "ogl_button ogl_formValidation",
            child: "OK",
            parent: t,
            onclick: () => {
              let e = 0;
              t.querySelectorAll("input").forEach((t => {
                e += parseInt(t.value.replace(/\D/g, "")) || 0
              })), e > 0 && fleetDispatcher.selectShip(this.ogl.db.options.defaultShip, this.shipsForResources(!1, e)), t.querySelectorAll("input").forEach(((e, t) => fleetDispatcher[this.cargo[n[t]]] = parseInt(e.value.replace(/\D/g, "") || 0))), fleetDispatcher.refresh(), setTimeout((() => fleetDispatcher.focusSubmitFleet1()), 50)
            }
          }), e._tippy ? e._tippy.setContent(t) : this.ogl._tooltip.update(t), setTimeout((() => t.querySelector("input").focus()), 100)
        }
      })
    }
    document.querySelectorAll("#fleet2 .resourceIcon").forEach((e => {
      Util.addDom("div", {
        class: "ogl_reverse material-icons",
        child: "fiber_smart_record",
        parent: e,
        onclick: t => {
          let n = e.classList.contains("metal") ? "metal" : e.classList.contains("crystal") ? "crystal" : e.classList.contains("deuterium") ? "deut" : "food";
          fleetDispatcher[this.cargo[n]] = Math.min(fleetDispatcher[this.resOnPlanet[n]] - fleetDispatcher[this.cargo[n]], fleetDispatcher.getFreeCargoSpace()), fleetDispatcher.refresh()
        }
      })
    })), this.ogl.mode || (this.hasBeenInitialized = !0)
  }
  setRealTarget(e, t) {
    e.galaxy = t?.galaxy || e.galaxy, e.system = t?.system || e.system, e.position = t?.position || e.position, e.type = t?.type || e.type, e.name = t?.name || e.name, fleetDispatcher.realTarget = e, document.querySelector("#galaxy").value = fleetDispatcher.realTarget.galaxy, document.querySelector("#system").value = fleetDispatcher.realTarget.system, document.querySelector("#position").value = fleetDispatcher.realTarget.position, fleetDispatcher.targetPlanet.galaxy = fleetDispatcher.realTarget.galaxy, fleetDispatcher.targetPlanet.system = fleetDispatcher.realTarget.system, fleetDispatcher.targetPlanet.position = fleetDispatcher.realTarget.position, fleetDispatcher.targetPlanet.type = fleetDispatcher.realTarget.type, document.querySelectorAll(".smallplanet").forEach((e => {
      const t = e.querySelector(".planet-koords").innerText.split(":");
      if (e.querySelector(".ogl_currentDestination")?.classList.remove("ogl_currentDestination"), fleetDispatcher.realTarget.galaxy == t[0] && fleetDispatcher.realTarget.system == t[1] && fleetDispatcher.realTarget.position == t[2]) {
        const t = 1 == fleetDispatcher.realTarget.type ? e.querySelector(".planetlink") : 3 == fleetDispatcher.realTarget.type && e.querySelector(".moonlink");
        t && t.classList.add("ogl_currentDestination")
      }
    }))
  }
  fleetSent(e) {
    if (this.ajaxSuccess) return;
    this.ajaxSuccess = !0, this.ogl.db.previousFleet = {}, this.ogl.db.previousFleet.shipsToSend = fleetDispatcher.shipsToSend, this.ogl.db.previousFleet.speedPercent = fleetDispatcher.speedPercent, this.ogl.db.previousFleet.targetPlanet = JSON.parse(JSON.stringify(fleetDispatcher.targetPlanet)), this.ogl.db.previousFleet.mission = fleetDispatcher.mission, this.ogl.db.previousFleet.expeditionTime = fleetDispatcher.expeditionTime, this.ogl.db.previousFleet.cargoMetal = fleetDispatcher.cargoMetal, this.ogl.db.previousFleet.cargoCrystal = fleetDispatcher.cargoCrystal, this.ogl.db.previousFleet.cargoDeuterium = fleetDispatcher.cargoDeuterium, this.ogl.db.previousFleet.cargoFood = fleetDispatcher.cargoFood;
    const t = fleetDispatcher.getConsumption() || 0;
    this.ogl.currentPlanet.obj.metal -= Math.min(this.initialResOnPlanet.metal, fleetDispatcher.cargoMetal), this.ogl.currentPlanet.obj.crystal -= Math.min(this.initialResOnPlanet.crystal, fleetDispatcher.cargoCrystal), this.ogl.currentPlanet.obj.deut -= Math.min(this.initialResOnPlanet.deut, fleetDispatcher.cargoDeuterium + t), this.ogl.currentPlanet.obj.food -= Math.min(this.initialResOnPlanet.food, fleetDispatcher.cargoFood);
    const n = this.ogl._stats.getDayStats(serverTime.getTime());
    if (n.conso = (n.conso || 0) + Math.min(this.initialResOnPlanet.deut, t), this.isQuickRaid && this.ogl.db.quickRaidList.shift(), 5 === this.ogl.mode && 15 !== fleetDispatcher.mission && this.ogl.db.options.expeditionRedirect && (this.ogl.mode = 0), 1 != this.ogl.mode && 2 != this.ogl.mode && 5 != this.ogl.mode && this.prepareRedirection(), 1 === this.ogl.mode || 2 === this.ogl.mode || 5 === this.ogl.mode && this.ogl.db.options.expeditionRedirect) window.location.href = this.ogl.nextRedirection;
    else if (3 === this.ogl.mode && this.ogl.cache.toSend) {
      let t = [0, 0, 0],
        n = new URLSearchParams(window.location.search);
      if (n.get("substractMode") && n.get("targetid")) {
        const e = n.get("targetid");
        t[0] -= this.ogl.db.myPlanets[e]?.metal || 0, t[1] -= this.ogl.db.myPlanets[e]?.crystal || 0, t[2] -= this.ogl.db.myPlanets[e]?.deut || 0
      }
      this.ogl.cache.toSend.forEach((e => {
        const n = new URLSearchParams(window.location.search).get("targetid"),
          o = this.ogl.db.myPlanets[n].todolist[e.id][e.level].cost;
        for (let n = 0; n < 3; n++) {
          let a = 2 === n ? "deut" : 1 === n ? "crystal" : "metal",
            i = 2 == n ? "cargoDeuterium" : 1 == n ? "cargoCrystal" : "cargoMetal",
            r = Math.min(fleetDispatcher[i] - t[n], e.cost[a]);
          t[n] += r, o[a] -= r
        }
        e.amount && o.metal + o.crystal + o.deut <= 0 && delete this.ogl.db.myPlanets[n].todolist[e.id][e.level], Object.values(this.ogl.db.myPlanets[n].todolist[e.id]).length < 1 && delete this.ogl.db.myPlanets[n].todolist[e.id]
      })), window.location.href = e
    }
    else if (4 === this.ogl.mode) {
      let e = parseInt(new URLSearchParams(window.location.search).get("oglmsg")) || 0;
      this.ogl.cache.reports[e] && (this.ogl.cache.reports[e].attacked = !0), window.location.href = `?page=messages`
    }
    else window.location.href = e;
    this.ogl.save()
  }
  addLimiters() {
    const e = document.querySelector("#fleetdispatchcomponent"),
      t = Util.addDom("fieldset", {
        parent: e
      });
    Util.addDom("legend", {
      parent: t,
      child: '<i class="material-icons">settings</i> Settings'
    });
    const n = Util.addDom("label", {
        class: "ogl_limiterLabel tooltip",
        "data-limiter-type": "resource",
        title: this.ogl._lang.find("resourceLimiter"),
        parent: t,
        child: "Limit resources"
      }),
      o = Util.addDom("input", {
        type: "checkbox",
        parent: n,
        onclick: () => {
          this.ogl.db.fleetLimiter.resourceActive = !this.ogl.db.fleetLimiter.resourceActive, this.updateLimiter()
        }
      }),
      a = Util.addDom("label", {
        class: "ogl_limiterLabel tooltip",
        "data-limiter-type": "ship",
        title: this.ogl._lang.find("fleetLimiter"),
        parent: t,
        child: "Limit ships"
      }),
      i = Util.addDom("input", {
        type: "checkbox",
        parent: a,
        onclick: () => {
          this.ogl.db.fleetLimiter.shipActive = !this.ogl.db.fleetLimiter.shipActive, this.updateLimiter()
        }
      }),
      r = Util.addDom("label", {
        class: "ogl_limiterLabel tooltip",
        title: this.ogl._lang.find("forceIgnoreFood"),
        parent: t,
        child: "Ignore Food"
      }),
      l = Util.addDom("input", {
        type: "checkbox",
        parent: r,
        onclick: () => {
          this.ogl.db.fleetLimiter.ignoreFood = !this.ogl.db.fleetLimiter.ignoreFood, this.updateLimiter()
        }
      }),
      s = Util.addDom("div", {
        class: "ogl_limiterGroup tooltip",
        title: this.ogl._lang.find("forceKeepCapacity"),
        parent: t,
        child: "Force"
      });
    [202, 203, 219, 200].forEach((e => {
      const t = Util.addDom("div", {
        class: `ogl_icon ogl_${e}`,
        parent: s,
        onclick: () => {
          s.querySelector(".ogl_active")?.classList.remove("ogl_active"), t.classList.add("ogl_active"), this.ogl.db.keepEnoughCapacityShip = e, this.updateLimiter()
        }
      });
      this.ogl.db.keepEnoughCapacityShip == e && t.classList.add("ogl_active")
    })), this.ogl.db.fleetLimiter.resourceActive && (o.checked = !0), this.ogl.db.fleetLimiter.shipActive && (i.checked = !0), this.ogl.db.fleetLimiter.ignoreFood && (l.checked = !0), this.updateLimiter()
  }
  updateLimiter() {
    unsafeWindow.fleetDispatcher && (this.totalCapacity = 0, fleetDispatcher.shipsOnPlanet.forEach(((e, t) => {
      let n = 0;
      this.ogl.db.keepEnoughCapacityShip == e.id && 1 !== this.ogl.mode && 2 !== this.ogl.mode && (n = this.shipsForResources(e.id)), this.ogl.db.fleetLimiter.shipActive && this.ogl.db.fleetLimiter.data[e.id] ? e.number = Math.max(0, this.initialShipsOnPlanet.find((t => t.id == e.id)).number - Math.max(this.ogl.db.fleetLimiter.data[e.id], n)) : e.number = this.initialShipsOnPlanet.find((t => t.id == e.id)).number - n, fleetDispatcher.shipsToSend.find((t => t.id == e.id))?.number >= e.number && fleetDispatcher.selectShip(e.id, e.number);
      const o = document.querySelector(`[data-technology="${e.id}"]`);
      if (o) {
        o.querySelector(".ogl_reverse") || Util.addDom("div", {
          class: "ogl_reverse material-icons",
          child: "fiber_smart_record",
          parent: o,
          onclick: t => {
            t.stopPropagation();
            let n = fleetDispatcher.shipsOnPlanet.find((t => t.id == e.id))?.number - (fleetDispatcher.findShip(e.id)?.number || 0);
            fleetDispatcher.selectShip(e.id, n), fleetDispatcher.refresh()
          }
        }), o.querySelector(".ogl_maxShip")?.remove();
        const t = Util.addDom("div", {
          class: "ogl_maxShip",
          parent: o
        });
        t.innerHTML = `<b>-${Util.formatToUnits(this.ogl.db.fleetLimiter.shipActive?Math.max(this.ogl.db.fleetLimiter.data[e.id],n):n)}</b>`, t.addEventListener("click", (() => {
          Util.runAsync((() => this.ogl._ui.openFleetProfile())).then((e => this.ogl._popup.open(e)))
        })), this.ogl.db.fleetLimiter.shipActive || this.ogl.db.keepEnoughCapacityShip == e.id || t.classList.add("ogl_hidden"), e.number <= 0 ? (o.classList.add("ogl_notEnough"), fleetDispatcher.removeShip(e.id)) : o.classList.remove("ogl_notEnough"), this.totalCapacity += this.ogl.db.shipsCapacity[e.id] * e.number
      }
      document.querySelectorAll(".ogl_flashNotEnough").forEach((e => {
        0 == e.value && e.classList.remove("ogl_flashNotEnough")
      }))
    })), ["metal", "crystal", "deut", "food"].forEach((e => {
      this.ogl.db.fleetLimiter.resourceActive ? fleetDispatcher[this.resOnPlanet[e]] = Math.max(0, this.initialResOnPlanet[e] - (this.ogl.db.fleetLimiter.data[e] || 0)) : fleetDispatcher[this.resOnPlanet[e]] = Math.max(0, this.initialResOnPlanet[e]), "food" == e && this.ogl.db.fleetLimiter.ignoreFood && (fleetDispatcher[this.resOnPlanet[e]] = 0), fleetDispatcher[this.cargo[e]] = Math.min(fleetDispatcher[this.cargo[e]], fleetDispatcher[this.resOnPlanet[e]]);
      const t = document.querySelector(`#fleet2 #resources .${e?.replace("deut","deuterium")}`);
      if (t) {
        t.querySelector(".ogl_maxShip")?.remove();
        const n = Util.addDom("div", {
          class: "ogl_maxShip",
          parent: t
        });
        n.innerHTML = `<b>-${Util.formatToUnits(this.ogl.db.fleetLimiter.resourceActive?this.ogl.db.fleetLimiter.data[e]:0,0)}</b>`, n.addEventListener("click", (() => {
          Util.runAsync((() => this.ogl._ui.openFleetProfile())).then((e => this.ogl._popup.open(e)))
        })), t.parentNode.querySelector("input").classList.add("ogl_inputCheck")
      }
    })), fleetDispatcher.refresh(), this.updateRequiredShips())
  }
  updateRequiredShips() {
    const e = document.querySelector(".ogl_requiredShips") || Util.addDom("span", {
      class: "ogl_requiredShips",
      parent: document.querySelector("#civilships #civil") || document.querySelector("#warning")
    });
    e.innerText = "", this.ogl.fretShips.forEach((t => {
      const n = this.shipsForResources(t),
        o = Util.addDom("div", {
          class: `tooltip ogl_required ogl_icon ogl_${t}`,
          title: Util.formatNumber(n),
          parent: e,
          child: Util.formatToUnits(n),
          onclick: () => {
            fleetDispatcher.selectShip(t, n), fleetDispatcher.selectMaxAll(), fleetDispatcher.refresh(), fleetDispatcher.focusSubmitFleet1()
          }
        });
      (fleetDispatcher.shipsOnPlanet.find((e => e.id == t))?.number || 0) < n && o.classList.add("ogl_notEnough")
    })), this.ogl.shipsList.forEach((e => {
      const t = document.querySelector(`[data-technology="${e}"]`);
      if (t) {
        const n = t.querySelector(".ogl_shipFlag") || Util.addDom("div", {
          class: "ogl_shipFlag",
          parent: t
        });
        n.innerText = "", this.ogl.db.options.defaultShip == e && Util.addDom("div", {
          class: "material-icons ogl_fav",
          child: "star",
          parent: n
        }), this.ogl.db.keepEnoughCapacityShip == e && Util.addDom("div", {
          class: "material-icons ogl_shipLock",
          child: "lock",
          parent: n
        })
      }
    })), document.querySelector(".ogl_popup.ogl_active") || fleetDispatcher.focusSubmitFleet1()
  }
  shipsForResources(e, t) {
    return e = e || this.ogl.db.options.defaultShip, -1 === (t = 0 === t ? 0 : t || -1) && (unsafeWindow.fleetDispatcher ? ["metal", "crystal", "deut", "food"].forEach((e => t += fleetDispatcher[this.resOnPlanet[e]])) : ["metal", "crystal", "deut", "food"].forEach((e => t += this.ogl.currentPlanet?.obj?.[e]))), Math.ceil(t / this.ogl.db.shipsCapacity[e]) || 0
  }
  selectExpedition(e) {
    if (fleetDispatcher.fetchTargetPlayerDataTimeout) return;
    this.ogl.mode = 5, fleetDispatcher.resetShips(), fleetDispatcher.resetCargo();
    const t = [fleetDispatcher.currentPlanet.galaxy, fleetDispatcher.currentPlanet.system, fleetDispatcher.currentPlanet.position],
      n = this.ogl.calcExpeditionMax(),
      o = Math.max(this.ogl.db.options.expeditionValue ? 0 : Math.ceil(n.treshold.base / {
        202: 1,
        203: 3,
        219: 5.75
      } [e]), this.shipsForResources(e, n.max));
    let a = 0;
    [218, 213, 211, 215, 207, 206, 205, 204].forEach((e => {
      this.ogl.db.options.expeditionBigShips.indexOf(e) >= 0 && 0 == a && document.querySelector(`.technology[data-technology="${e}"] .amount`)?.getAttribute("data-value") > 0 && (a = e)
    })), fleetDispatcher.shipsOnPlanet.forEach((t => {
      t.id == e ? fleetDispatcher.selectShip(t.id, o) : (t.id == a && e != a || 210 == t.id || 219 == t.id && 219 != e) && fleetDispatcher.selectShip(t.id, 1)
    }));
    const i = Math.round(Math.random() * this.ogl.db.options.expeditionRandomSystem) * (Math.round(Math.random()) ? 1 : -1) + t[1];
    this.setRealTarget(fleetDispatcher.realTarget, {
      galaxy: t[0],
      system: i,
      position: 16,
      type: 1,
      name: fleetDispatcher.loca.LOCA_EVENTH_ENEMY_INFINITELY_SPACE
    }), fleetDispatcher.selectMission(15), fleetDispatcher.expeditionTime = 1, fleetDispatcher.updateExpeditionTime(), fleetDispatcher.refresh(), fleetDispatcher.focusSubmitFleet1(), this.ogl.db.lastExpeditionShip = e, this.prepareRedirection()
  }
  updateSpeedBar() {
    document.querySelector("#speedPercentage").addEventListener("mousemove", (e => {
      document.querySelector("#speedPercentage").querySelectorAll(".selected").forEach((e => e.classList.remove("selected"))), document.querySelector("#speedPercentage").querySelector(`[data-step="${fleetDispatcher.realSpeedPercent}"]`).classList.add("selected")
    })), document.querySelector("#speedPercentage").addEventListener("click", (e => {
      e.target.getAttribute("data-step") && (document.querySelector("#speedPercentage .bar").style.width = e.target.offsetLeft + e.target.offsetWidth + "px", document.querySelector("#speedPercentage").querySelectorAll(".selected").forEach((e => e.classList.remove("selected"))), e.target.classList.add("selected"), fleetDispatcher.speedPercent = e.target.getAttribute("data-step"), fleetDispatcher.realSpeedPercent = e.target.getAttribute("data-step"), fleetDispatcher.refresh()), fleetDispatcher.realSpeedPercent = fleetDispatcher.speedPercent, fleetDispatcher.setFleetPercent(fleetDispatcher.speedPercent), fleetDispatcher.cargoDeuterium + fleetDispatcher.getConsumption() >= fleetDispatcher.getDeuteriumOnPlanetWithoutConsumption() && (fleetDispatcher.cargoDeuterium = 0, fleetDispatcher.selectMaxDeuterium(), fleetDispatcher.refresh()), fleetDispatcher.focusSendFleet()
    }))
  }
  prepareRedirection() {
    if (this.redirectionReady && !this.ogl.mode) return;
    const e = !this.ogl.db.harvestCoords,
      t = this.ogl.currentPlanet.dom.next.querySelector(".planet-koords").innerText,
      n = this.ogl.currentPlanet.dom.nextNext?.querySelector(".planet-koords")?.innerText,
      o = fleetDispatcher.realTarget.type;
    let a, i, r = `${fleetDispatcher.realTarget.galaxy}:${fleetDispatcher.realTarget.system}:${fleetDispatcher.realTarget.position}`.split(":"),
      l = `${fleetDispatcher.realTarget.galaxy}:${fleetDispatcher.realTarget.system}:${fleetDispatcher.realTarget.position}`,
      s = `${this.ogl.db.harvestCoords?.source?.galaxy}:${this.ogl.db.harvestCoords?.source?.system}:${this.ogl.db.harvestCoords?.source?.position}`;
    e && (this.redirectionReady ? (this.ogl.mode = 0, s = t) : (this.ogl.db.harvestCoords = {
      source: fleetDispatcher.currentPlanet,
      destination: fleetDispatcher.realTarget
    }, s = `${this.ogl.db.harvestCoords?.source?.galaxy}:${this.ogl.db.harvestCoords?.source?.system}:${this.ogl.db.harvestCoords?.source?.position}`)), 1 === this.ogl.mode ? (a = 1 == this.ogl.db.harvestCoords?.source?.type ? this.ogl.currentPlanet.dom.prev.getAttribute("id").replace("planet-", "") : this.ogl.currentPlanet.dom.prevWithMoon.querySelector(".moonlink").getAttribute("href").match(/cp=(\d+)/)[1], i = 1 == this.ogl.db.harvestCoords?.source?.type ? this.ogl.currentPlanet.dom.next.getAttribute("id").replace("planet-", "") : this.ogl.currentPlanet.dom.nextWithMoon.querySelector(".moonlink").getAttribute("href").match(/cp=(\d+)/)[1], e || l != t || fleetDispatcher.currentPlanet.type != fleetDispatcher.realTarget.type || (i = 1 == this.ogl.db.harvestCoords?.source?.type ? this.ogl.currentPlanet.dom.nextNext.getAttribute("id").replace("planet-", "") : this.ogl.currentPlanet.dom.nextNextWithMoon.querySelector(".moonlink").getAttribute("href").match(/cp=(\d+)/)[1]), this.ogl.prevRedirection = `?page=ingame&component=fleetdispatch&cp=${a}&galaxy=${r[0]}&system=${r[1]}&position=${r[2]}&type=${o}&oglmode=1`, this.ogl.nextRedirection = `?page=ingame&component=fleetdispatch&cp=${i}&galaxy=${r[0]}&system=${r[1]}&position=${r[2]}&type=${o}&oglmode=1`) : 2 === this.ogl.mode ? (a = 1 == this.ogl.db.harvestCoords?.source?.type ? this.ogl.currentPlanet.dom.prevWithMoon.getAttribute("id").replace("planet-", "") : this.ogl.currentPlanet.dom.prevWithMoon.querySelector(".moonlink").getAttribute("href").match(/cp=(\d+)/)[1], i = 1 == this.ogl.db.harvestCoords?.source?.type ? this.ogl.currentPlanet.dom.nextWithMoon.getAttribute("id").replace("planet-", "") : this.ogl.currentPlanet.dom.nextWithMoon.querySelector(".moonlink").getAttribute("href").match(/cp=(\d+)/)[1], this.ogl.prevRedirection = `?page=ingame&component=fleetdispatch&cp=${a}&oglmode=2`, this.ogl.nextRedirection = `?page=ingame&component=fleetdispatch&cp=${i}&oglmode=2`) : 5 === this.ogl.mode && (a = 1 == this.ogl.db.harvestCoords?.source?.type ? this.ogl.currentPlanet.dom.prev.getAttribute("id").replace("planet-", "") : this.ogl.currentPlanet.dom.prevWithMoon.querySelector(".moonlink").getAttribute("href").match(/cp=(\d+)/)[1], i = 1 == this.ogl.db.harvestCoords?.source?.type ? this.ogl.currentPlanet.dom.next.getAttribute("id").replace("planet-", "") : this.ogl.currentPlanet.dom.nextWithMoon.querySelector(".moonlink").getAttribute("href").match(/cp=(\d+)/)[1], this.ogl.prevRedirection = `?page=ingame&component=fleetdispatch&cp=${a}&oglmode=5`, this.ogl.nextRedirection = `?page=ingame&component=fleetdispatch&cp=${i}&oglmode=5`), (s == t || t == l && s == n && this.ogl.db.harvestCoords?.source?.type == this.ogl.db.harvestCoords?.destination?.type) && (this.ogl.db.harvestCoords = void 0, this.ogl.nextRedirection = `?page=ingame&component=overview&cp=${i}`), this.redirectionReady = !0
  }
  addToSpyQueue(e, t, n, o, a, i, r) {
    this.spyQueue = this.spyQueue || [], this.spyQueue.push({
      order: e,
      galaxy: t,
      system: n,
      position: o,
      type: a,
      shipCount: i,
      callback: r
    }), document.querySelectorAll(`[data-spy-coords="${t}:${n}:${o}:${a}"]`).forEach((e => e.setAttribute("data-spy", "prepare"))), this.spyInterval || (this.spyInterval = setInterval((() => this.spy()), 500))
  }
  spy() {
    if (!this.spyReady) return;
    if (this.spyQueue.length <= 0) return clearInterval(this.spyInterval), this.spyInterval = !1, void(this.spyReady = !0);
    this.spyReady = !1;
    const e = this,
      t = {
        mission: this.spyQueue[0].order,
        galaxy: this.spyQueue[0].galaxy,
        system: this.spyQueue[0].system,
        position: this.spyQueue[0].position,
        type: this.spyQueue[0].type,
        shipCount: this.spyQueue[0].shipCount || this.ogl.db.spyProbesCount,
        token: token
      };
    $.ajax(miniFleetLink, {
      data: t,
      dataType: "json",
      type: "POST",
      success: function (n) {
        if (void 0 !== n.newAjaxToken) {
          let e = document.querySelector('[name="token"]');
          e && (e.value = n.newAjaxToken), token = n.newAjaxToken, updateOverlayToken("phalanxSystemDialog", n.newAjaxToken), updateOverlayToken("phalanxDialog", n.newAjaxToken)
        }
        n.response.success || n.response.coordinates ? (e.spyQueue[0].callback && e.spyQueue[0].callback(), n.response.coordinates && n.response.success ? (document.querySelectorAll(`[data-spy-coords="${t.galaxy}:${t.system}:${t.position}:${t.type}"]`).forEach((e => e.setAttribute("data-spy", "done"))), e.spyQueue.shift(), 6 == t.mission && e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`] && (e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`].spy = e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`].spy || [], 1 == t.type ? e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`].spy[0] = serverTime.getTime() : e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`].spy[1] = serverTime.getTime()), n.response.slots && document.querySelector("#galaxycomponent #slotUsed") && (document.querySelector("#galaxycomponent #slotUsed").innerText = n.response.slots), n.response.probes && document.querySelector("#galaxycomponent #probeValue") && (document.querySelector("#galaxycomponent #probeValue").innerText = n.response.probes), refreshFleetEvents()) : n.response.coordinates && !n.response.success && (e.spyQueue[0].retry = (e.spyQueue[0].retry || 0) + 1, e.spyQueue[0].retry > 1 && (e.spyQueue.shift(), document.querySelectorAll(`[data-spy-coords="${t.galaxy}:${t.system}:${t.position}:${t.type}"]`).forEach((e => e.setAttribute("data-spy", "fail"))), e.ogl._notification.addToQueue(`[${n.response.coordinates.galaxy}:${n.response.coordinates.system}:${n.response.coordinates.position}] ${n.response.message}`, !1))), e.spyReady = !0) : e.spyReady = !0
      },
      error: function (t) {
        e.spyReady = !0
      }
    })
  }
  updateSpyFunctions() {
    const e = sendShips,
      t = sendShipsWithPopup;
    sendShips = (t, n, o, a, i, r, l) => {
      15 == t ? e(t, n, o, a, i, r, l) : this.addToSpyQueue(t, n, o, a, i, r, l)
    }, sendShipsWithPopup = (e, n, o, a, i, r, l) => {
      15 == e && t(e, n, o, a, i, r, l), this.addToSpyQueue(e, n, o, a, i, r, l)
    }
  }
  checkSendShips() {
    document.querySelectorAll('[onclick*="sendShips(6"]:not([data-spy-coords]), [onclick*="sendShipsWithPopup(6"]:not([data-spy-coords])').forEach((e => {
      const t = e.getAttribute("onclick").match(/[sendShips|sendShipsWithPopup]\((\d|,| )+\)/);
      if (t) {
        const n = t[0].match(/\d+/g);
        e.setAttribute("data-spy-coords", `${n[1]}:${n[2]}:${n[3]}:${n[4]}`);
        const o = this.ogl.db.pdb[`${n[1]}:${n[2]}:${n[3]}`]?.spy?.[1 == n[4] ? 0 : 1] || 0;
        serverTime.getTime() - o < this.ogl.db.options.spyIndicatorDelay && e.setAttribute("data-spy", "recent")
      }
    })), document.querySelectorAll('[onclick*="sendShips(8"]:not([data-spy-coords]), [onclick*="sendShipsWithPopup(8"]:not([data-spy-coords])').forEach((e => {
      const t = e.getAttribute("onclick").match(/[sendShips|sendShipsWithPopup]\((\d|,| )+\)/);
      if (t) {
        const n = t[0].match(/\d+/g);
        e.setAttribute("data-spy-coords", `${n[1]}:${n[2]}:${n[3]}:${n[4]}`)
      }
    }))
  }
  updateSystemSpy() {
    const e = this;
    document.querySelector(".spysystemlink").addEventListener("click", (t => {
      t.preventDefault(), t.stopPropagation();
      const n = t.target.getAttribute("data-target-url");
      n && $.post(n, {
        galaxy: $("#galaxy_input").val(),
        system: $("#system_input").val(),
        token: token
      }, "json").done((function (t) {
        const n = JSON.parse(t);
        token = n.newAjaxToken, updateOverlayToken("phalanxDialog", n.newAjaxToken), updateOverlayToken("phalanxSystemDialog", n.newAjaxToken), n.count || e.ogl._notification.addToQueue(n.text, !1), n.planets.forEach((t => {
          document.querySelectorAll(`[data-spy-coords="${t.galaxy}:${t.system}:${t.position}:${t.type}"]`).forEach((e => e.setAttribute("data-spy", "done"))), e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`] && (e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`].spy = e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`].spy || [], 1 == t.type ? e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`].spy[0] = serverTime.getTime() : e.ogl.db.pdb[`${t.galaxy}:${t.system}:${t.position}`].spy[1] = serverTime.getTime())
        }))
      }))
    }))
  }
}
class GalaxyManager extends Manager {
  init() {
    this.isReady || (this.isReady = !0, this.unloadSystem(), submitForm())
  }
  load() {
    if ("galaxy" != this.ogl.page || !unsafeWindow.galaxy) return;
    this.galaxy = galaxy, this.system = system;
    const e = document.querySelector("#galaxyLoading");
    e.setAttribute("data-currentposition", this.galaxy + ":" + this.system), Util.overWrite("loadContentNew", unsafeWindow, ((t, n) => {
      this.unloadSystem(), e.setAttribute("data-currentPosition", `${t}:${n}`), this.ogl._tooltip.close()
    })), submitForm(), this.ogl._fleet.updateSystemSpy()
  }
  check(e) {
    if (!e.success || !e.system) return void this.ogl._notification.addToQueue(`Error, cannot fetch [${this.galaxy}:${this.system}] data`);
    this.galaxy = e.system.galaxy, this.system = e.system.system;
    let t = {},
      n = {};
    this.ogl.db.spyProbesCount = e.system.settingsProbeCount || 0;
    let o = e => 15 == e.activity.showActivity ? "*" : e.activity.idleTime || 60;
    e.system.galaxyContent.forEach((e => {
      const a = e.position,
        i = {
          metal: 0,
          crystal: 0,
          deut: 0,
          total: 0
        },
        r = document.querySelector(`#galaxyRow${a}`);
      if (16 == a) return i.metal = parseInt(e.planets.resources.metal.amount), i.crystal = parseInt(e.planets.resources.crystal.amount), i.deut = parseInt(e.planets.resources.deuterium.amount), i.total = i.metal + i.crystal + i.deut, void this.updateDebrisP16(i, r);
      const l = `${this.galaxy}:${this.system}:${a}`,
        s = parseInt(99999 == e.player.playerId ? -1 : e.player.playerId),
        d = e.player.playerName,
        c = Array.from(r.querySelector('.cellPlayerName span[class*="status_"]')?.classList || []).filter((e => e.startsWith("status_")))[0],
        p = e.player.isOnVacation ? "v" : e.player.isLongInactive ? "I" : e.player.isInactive ? "i" : "n",
        g = s == this.ogl.account.id,
        u = e.player.highscorePositionPlayer,
        m = [];
      let h = -1,
        f = -1,
        b = -1;
      if (r.querySelector(".cellDebris").classList.remove("ogl_important"), e.planets.forEach((e => {
          1 == e.planetType ? (m[0] = o(e), h = e.isDestroyed ? -1 : parseInt(e.planetId)) : 2 == e.planetType ? (i.metal = parseInt(e.resources.metal.amount), i.crystal = parseInt(e.resources.crystal.amount), i.deut = parseInt(e.resources.deuterium.amount), i.total = i.metal + i.crystal + i.deut, this.updateDebris(i, r)) : 3 == e.planetType && (m[1] = o(e), f = e.isDestroyed ? -1 : parseInt(e.planetId), b = parseInt(e.size))
        })), e.player.isAdmin) return;
      const y = this.ogl.db.pdb[l] || {
        pid: -1,
        mid: -1
      };
      if (this.ogl.ptreKey && (t[l] = {}, t[l].teamkey = this.ogl.ptreKey, t[l].galaxy = this.galaxy, t[l].system = this.system, t[l].position = a, t[l].timestamp_ig = serverTime.getTime(), t[l].old_player_id = y.uid || -1, t[l].timestamp_api = y?.api || -1, t[l].old_name = y?.name || !1, t[l].old_rank = y?.score?.globalRanking || -1, t[l].old_score = y?.score?.global || -1, t[l].old_fleet = y?.score?.military || -1, s < 0 && y.pid != h ? (t[l].id = -1, t[l].player_id = -1, t[l].name = !1, t[l].rank = -1, t[l].score = -1, t[l].fleet = -1, t[l].status = !1, t[l].moon = {
          id: -1
        }) : s < 0 && delete t[l]), y.pid != h && (this.ogl.removeOldPlanetOwner(l, s), delete this.ogl.db.pdb[l]), s > 0) {
        this.ogl.db.pdb[l] = this.ogl.db.pdb[l] || {};
        const e = this.ogl.db.udb[s] || this.ogl.createPlayer(s),
          o = this.ogl.db.pdb[l];
        !this.ogl.ptreKey || y.pid == h && (y.mid || -1) == f ? delete t[l] : (t[l].id = h, t[l].player_id = s, t[l].name = d || !1, t[l].rank = u || -1, t[l].score = e.score?.global || -1, t[l].fleet = e.score?.military || -1, t[l].status = p, f > -1 && (t[l].moon = {}, t[l].moon.id = f, t[l].moon.size = b), console.log(`${l} | ${y.pid} -> ${h} | ${y.mid} -> ${f}`)), o.uid = s, o.pid = h, o.mid = f, o.coo = l, e.uid = s, e.name = d, e.status = c, e.score = e.score || {}, e.score.globalRanking = u, e.planets = e.planets || [], e.planets.indexOf(l) < 0 && e.planets.push(l), this.updateRow(e, r, g, l), (e.pin || this.ogl.db.lastPinnedList.indexOf(s) > -1) && this.ogl.db.pdb[l] && (this.ogl.db.pdb[l].api = serverTime.getTime(), this.ogl.db.pdb[l].acti = [m[0], m[1], serverTime.getTime()], this.ogl.db.pdb[l].debris = i.total, document.querySelector(".ogl_side.ogl_active") && this.ogl.db.currentSide == s && this.ogl._topbar.openPinnedDetail(s), n[l] = {}, n[l].id = h, n[l].player_id = s, n[l].teamkey = this.ogl.ptreKey, n[l].mv = "v" == p, n[l].activity = m[0], n[l].galaxy = this.galaxy, n[l].system = this.system, n[l].position = a, n[l].main = this.ogl.db.pdb[l].home || !1, n[l].cdr_total_size = i.total, f > -1 && (n[l].moon = {}, n[l].moon.id = f, n[l].moon.activity = m[1]))
      }
    })), Object.keys(t).length > 0 && this.ogl.PTRE.postPositions(t), Object.keys(n).length > 0 && this.ogl.PTRE.postActivities(n), this.checkCurrentSystem()
  }
  updateRow(e, t, n, o) {
    const a = Math.max(1, Math.ceil(e.score.globalRanking / 100));
    this.ogl._ui.turnIntoPlayerLink(e.uid, t.querySelector('.cellPlayerName [class*="status_abbr"]'), e.name), Util.addDom("a", {
      class: "ogl_ranking",
      parent: t.querySelector(".cellPlayerName"),
      href: `?page=highscore&site=${a}&searchRelId=${e.uid}`,
      child: "#" + e.score.globalRanking
    }), n || (this.ogl._ui.addPinButton(t.querySelector(".cellPlayerName"), e.uid), this.ogl._ui.addTagButton(t.querySelector(".cellPlanetName"), o)), e.uid == this.ogl.db.currentSide && t.querySelector(".cellPlayerName").classList.add("ogl_active")
  }
  updateDebris(e, t) {
    if (e.total > 0) {
      const n = t.querySelector(".microdebris");
      n.classList.remove("debris_1");
      const o = n.querySelector('[onclick*="sendShips(8"]'),
        a = Util.addDom("div", {
          parent: n
        });
      if (o) {
        const e = o.getAttribute("onclick").match(/\d+/g).map(Number);
        a.setAttribute("data-spy-coords", `${e[1]}:${e[2]}:${e[3]}:2`), a.addEventListener("click", (() => sendShips(e[0], e[1], e[2], e[3], e[4], e[5])))
      }
      a.innerHTML = Util.formatToUnits(e.total, 0), e.total >= this.ogl.db.options.resourceTreshold && a.closest(".cellDebris").classList.add("ogl_important")
    }
  }
  updateDebrisP16(e, t) {
    if (e.total > 0) {
      let n = t.querySelectorAll(".ListLinks li");
      n[0] || (n = document.querySelectorAll("#debris16 .ListLinks li"));
      let o = n[3],
        a = n[4];
      (document.querySelector(".expeditionDebrisSlotBox .ogl_expeditionRow") || Util.addDom("div", {
        class: "ogl_expeditionRow",
        parent: document.querySelector(".expeditionDebrisSlotBox")
      })).innerHTML = `\n                <div>\n                    <div class="material-icons">debris</div>\n                </div>\n                <div class="ogl_expeditionDebris">\n                    <div class="ogl_icon ogl_metal">${Util.formatToUnits(e.metal)}</div>\n                    <div class="ogl_icon ogl_crystal">${Util.formatToUnits(e.crystal)}</div>\n                    <div class="ogl_icon ogl_deut">${Util.formatToUnits(e.deut)}</div>\n                    <div class="ogl_expeditionText">${o.innerText}</div>\n                    <div class="ogl_expeditionText">${a.outerHTML}</div>\n                </div>\n            `, e.total >= this.ogl.db.options.resourceTreshold && document.querySelector(".ogl_expeditionRow").classList.add("ogl_important")
    }
    t.classList.remove("ogl_hidden")
  }
  unloadSystem() {
    document.querySelector("#galaxyRow16") && (document.querySelector(".ogl_expeditionRow") && document.querySelector(".ogl_expeditionRow").remove(), document.querySelector("#galaxyRow16").classList.remove("ogl_important"));
    for (let e = 1; e < 16; e++) document.querySelectorAll(`#galaxyRow${e} .galaxyCell:not(.cellPosition)`).forEach((e => {
      e.innerText = "", e.classList.remove("ogl_important"), e.classList.remove("ogl_active")
    })), document.querySelector(`#galaxyRow${e}`).className = "galaxyRow ctContentRow empty_filter filtered_filter_empty"
  }
  checkCurrentSystem() {
    document.querySelectorAll("[data-galaxy]").forEach((e => {
      let t = e.getAttribute("data-galaxy").split(":");
      this.galaxy == t[0] && this.system == t[1] ? e.classList.add("ogl_active") : e.classList.remove("ogl_active")
    }))
  }
}
class JumpgateManager extends Manager {
  load() {
    this.initialRel = {}, Util.overWrite("initJumpgate", unsafeWindow, !1, (() => {
      this.check()
    })), Util.overWrite("initPhalanx", unsafeWindow, !1, (() => {
      this.checkPhalanx()
    })), this.saveTimer(), this.displayTimer()
  }
  check() {
    const e = document.querySelector("#jumpgate");
    if (!e || e.querySelector(".ogl_limiterLabel")) return;
    document.querySelectorAll("#jumpgate .ship_input_row").forEach((e => {
      if (e.previousElementSibling.classList.contains("tdInactive")) return;
      const t = e.querySelector("input"),
        n = t.getAttribute("id").replace("ship_", "");
      this.initialRel[n] = parseInt(t.getAttribute("rel"))
    }));
    const t = Util.addDom("fieldset", {
      parent: document.querySelector("#jumpgateForm .ship_selection_table")
    });
    Util.addDom("legend", {
      parent: t,
      child: "Settings"
    });
    const n = Util.addDom("label", {
        class: "ogl_limiterLabel",
        parent: t,
        child: "Ships"
      }),
      o = Util.addDom("input", {
        type: "checkbox",
        parent: n,
        onclick: () => {
          this.ogl.db.fleetLimiter.jumpgateActive = !this.ogl.db.fleetLimiter.jumpgateActive, this.updateLimiter()
        }
      }),
      a = Util.addDom("div", {
        class: "ogl_limiterGroup",
        parent: t,
        child: "Force (jumpgate)"
      });
    [202, 203, 219, 200].forEach((e => {
      const t = Util.addDom("div", {
        class: `ogl_icon ogl_${e}`,
        parent: a,
        onclick: () => {
          a.querySelector(".ogl_active")?.classList.remove("ogl_active"), t.classList.add("ogl_active"), this.ogl.db.keepEnoughCapacityShipJumpgate = e, this.updateLimiter()
        }
      });
      this.ogl.db.keepEnoughCapacityShipJumpgate == e && t.classList.add("ogl_active")
    })), this.ogl.db.fleetLimiter.jumpgateActive && (o.checked = !0), this.updateLimiter()
  }
  updateLimiter() {
    if (!document.querySelector("#jumpgate") || document.querySelector("#jumpgateNotReady")) return;
    const e = {};
    document.querySelectorAll("#jumpgate .ship_input_row").forEach((t => {
      if (t.previousElementSibling.classList.contains("tdInactive")) return;
      const n = t.querySelector("input"),
        o = n.getAttribute("id").replace("ship_", "");
      let a = 0;
      this.ogl.db.keepEnoughCapacityShipJumpgate == o && (a = this.ogl._fleet.shipsForResources(o));
      const i = Math.max(a, this.ogl.db.fleetLimiter.jumpgateActive && this.ogl.db.fleetLimiter.jumpgateData[o] || 0),
        r = Math.max(0, this.initialRel[o] - i);
      n.setAttribute("rel", r), n.value > r && (n.value = r), t.previousElementSibling.querySelector(".quantity").setAttribute("onclick", `toggleMaxShips('#jumpgateForm', ${o}, ${r})`), t.previousElementSibling.querySelector("a").setAttribute("onclick", `toggleMaxShips('#jumpgateForm', ${o}, ${r})`);
      let l = t.querySelector(".ogl_keepRecap") || Util.addDom("div", {
        parent: t,
        class: "ogl_keepRecap"
      });
      l.innerText = `-${i}`, l.addEventListener("click", (() => {
        Util.runAsync((() => this.ogl._ui.openFleetProfile())).then((e => this.ogl._popup.open(e)))
      })), e[o] = r
    })), document.querySelector("#jumpgate #sendall").setAttribute("onclick", `setMaxIntInput("#jumpgateForm", ${JSON.stringify(e)})`)
  }
  checkPhalanx() {
    const e = document.querySelector("#phalanxWrap"),
      t = Util.addDom("div", {
        prepend: e,
        child: "<span>Last update:</span><br>",
        class: "ogl_phalanxLastUpdate"
      }),
      n = document.querySelector(".OGameClock").cloneNode(!0);
    n.className = "", t.appendChild(n);
    const o = Util.addDom("span", {
      parent: t,
      child: " - <b>0s</b>"
    });
    setInterval((() => {
      const e = parseInt(document.querySelector(".OGameClock").getAttribute("data-time-server")),
        t = parseInt(n.getAttribute("data-time-server"));
      o.innerHTML = ` - <b>${(e-t)/1e3}s</b>`
    }), 1e3)
  }
  saveTimer() {
    const e = e => (.25 * Math.pow(e, 2) - 7.57 * e + 67.34) / this.ogl.server.warFleetSpeed * 6e4;
    jumpgateDone = t => {
      if ((t = $.parseJSON(t)).status) {
        planet = t.targetMoon, $(".overlayDiv").dialog("destroy");
        const n = this.ogl.currentPlanet.obj.id,
          o = this.ogl.currentPlanet.dom.element.parentNode.querySelector(".moonlink").getAttribute("data-jumpgatelevel"),
          a = document.querySelector(`.moonlink[href*="${jumpGateTargetId}"]`).getAttribute("data-jumpgatelevel"),
          i = serverTime.getTime();
        this.ogl.db.myPlanets[n].jumpgateTimer = i + e(o), this.ogl.db.myPlanets[jumpGateTargetId].jumpgateTimer = i + e(a)
      }
      errorBoxAsArray(t.errorbox), void 0 !== t.newToken && setNewTokenData(t.newToken)
    }
  }
  displayTimer() {
    document.querySelectorAll(".moonlink").forEach((e => {
      const t = e.parentNode.querySelector(".ogl_sideIconInfo") || Util.addDom("div", {
          class: "ogl_sideIconInfo tooltip",
          title: "Jumpgate not ready",
          parent: e.parentNode
        }),
        n = e.getAttribute("href").match(/cp=(\d+)/)[1];
      if (this.ogl.db.myPlanets[n]?.jumpgateTimer > serverTime.getTime()) {
        const e = () => new Date(this.ogl.db.myPlanets[n].jumpgateTimer - (serverTime.getTime() + 36e5)).toLocaleTimeString([], {
            minute: "2-digit",
            second: "2-digit"
          }),
          o = Util.addDom("div", {
            class: "ogl_jumpgateTimer",
            parent: t,
            child: e()
          });
        let a = setInterval((() => {
          this.ogl.db.myPlanets[n].jumpgateTimer <= serverTime.getTime() ? (clearInterval(a), o.remove()) : o.innerText = e()
        }), 1e3)
      }
    }))
  }
}
class TooltipManager extends Manager {
  load() {
    this.openTimeout, this.lastSender, this.lastActiveSender, this.shouldWait = !1, unsafeWindow.tippy && Util.overWrite("initTooltips", unsafeWindow, null, (() => {
      document.querySelectorAll(getTooltipSelector()).forEach((e => {
        e._tippy?.oglTooltipReady || (e._tippy ? (e._tippy.setProps({
          animation: "pop",
          delay: [e.classList.contains("tooltipClick") ? 0 : 400, null],
          duration: [100, 0],
          interactive: !!e.classList.contains("tooltipClose"),
          trigger: e.classList.contains("tooltipClick") ? "click focus" : "mouseenter focus",
          onShow: t => {
            let n = t.props.content;
            if (e.classList.contains("planetlink") ? n = this.updatePlanetMenuTooltip(t, "planet") : e.classList.contains("moonlink") && (n = this.updatePlanetMenuTooltip(t, "moon")), !1 === n || "" === n) return !1;
            n && t.setContent(n), e.classList.contains("tooltipUpdate") && e.dispatchEvent(this.ogl.tooltipEvent)
          },
          onTrigger: t => {
            e.removeAttribute("title")
          }
        }), e._tippy.oglTooltipReady = !0, e.classList.add("ogl_ready")) : tippy(e))
      }))
    })), this.tooltip = Util.addDom("div", {
      class: "ogl_tooltip",
      parent: document.body
    }), document.querySelector("#metal_box")?.getAttribute("title") || getAjaxResourcebox(), unsafeWindow.tippy ? initTooltips() : this.init()
  }
  updatePlanetMenuTooltip(e, t) {
    if (this.ogl.db.options.disablePlanetTooltips) return !1;
    if (!e.oglContentInjected) {
      if ("planet" == t) {
        e.setProps({
          placement: "left"
        });
        const t = e.reference.parentNode.getAttribute("id").replace("planet-", ""),
          n = e.reference.querySelector(".planet-name").innerText,
          o = this.ogl.db.myPlanets[t],
          a = Util.addDom("div", {
            class: "ogl_planetTooltip"
          }),
          i = (new DOMParser).parseFromString(e.props.content, "text/html").querySelectorAll("a");
        if (!o) return;
        return o?.lifeform && Util.addDom("div", {
          parent: a,
          class: `ogl_icon ogl_lifeform${o.lifeform}`
        }), a.appendChild(e.reference.querySelector(".planetPic").cloneNode()), Util.addDom("h3", {
          parent: a,
          child: `<span data-galaxy="${o.coords}">[${o.coords}]</span><br>${n}`
        }), Util.addDom("div", {
          class: "ogl_textCenter",
          parent: a,
          child: `${o.fieldUsed}/${o.fieldMax}`
        }), Util.addDom("div", {
          class: "ogl_textCenter",
          parent: a,
          child: `${o.temperature+40}°c`
        }), Util.addDom("hr", {
          parent: a
        }), Util.addDom("div", {
          class: "ogl_mineRecap",
          child: `<span class='ogl_metal'>${o[1]}</span> <span class='ogl_crystal'>${o[2]}</span> <span class='ogl_deut'>${o[3]}</span>`,
          parent: a
        }), this.ogl._topbar?.PlanetBuildingtooltip[t] && a.appendChild(this.ogl._topbar?.PlanetBuildingtooltip[t]), Util.addDom("hr", {
          parent: a
        }), i.forEach((e => a.appendChild(e))), e.oglContentInjected = !0, a
      }
      if ("moon" == t) {
        e.setProps({
          placement: "right"
        });
        const t = new URLSearchParams(e.reference.getAttribute("href")).get("cp").split("#")[0],
          n = e.reference.querySelector(".icon-moon").getAttribute("alt"),
          o = this.ogl.db.myPlanets[t],
          a = Util.addDom("div", {
            class: "ogl_planetTooltip"
          }),
          i = (new DOMParser).parseFromString(e.props.content, "text/html").querySelectorAll("a");
        if (!o) return;
        return a.appendChild(e.reference.querySelector(".icon-moon").cloneNode()), Util.addDom("h3", {
          parent: a,
          child: `<span data-galaxy="${o.coords}">[${o.coords}]</span><br>${n}`
        }), Util.addDom("div", {
          class: "ogl_textCenter",
          parent: a,
          child: `${o.fieldUsed}/${o.fieldMax}`
        }), Util.addDom("hr", {
          parent: a
        }), this.ogl._topbar?.PlanetBuildingtooltip[t] && a.appendChild(this.ogl._topbar?.PlanetBuildingtooltip[t]), i.forEach((e => a.appendChild(e))), e.oglContentInjected = !0, a
      }
    }
  }
  init(e) {
    e = e || this;
    const t = Array.from(document.querySelectorAll(":hover") || []);
    document.querySelectorAll('[class*="tooltip"] [class*="tooltip"]:not(.ogl_tooltip):not(.ogl_ready)').forEach((e => {
      e.classList.add("ogl_ready"), e.removeAttribute("title")
    })), document.querySelectorAll('[class*="tooltip"]:not(.ogl_tooltip):not(.ogl_ready):not([class*="tooltip"] [class*="tooltip"])').forEach((n => {
      n.classList.add("ogl_ready"), n.getAttribute("rel")?.indexOf("player") > -1 && n.classList.add("tooltipUpdate"), n.title && n.setAttribute("data-title", n.title), n.removeAttribute("title");
      const o = n.classList.contains("tooltipClick"),
        a = n.classList.contains("tooltipCustom"),
        i = n.classList.contains("tooltipClose"),
        r = n.classList.contains("tooltipRel"),
        l = n.classList.contains("tooltipUpdate") || n.classList.contains("recallFleet") || n.classList.contains("player") && n.classList.contains("advice"),
        s = n.classList.contains("ogl_flagPicker"),
        d = n.classList.contains("ogl_tagPicker"),
        c = o || s || d ? 1 : 0;
      let p = o ? "click" : "mouseenter";
      "click" == p ? n.addEventListener("mouseenter", (() => {
        this.lastActiveSender = n, this.lastSender = n, n.title && n.setAttribute("data-title", n.title), n.removeAttribute("title")
      })) : e.ogl.isMobile || n.addEventListener("click", (() => {
        clearTimeout(this.openTimeout), this.close()
      })), n.closest("#top, #box") && n.classList.add("tooltipBottom"), n.addEventListener(p, (t => {
        t.detail > 1 || o && t.shiftKey || (this.lastSender = n, n.title && n.setAttribute("data-title", n.title), n.removeAttribute("title"), e.openTimeout = setTimeout((() => {
          if (this.lastActiveSender = this.lastSender, e.tooltip.innerText = "", e.tooltip.classList.remove("ogl_active"), r || s || l) l ? n.dispatchEvent(this.ogl.tooltipEvent) : e.tooltip.appendChild(document.querySelector("#" + n.getAttribute("rel")).cloneNode(!0));
          else {
            if (!n.getAttribute("data-title")) return;
            n.classList.contains("show_fleet_apikey") ? e.tooltip.innerHTML = `<div>${n.getAttribute("data-title")}</div>` : e.tooltip.innerHTML = `<div>${n.getAttribute("data-title")?.replace(/\|/g,"<hr>")}</div>`
          }
          if (e.prepare(n), "" == e.tooltip.innerHTML) return;
          (o || i) && (this.closeBtn = Util.addDom("div", {
            class: "material-icons ogl_close",
            child: "close-thick",
            parent: e.tooltip,
            onclick: () => e.close()
          })), e.triangle = Util.addDom("div", {
            class: "ogl_tooltipTriangle",
            parent: e.tooltip
          });
          0 != e.recalcPosition(n, e) && (clearTimeout(e.openTimeout), d && t.shiftKey || n.closest("#planetList") && document.body.classList.contains("ogl_destinationPicker") || "" === e.tooltip.innerHTML.trim() || "undefined" === e.tooltip.innerHTML.trim() || (e.openTimeout = setTimeout((() => {
            "click" == p || e.tooltip.querySelector(".ogl_playerData") || e.ogl.isMobile ? this.shouldWait = !0 : this.shouldWait = !1, e.tooltip.classList.add("ogl_active")
          }), this.shouldWait ? 0 : c || e.ogl.db.options.tooltipDelay)))
        }), this.shouldWait ? c || e.ogl.db.options.tooltipDelay : 0))
      })), !o && t.find((e => e == n)) && n.dispatchEvent(new Event("mouseenter")), n.addEventListener("pointerleave", (() => {
        clearTimeout(e.openTimeout), n.classList.contains("tooltipClose") || a || this.lastActiveSender != this.lastSender || e.tooltip.classList.remove("ogl_active")
      }))
    }))
  }
  close() {
    this.tooltip.classList.remove("ogl_active")
  }
  prepare(e) {
    if (this.tooltip.querySelector(".fleetinfo")) {
      const e = (this.lastSender.closest(".eventFleet")?.querySelector(".coordsOrigin") || this.lastSender.closest(".fleetDetails")?.querySelector(".originData a"))?.innerText.slice(1, -1),
        t = Util.addDom("div", {
          class: "ogl_fleetDetail"
        });
      let n = "",
        o = {
          ships: {}
        };
      if (this.tooltip.querySelectorAll("tr").forEach((e => {
          const a = e.querySelector("td")?.innerText.replace(":", ""),
            i = Object.entries(this.ogl.db.serverData).find((e => e[1] === a))?.[0],
            r = e.querySelector(".value")?.innerText.replace(/\.|,| /g, "");
          if (i && r) {
            "metal" == i && Util.addDom("hr", {
              parent: t
            });
            const e = "metal" == i || "crystal" == i || "deut" == i || "food" == i ? Util.formatNumber(parseInt(r)) : Util.formatToUnits(r);
            Util.addDom("div", {
              parent: t,
              class: `ogl_icon ogl_${i}`,
              child: e
            }), o.ships[i] = {
              count: r
            }, n += `${a}: ${Util.formatNumber(parseInt(r))}\n`
          }
        })), n.length > 0) {
        const a = Util.addDom("span", {
          parent: t,
          class: "ogl_fullgrid"
        });
        Util.addDom("hr", {
          parent: a
        });
        const i = Util.addDom("button", {
          class: "ogl_button",
          parent: a,
          child: '<span class="material-icons">content-copy</span><span>Copy</span>',
          onclick: () => {
            navigator.clipboard.writeText(n), i.classList.remove("material-icons"), i.innerText = "Copied!"
          }
        });
        e && Util.addDom("div", {
          class: "ogl_button",
          parent: a,
          child: '<span class="material-icons">letter_s</span><span>Simulate</span>',
          onclick: () => {
            Array.from(document.querySelectorAll(".planet-koords")).find((t => t.innerText == e)) ? window.open(Util.genTrashsimLink(this.ogl, !1, o, !1, !1), "_blank") : (o.planet = {
              galaxy: e.split(":")[0],
              system: e.split(":")[1],
              position: e.split(":")[2]
            }, window.open(Util.genTrashsimLink(this.ogl, !1, !1, o, !0), "_blank"))
          }
        })
      }
      n.length > 0 && (this.tooltip.innerText = "", this.tooltip.appendChild(t))
    }
    else if (this.lastSender.classList.contains("planetlink")) {
      if (this.ogl.db.options.disablePlanetTooltips) return this.tooltip.innerText = "", clearTimeout(this.openTimeout), void this.close();
      const e = this.lastSender.parentNode.getAttribute("id").replace("planet-", ""),
        t = this.lastSender.querySelector(".planet-name").innerText,
        n = this.ogl.db.myPlanets[e],
        o = Util.addDom("div", {
          class: "ogl_planetTooltip"
        }),
        a = this.tooltip.querySelectorAll("a");
      if (!n) return;
      n?.lifeform && Util.addDom("div", {
        parent: o,
        class: `ogl_icon ogl_lifeform${n.lifeform}`
      }), o.appendChild(this.lastSender.querySelector(".planetPic").cloneNode()), Util.addDom("h3", {
        parent: o,
        child: `<span data-galaxy="${n.coords}">[${n.coords}]</span><br>${t}`
      }), Util.addDom("div", {
        class: "ogl_textCenter",
        parent: o,
        child: `${n.fieldUsed}/${n.fieldMax}`
      }), Util.addDom("div", {
        class: "ogl_textCenter",
        parent: o,
        child: `${n.temperature+40}°c`
      }), Util.addDom("hr", {
        parent: o
      }), Util.addDom("div", {
        class: "ogl_mineRecap",
        child: `<span class='ogl_metal'>${n[1]}</span> <span class='ogl_crystal'>${n[2]}</span> <span class='ogl_deut'>${n[3]}</span>`,
        parent: o
      }), this.ogl._topbar?.PlanetBuildingtooltip[e] && o.appendChild(this.ogl._topbar?.PlanetBuildingtooltip[e]), Util.addDom("hr", {
        parent: o
      }), a.forEach((e => o.appendChild(e))), this.tooltip.innerText = "", this.tooltip.appendChild(o)
    }
    else if (this.lastSender.classList.contains("moonlink")) {
      if (this.ogl.db.options.disablePlanetTooltips) return this.tooltip.innerText = "", clearTimeout(this.openTimeout), void this.close();
      const e = new URLSearchParams(this.lastSender.getAttribute("href")).get("cp").split("#")[0],
        t = this.lastSender.querySelector(".icon-moon").getAttribute("alt"),
        n = this.ogl.db.myPlanets[e],
        o = Util.addDom("div", {
          class: "ogl_planetTooltip"
        }),
        a = this.tooltip.querySelectorAll("a");
      if (!n) return;
      o.appendChild(this.lastSender.querySelector(".icon-moon").cloneNode()), Util.addDom("h3", {
        parent: o,
        child: `<span data-galaxy="${n.coords}">[${n.coords}]</span><br>${t}`
      }), Util.addDom("div", {
        class: "ogl_textCenter",
        parent: o,
        child: `${n.fieldUsed}/${n.fieldMax}`
      }), Util.addDom("hr", {
        parent: o
      }), this.ogl._topbar?.PlanetBuildingtooltip[e] && o.appendChild(this.ogl._topbar?.PlanetBuildingtooltip[e]), a.forEach((e => o.appendChild(e))), this.tooltip.innerText = "", this.tooltip.appendChild(o)
    }
    this.lastSender != e && (this.tooltip.innerText = "")
  }
  update(e, t) {
    const n = (t = t || this.lastSender).classList.contains("tooltipClick"),
      o = (t.classList.contains("tooltipCustom"), t.classList.contains("tooltipClose")),
      a = (t.classList.contains("tooltipRel"), t.classList.contains("tooltipUpdate"), t.getAttribute("data-flagpicker"));
    this.tooltip.innerText = "", this.tooltip.appendChild(e), (n || a || o) && !this.tooltip.querySelector(".ogl_close") && (this.closeBtn = Util.addDom("div", {
      class: "material-icons ogl_close",
      child: "close-thick",
      parent: this.tooltip,
      onclick: () => this.close()
    })), this.tooltip.querySelector(".ogl_tooltipTriangle") || (this.triangle = Util.addDom("div", {
      class: "ogl_tooltipTriangle",
      parent: this.tooltip
    }));
    0 == this.recalcPosition(t, this) && this.close()
  }
  recalcPosition(e, t) {
    let n = e.getBoundingClientRect(),
      o = t.tooltip.getBoundingClientRect(),
      a = 10,
      i = 0,
      r = 0;
    return e.classList.contains("tooltipLeft") ? (i = parseInt(n.left - o.width + window.scrollX), r = parseInt(n.bottom - (o.height / 2 + n.height / 2 - window.scrollY)), i = Math.min(Math.max(i, a + window.scrollX), window.innerWidth - a + window.scrollX - o.width), r = Math.min(Math.max(r, a + window.scrollY), window.innerHeight - a + window.scrollY - o.height), t.tooltip.setAttribute("data-direction", "left"), t.tooltip.style.transform = `translateX(${Math.ceil(i)}px) translateY(${Math.ceil(r)}px)`, t.triangle.style.top = n.top + n.height / 2 - r - a - 6 + window.scrollY + "px", t.triangle.style.right = "-5px") : e.classList.contains("tooltipRight") ? (i = parseInt(n.left + n.width + window.scrollX), r = parseInt(n.bottom - (o.height / 2 + n.height / 2 - window.scrollY)), i = Math.min(Math.max(i, a + window.scrollX), window.innerWidth - a + window.scrollX - o.width), r = Math.min(Math.max(r, a + window.scrollY), window.innerHeight - a + window.scrollY - o.height), e.classList.contains("moonlink") && i == window.innerWidth - a + window.scrollX - o.width && (i = n.left + n.width + window.scrollX), t.tooltip.setAttribute("data-direction", "right"), t.tooltip.style.transform = `translateX(${Math.floor(i)}px) translateY(${Math.floor(r)}px)`, t.triangle.style.top = n.top + n.height / 2 - r - a - 6 + window.scrollY + "px", t.triangle.style.left = "-5px") : e.classList.contains("tooltipBottom") ? (i = parseInt(n.left + window.scrollX - (o.width / 2 - n.width / 2)), r = parseInt(n.bottom + window.scrollY), i = Math.min(Math.max(i, a + window.scrollX), window.innerWidth - a + window.scrollX - o.width), r = Math.min(Math.max(r, a + window.scrollY), window.innerHeight - a + window.scrollY - o.height), t.tooltip.setAttribute("data-direction", "bottom"), t.tooltip.style.transform = `translateX(${Math.floor(i)}px) translateY(${Math.floor(r)}px)`, t.triangle.style.top = "-5px", t.triangle.style.left = n.left - i - a - 6 + n.width / 2 + window.scrollX + "px") : (i = parseInt(n.left + window.scrollX - (o.width / 2 - n.width / 2)), r = parseInt(n.top - (o.height - window.scrollY)), i = Math.min(Math.max(i, a + window.scrollX), window.innerWidth - a + window.scrollX - o.width), r = Math.min(Math.max(r, a + window.scrollY), window.innerHeight - a + window.scrollY - o.height), t.tooltip.setAttribute("data-direction", "top"), t.tooltip.style.transform = `translateX(${Math.ceil(i)}px) translateY(${Math.ceil(r)}px)`, t.triangle.style.bottom = "-5px", t.triangle.style.left = n.left - i - a - 6 + n.width / 2 + window.scrollX + "px"), i + r
  }
}
class NotificationManager extends Manager {
  load() {
    this.data = {}, this.blocks = [], this.interval, this.hideTimer = 5e3, this.step = 200, this.currentValue = this.hideTimer, this.start = 0, this.timeLeft = this.hideTimer, this.elapsedInterval, this.notification = Util.addDom("div", {
      class: "ogl_notification",
      parent: document.body,
      onmouseenter: () => {
        clearInterval(this.interval)
      },
      onmouseleave: () => {
        this.interval = setInterval((() => this.updateClock()), this.step)
      },
      onclick: () => {
        this.close()
      }
    }), this.clock = Util.addDom("progress", {
      parent: this.notification,
      min: 0,
      max: this.hideTimer,
      value: this.currentValue
    }), this.content = Util.addDom("div", {
      parent: this.notification
    })
  }
  open() {
    this.content.innerText = "", this.ogl._message.events?.mission && (this.ogl._message.events.mission = 0);
    const e = {};
    let t = 0;
    if (this.blocks.forEach((n => {
        let o = Util.addDom("i");
        if (n.success > 0 ? o = Util.addDom("i", {
            class: "material-icons ogl_ok",
            child: "done"
          }) : n.success < 0 && (o = Util.addDom("i", {
            class: "material-icons ogl_danger",
            child: "alert"
          })), n.data && Object.entries(n.data).forEach((t => {
            e[t[0]] = (e[t[0]] || 0) + (t[1] || 0)
          })), n.message) {
          const e = Util.addDom("div", {
            class: "ogl_notificationLine",
            child: `${o.outerHTML}<b class="ogl_notificationTimer">[${this.ogl._time.timeToHMS(this.ogl._time.getClientTime(n.time))}]</b>` + n.message,
            prepend: this.content
          });
          n.success < 0 && e.classList.add("ogl_danger")
        }
        else t++
      })), t > 0 && Util.addDom("div", {
        class: "ogl_notificationLine",
        child: `<b class="ogl_notificationTimer">[${this.ogl._time.timeToHMS(this.ogl._time.getClientTime())}]</b>${t} mission(s) added`,
        prepend: this.content
      }), Object.keys(e).length > 0) {
      let t = !1,
        n = !1,
        o = !1,
        a = !1;
      const i = Util.addDom("div", {
        class: "ogl_grid",
        prepend: this.content
      });
      ["metal", "crystal", "deut", "dm"].forEach((n => {
        e[n] && (Util.addDom("div", {
          class: `ogl_icon ogl_${n}`,
          child: Util.formatToUnits(e[n]),
          parent: i
        }), t = !0)
      })), t && Util.addDom("hr", {
        parent: i
      }), this.ogl.shipsList.forEach((t => {
        e[t] && (Util.addDom("div", {
          class: `ogl_icon ogl_${t}`,
          child: Util.formatToUnits(e[t]),
          parent: i
        }), n = !0)
      })), n && Util.addDom("hr", {
        parent: i
      }), ["artefact", "lifeform1", "lifeform2", "lifeform3", "lifeform4"].forEach((t => {
        e[t] && (Util.addDom("div", {
          class: `ogl_icon ogl_${t}`,
          child: Util.formatToUnits(e[t]),
          parent: i
        }), o = !0)
      })), o && Util.addDom("hr", {
        parent: i
      }), ["blackhole", "trader", "early", "late", "pirate", "alien"].forEach((t => {
        e[t] && (Util.addDom("div", {
          "data-resultType": t,
          class: `ogl_icon ogl_${t}`,
          child: Util.formatToUnits(e[t]),
          parent: i
        }), a = !0)
      })), a && Util.addDom("hr", {
        parent: i
      })
    }
    this.currentValue = this.hideTimer, this.notification.classList.add("ogl_active"), clearInterval(this.interval), this.interval = setInterval((() => this.updateClock()), this.step)
  }
  addToQueue(e, t, n) {
    this.blocks.push({
      time: serverTime.getTime(),
      message: e,
      data: n,
      success: t = !0 === t ? 1 : !1 === t ? -1 : 0
    }), this.blocks.sort(((e, t) => e.time - t.time)), this.blocks = this.blocks.filter((e => serverTime.getTime() < e.time + this.hideTimer)), this.open()
  }
  updateClock() {
    this.currentValue -= this.step, this.clock.value = this.currentValue, this.currentValue < 0 && this.close()
  }
  close() {
    clearInterval(this.interval), this.notification.classList.remove("ogl_active")
  }
}
class PopupManager extends Manager {
  load() {
    this.popup = Util.addDom("div", {
      class: "ogl_popup",
      parent: document.body
    }), this.popup.addEventListener("click", (e => {
      e.target === this.popup && this.close()
    }))
  }
  open(e, t) {
    this.ogl._tooltip && this.ogl._tooltip.close(), this.popup.innerText = "", e && (Util.addDom("div", {
      class: "ogl_close material-icons",
      child: "close-thick",
      prepend: e,
      onclick: () => {
        this.close()
      }
    }), t && Util.addDom("div", {
      class: "ogl_share material-icons",
      child: "camera",
      prepend: e,
      onclick: e => {
        e.target.classList.add("ogl_disabled"), Util.takeScreenshot(this.popup.querySelector("div"), e.target, `ogl_${this.ogl.server.id}_${this.ogl.server.lang}_empire_${serverTime.getTime()}`)
      }
    }), this.popup.appendChild(e), this.popup.classList.add("ogl_active"))
  }
  close() {
    this.popup.classList.remove("ogl_active")
  }
}
class MessageManager extends Manager {
  load() {
    if (this.ogl.cache.reports = this.ogl.cache.reports || {}, this.ogl.cache.raids = this.ogl.cache.raids || {}, this.ogl.cache.counterSpies = this.ogl.cache.counterSpies || [], this.checkBoard(), "messages" !== this.ogl.page) return;
    this.tokenReady = !0, this.deleteQueue = [], this.updateStatsTimeout, this.loopQueueTimeout, this.events = {
      mission: 0
    }, this.hasNewEntry = !1;
    const e = localStorage.getItem("ogl_tempExpe");
    this.expeResults = e ? JSON.parse(e) : Datafinder.getAllExpeditionsText(), unsafeWindow.tippy ? (Util.overWrite("paginatorPrevious", unsafeWindow.ogame.messages, !1, (() => {
      this.check()
    })), Util.overWrite("paginatorNext", unsafeWindow.ogame.messages, !1, (() => {
      this.check()
    }))) : Util.overWrite("doInitAction", unsafeWindow.ogame.messages, !1, (() => {
      const e = ogame.messages.getCurrentMessageTab();
      this.spytable && 20 == e && this.spytable.classList.remove("ogl_hidden"), unsafeWindow.ogame.messages.getCurrentEarliestMessage() && this.check()
    })), setTimeout((() => this.loopDeleteQueue()), 500)
  }
  loopDeleteQueue() {
    this.deleteQueue.length, this.deleteMessage(), setTimeout((() => this.loopDeleteQueue()), 300)
  }
  check() {
    if (unsafeWindow.tippy) {
      const e = {};
      20 == this.tabID && (this.spytable = document.querySelector(".ogl_spytable"), this.spytable ? this.spytable.classList.remove("ogl_hidden") : (this.spytable = Util.addDom("div", {
        class: "ogl_spytable",
        before: document.querySelector("#filteredHeadersRow")
      }), Util.addDom("div", {
        class: "ogl_spyHeader",
        parent: this.spytable,
        child: '\n                            <b class="ogl_textCenter">#</b>\n                            <b class="material-icons" data-filter="date">schedule</b>\n                            <b class="ogl_textCenter">*</b>\n                            <b class="ogl_textCenter">&nbsp;</b>\n                            <b data-filter="rawCoords">coords</b>\n                            <b data-filter="name">name</b>\n                            <b data-filter="totalDESC">loot</b>\n                            <b class="material-icons" data-filter="fleetDESC">rocket_launch</b>\n                            <b class="material-icons" data-filter="defDESC">security</b>\n                            <b></b>\n                        '
      }))), this.spytable && (20 == this.tabID && this.ogl.db.options.displaySpyTable ? this.spytable.classList.remove("ogl_hidden") : this.spytable.classList.add("ogl_hidden")), this.expeditionRecap && (22 != this.tabID ? this.expeditionRecap.classList.add("ogl_hidden") : this.expeditionRecap.classList.remove("ogl_hidden")), ogame.messages.content.forEach((t => {
        const n = (new DOMParser).parseFromString(t, "text/xml").querySelector(".msg");
        if (!n) return;
        const o = n.querySelector(".rawMessageData");
        if (!o) return;
        const a = {};
        if (a.id = n.getAttribute("data-msg-id"), 20 == this.tabID) {
          a.playerID = o.getAttribute("data-raw-targetplayerid"), a.planetID = o.getAttribute("data-raw-targetplanetid"), a.playerName = o.getAttribute("data-raw-playerName"), a.targetType = 1 == o.getAttribute("data-raw-targetPlanetType") ? "planet" : "moon", a.targetTypeID = o.getAttribute("data-raw-targetPlanetType"), a.coords = o.getAttribute("data-raw-coordinates"), a.date = 1e3 * parseInt(o.getAttribute("data-raw-dateTime")), a.age = 1e3 * parseInt(o.getAttribute("data-raw-reportAge")), a.activity = o.getAttribute("data-raw-activity"), a.resources = parseInt(o.getAttribute("data-raw-resources")), a.metal = parseInt(o.getAttribute("data-raw-metal")), a.crystal = parseInt(o.getAttribute("data-raw-crystal")), a.deut = parseInt(o.getAttribute("data-raw-deuterium")), a.fleet = o.getAttribute("data-raw-fleet"), a.def = JSON.parse(o.getAttribute("data-raw-defense") || "{}"), a.loot = parseInt(o.getAttribute("data-raw-loot")), a.wave1 = Math.floor(a.resources * a.loot / 100), a.wave2 = Math.floor(a.wave1 * a.loot / 100), a.wave3 = Math.floor(a.wave2 * a.loot / 100), a.wave4 = Math.floor(a.wave3 * a.loot / 100), a.wave5 = Math.floor(a.wave4 * a.loot / 100), a.wave6 = Math.floor(a.wave5 * a.loot / 100), a.fleetValue = 0, a.defValue = 0;
          for (let [e, t] of Object.entries(a.def)) e > 200 && e < 300 && Object.entries(Datafinder.getTech(Math.abs(e))).forEach((e => a.fleetValue += e[1] * t));
          for (let [e, t] of Object.entries(a.def)) e > 400 && e < 500 && Object.entries(Datafinder.getTech(Math.abs(e))).forEach((e => a.defValue += e[1] * t));
          a.playerName != ogl.account.name && this.addToSpyTable(a)
        }
        else if (21 == this.tabID) {
          if (a.defenderSpace = JSON.parse(o.getAttribute("data-raw-defenderSpaceObject") || "{}"), a.fleets = JSON.parse(o.getAttribute("data-raw-fleets") || "{}"), a.rounds = JSON.parse(o.getAttribute("data-raw-fleets") || "{}"), a.result = JSON.parse(o.getAttribute("data-raw-result") || "{}"), a.api = o.getAttribute("data-raw-hashCode"), a.gain = {}, !a.result?.debris?.resources) return;
          a.result.debris.resources.forEach((e => {
            e.remaining > 0 && (a.gain[e.resource.replace("deuterium", "deut")] = e.remaining, a.resultType = "debris")
          })), a.resultType && this.summarize(a)
        }
        else 22 == this.tabID && (a.expeditionResult = o.getAttribute("data-raw-expeditionresult") || o.getAttribute("data-raw-expeditionResult"), a.resources = JSON.parse(o.getAttribute("data-raw-resourcesGained")?.replace("deuterium", "deut")?.replace("darkMatter", "dm") || "{}"), a.artefact = parseInt(o.getAttribute("data-raw-artifactsFound") || 0), a.lfXP = parseInt(o.getAttribute("data-raw-lifeformGainedExperience") || 0), a.ships = {}, "ressources" == a.expeditionResult || "darkmatter" == a.expeditionResult ? a.resultType = "resource" : a.artefact > 0 ? a.resultType = "artefact" : a.lfXP > 0 && (a.resultType = "lifeform"), Object.entries(JSON.parse(o.getAttribute("data-raw-technologiesGained") || "{}")).forEach((e => {
          a.resultType = "ship", a.ships[e[0]] = e[1].amount
        })), a.gain = {
          ...a.resources,
          ...a.ships,
          artefact: a.artefact
        }, Object.entries(a.gain).forEach((t => {
          e[t[0]] = (e[t[0]] || 0) + t[1]
        })), a.resultType && this.summarize(a))
      })), this.tabID, initTooltips()
    }
    document.querySelectorAll(".msg:not(.ogl_killReady)").forEach((e => {
      e.classList.add("ogl_killReady");
      const t = e.getAttribute("data-msg-id");
      e.querySelector(".icon_refuse") && (e.querySelector(".icon_refuse").classList.contains("js_actionKill") && (e.querySelector(".icon_refuse").className = "icon_nf icon_refuse", e.querySelector(".icon_refuse").addEventListener("click", (() => {
        this.addToDeleteQueue(t)
      }))), this.ogl._time.update(!1, e.querySelector(".msg_date:not(.ogl_updated)")))
    }));
    let e = ogame.messages.getCurrentMessageTab();
    20 == e || 11 == e ? this.checkReports(e) : 21 == e ? this.checkRaids(e) : 22 == e ? (this.checkExpeditions(), this.checkDiscovery()) : 24 == e ? this.checkRR() : 12 == e && this.checkRaids(e, !0)
  }
  summarize(e) {
    const t = document.querySelector(`[data-msg-id="${e.id}"]`);
    if (!t) return;
    t.querySelector(".ogl_battle") && t.querySelector(".ogl_battle").remove();
    const n = Util.addDom("div", {
      class: "ogl_battle",
      "data-resultType": e.resultType || "unknown",
      before: t.querySelector(".msg_actions"),
      onclick: () => {
        n.classList.contains("ogl_clickable") && t.querySelector(".msgContent").classList.toggle("ogl_hidden")
      }
    });
    Object.entries(e.gain).forEach((e => {
      e[1] > 0 && Util.addDom("div", {
        class: `ogl_icon ogl_${e[0]}`,
        child: Util.formatToUnits(e[1]),
        parent: n
      })
    })), e.resultType && (n.classList.add("ogl_clickable"), t.querySelector(".msgContent").classList.add("ogl_hidden"))
  }
  addToSpyTable(e) {
    if (this.spytable.querySelector(`[data-id="${e.id}"]`)) return;
    const t = document.querySelector(`[data-msg-id="${e.id}"]`);
    let n = 0;
    n = e.age > 864e5 ? Math.floor(e.age / 864e5) + LocalizationStrings.timeunits.short.day : e.age > 36e5 ? Math.floor(e.age / 36e5) + LocalizationStrings.timeunits.short.hour : Math.floor(e.age / 6e4) + LocalizationStrings.timeunits.short.minute;
    const o = Util.addDom("div", {
        class: "ogl_spyLine",
        parent: this.spytable,
        "data-id": e.id
      }),
      a = Util.addDom("div", {
        parent: o
      }),
      i = Util.addDom("div", {
        parent: o,
        class: "ogl_more ogl_hidden"
      });
    for (let t = 1; t < 7; t++) {
      const n = e.coords.split(":"),
        o = e["wave" + t],
        a = Util.addDom("div", {
          parent: i,
          child: `<div>${Util.formatToUnits(o)}</div>`
        });
      this.ogl.fretShips.forEach((t => {
        const i = this.ogl._fleet.shipsForResources(t, Math.round(1.07 * o));
        Util.addDom("a", {
          class: `ogl_icon ogl_${t}`,
          parent: a,
          child: i.toLocaleString("de-DE") || "0",
          href: `?page=ingame&component=fleetdispatch&galaxy=${n[0]}&system=${n[1]}&position=${n[2]}&type=${e.targetTypeID}&mission=1&am${t}=${i}&oglmode=4&oglLazy=true`
        })
      }))
    }
    Util.addDom("span", {
      parent: a,
      class: "ogl_textCenter"
    }), Util.addDom("span", {
      child: n,
      parent: a,
      class: "ogl_textCenter"
    }), Util.addDom("span", {
      child: e.activity.replace("-1", 60),
      parent: a,
      class: "ogl_textCenter"
    });
    const r = Util.addDom("span", {
        parent: a
      }),
      l = Util.addDom("span", {
        child: `<span data-galaxy="${e.coords}">${e.coords}</<span>`,
        parent: a
      });
    Util.addDom("a", {
      child: e.playerName,
      parent: a,
      class: "overlay",
      href: `?page=componentOnly&component=messagedetails&messageId=${e.id}`
    });
    const s = Util.addDom("span", {
        child: Util.formatToUnits(e.wave1),
        parent: a,
        class: "ogl_textRight"
      }),
      d = Util.addDom("span", {
        child: Util.formatToUnits(e.fleetValue, 0),
        parent: a,
        class: "ogl_textRight"
      }),
      c = Util.addDom("span", {
        child: Util.formatToUnits(e.defValue, 0),
        parent: a,
        class: "ogl_textRight"
      }),
      p = Util.addDom("span", {
        class: "ogl_actions",
        parent: a
      });
    this.addSpyIcons(r, e.coords, e.targetType), this.ogl._ui.addTagButton(l, e.coords), e.wave1 >= this.ogl.db.options.resourceTreshold && s.classList.add("ogl_important"), e.fleetValue > 0 && (d.style.background = "linear-gradient(192deg, #622a2a, #3c1717 70%)"), e.defValue > 0 && (c.style.background = "linear-gradient(192deg, #622a2a, #3c1717 70%)"), Util.addDom("div", {
      class: "ogl_button material-icons ogl_moreButton",
      parent: p,
      child: "more_horiz",
      onclick: () => i.classList.toggle("ogl_hidden")
    });
    Util.addDom("a", {
      class: "ogl_button material-icons",
      parent: p,
      child: "target"
    });
    Util.addDom("div", {
      class: "ogl_button material-icons",
      parent: p,
      child: "letter_s"
    }), this.ogl.ptreKey && Util.addDom("div", {
      class: "ogl_button material-icons",
      parent: p,
      child: "ptre"
    }), Util.addDom("div", {
      class: "ogl_button material-icons",
      parent: p,
      child: "close",
      onclick: () => {
        ogame.messages.flagDeleted(t.querySelector(".msgDeleteBtn")), o.remove()
      }
    })
  }
  checkReports(e) {
    if (document.querySelector("#subtabs-nfFleetTrash.ui-state-active")) return;
    const t = document.querySelector(`.ui-tabs-tab[data-tabid="${e}"]`).getAttribute("aria-labelledby"),
      n = document.querySelector(`.ui-tabs-panel[aria-labelledby="${t}"]`),
      o = !(!this.spytable || !n.parentNode.querySelector(".ogl_spytable"));
    if (this.spytable = document.querySelector(".ogl_spytable") || Util.addDom("div", {
        class: "ogl_spytable ogl_hidden"
      }), 20 == e && this.spytable.classList.remove("ogl_hidden"), !o && !this.spytable.querySelector(".ogl_spyHeader")) {
      const e = n.querySelector(".pagination").cloneNode(!0);
      e.querySelectorAll("[data-page]").forEach(((e, t) => {
        e.classList.remove("paginator"), e.addEventListener("click", (() => {
          n.querySelectorAll(".pagination [data-page]")[t].click()
        }))
      })), this.spytable.appendChild(e), Util.addDom("hr", {
        parent: this.spytable
      }), Util.addDom("div", {
        class: "ogl_spyHeader",
        parent: this.spytable,
        child: '\n                    <b class="ogl_textCenter">#</b>\n                    <b class="material-icons" data-filter="date">schedule</b>\n                    <b class="ogl_textCenter">*</b>\n                    <b class="ogl_textCenter">&nbsp;</b>\n                    <b data-filter="rawCoords">coords</b>\n                    <b data-filter="name">name</b>\n                    <b data-filter="totalDESC">loot</b>\n                    <b class="material-icons" data-filter="fleetDESC">rocket_launch</b>\n                    <b class="material-icons" data-filter="defDESC">security</b>\n                    <b></b>\n                ',
        onclick: e => {
          let t = e.target.getAttribute("data-filter");
          t && (document.querySelectorAll(".ogl_spyHeader .ogl_active").forEach((e => e.classList.remove("ogl_active"))), e.target.classList.add("ogl_active"), this.ogl.db.spytableSort = this.ogl.db.spytableSort !== t ? t : t.indexOf("DESC") < 0 ? t + "DESC" : t.replace("DESC", ""), this.buildTable())
        }
      }), document.querySelectorAll(".ogl_spyHeader [data-filter]").forEach((e => {
        this.ogl.db.spytableSort.startsWith(e.getAttribute("data-filter")) && e.classList.add("ogl_active")
      }))
    }
    document.querySelector("#fleetsgenericpage .ogl_trashCounterSpy") || Util.addDom("div", {
      class: "btn_blue ogl_trashCounterSpy material-icons",
      child: "broom",
      parent: document.querySelector("#fleetsgenericpage"),
      onclick: () => {
        document.querySelectorAll(".espionageDefText").forEach((e => this.addToDeleteQueue(e.closest(".msg").getAttribute("data-msg-id")))), this.spytable.querySelectorAll("[data-id]").forEach((e => {
          const t = e.getAttribute("data-id");
          parseInt(e.querySelector(".ogl_reportTotal").getAttribute("data-value")) + parseInt(e.querySelector(".ogl_reportFleet").getAttribute("data-value")) < this.ogl.db.options.resourceTreshold && this.addToDeleteQueue(t)
        }))
      }
    });
    let a = {};
    n.querySelectorAll(".msg:not(.ogl_ready)").forEach((t => {
      if (unsafeWindow.tippy) return;
      let n = {};
      if (n.id = t.getAttribute("data-msg-id"), t.querySelector(".espionageDefText .player")) {
        const e = t.querySelector(".espionageDefText .player"),
          o = e.getAttribute("title") || e.getAttribute("data-title"),
          i = Util.addDom("div", {
            child: o
          }),
          r = i.querySelector("div")?.getAttribute("id")?.replace("player", "") || i.querySelector("[data-playerid]")?.getAttribute("data-playerid");
        if (this.ogl.ptreKey)
          if (-1 == this.ogl.cache.counterSpies.indexOf(n.id)) {
            const e = t.querySelector(".espionageDefText a"),
              o = new URLSearchParams(e.getAttribute("href")),
              i = [o.get("galaxy") || "0", o.get("system") || "0", o.get("position") || "0"],
              l = e.querySelector("figure.moon") ? 3 : 1,
              s = t.querySelector(".msg_date.ogl_updated").getAttribute("data-time-server");
            a[n.id] = {}, a[n.id].player_id = r, a[n.id].teamkey = this.ogl.ptreKey, a[n.id].galaxy = i[0], a[n.id].system = i[1], a[n.id].position = i[2], a[n.id].spy_message_ts = s, a[n.id].moon = {}, 1 == l ? (a[n.id].activity = "*", a[n.id].moon.activity = "60") : (a[n.id].activity = "60", a[n.id].moon.activity = "*")
          }
        else {
          const e = document.querySelector(`.msg[data-msg-id="${n.id}"] .msg_title`);
          e && !document.querySelector(`.msg[data-msg-id="${n.id}"] .ogl_checked`) && Util.addDom("div", {
            class: "material-icons ogl_checked tooltipLeft ogl_ptre",
            child: "ptre",
            title: this.ogl._lang.find("ptreActivityAlreadyImported"),
            parent: e
          })
        }
        this.ogl._ui.turnIntoPlayerLink(r, e, e.innerText)
      }
      let o = t.querySelectorAll(".compacting");
      if (!o || o.length < 6 || t.querySelector(".msg_title").innerText.indexOf(":16]") > -1) return;
      const i = t.querySelector(".icon_apikey");
      let r = new URLSearchParams(t.querySelector(".msg_head a")?.href),
        l = t.querySelector(".msg_content").innerHTML.replace(/: | :/g, ":");
      if (Object.keys(this.ogl.resourcesKeys).forEach((e => {
          const t = new RegExp(this.ogl._lang.find(e).toLowerCase() + ":([0-9" + LocalizationStrings.decimalPoint + LocalizationStrings.thousandSeperator + "]+[" + LocalizationStrings.unitMilliard + "|" + LocalizationStrings.unitMega + "|" + LocalizationStrings.unitKilo + "]*)", "i");
          n[e] = Util.formatFromUnits(l.match(t)?.[1] || "0")
        })), n.date = this.ogl._time.dateStringToTime(t.querySelector(".msg_date").innerText), n.activity = o[0].querySelectorAll("span.fright")[0].innerText ? o[0].querySelectorAll("span.fright")[0].innerText.indexOf("<") >= 0 ? 1 : parseInt(o[0].querySelectorAll("span.fright")[0].innerText.match(/\d+/)[0]) : -1, n.name = o[0].querySelectorAll('span[class^="status"]')[0].innerText.replace(/&nbsp;/g, "").trim(), n.status = o[0].querySelectorAll('span[class^="status"]')[0].className, n.coords = [r.get("galaxy") || "0", r.get("system") || "0", r.get("position") || "0"], n.rawCoords = Util.coordsToID(n.coords), n.type = t.querySelector(".msg_head figure.moon") ? "moon" : "planet", n.typeID = t.querySelector(".msg_head figure.moon") ? 3 : 1, n.loot = parseInt(o[4].querySelector(".ctn").innerText.replace(/\(.*?\)/, "").replace(/\D/g, "")), n.allResources = Math.floor(n.metal + n.crystal + n.deut), n.total = Math.floor((n.metal + n.crystal + n.deut) * n.loot / 100), n.fleet = o[5].querySelector(".ctn") ? Util.formatFromUnits(o[5].querySelector(".ctn").innerText.split(":")[1]) : -1, n.def = o[5].querySelector(".ctn.fright") ? Util.formatFromUnits(o[5].querySelector(".ctn.fright").innerText.split(":")[1]) : -1, n.attacked = !!t.querySelector(".msgAttackIconContainer .fleetHostile"), n.deleted = !!this.ogl.cache.reports[n.id]?.deleted, n.more = !!this.ogl.cache.reports[n.id]?.more, n.api = (i.getAttribute("title") || i.getAttribute("data-title") || i.getAttribute("data-api-code")).match(/sr-[a-z0-9-]*/)[0], n.isShared = 11 == e, i.setAttribute("data-api-code", n.api), n.deleted || n.total + n.fleet < this.ogl.db.options.resourceTreshold && this.ogl.db.options.autoCleanReports) this.addToDeleteQueue(n.id);
      else {
        if (!t.querySelector(".ogl_tagPicker")) {
          const e = Util.addDom("div", {
            class: "ogl_messageButton",
            parent: t.querySelector(".msg_actions message-footer-actions")
          });
          this.ogl._ui.addTagButton(e, n.coords)
        }
        t.querySelector(".ogl_trashsim") || Util.addDom("div", {
          class: "ogl_messageButton material-icons ogl_trashsim",
          parent: t.querySelector(".msg_actions message-footer-actions"),
          child: "letter_s",
          onclick: () => window.open(Util.genTrashsimLink(this.ogl, n.api), "_blank")
        }), !t.querySelector(".ogl_ptre") && this.ogl.ptreKey && Util.addDom("div", {
          class: "ogl_messageButton material-icons",
          parent: t.querySelector(".msg_actions message-footer-actions"),
          child: "ptre",
          onclick: () => this.ogl.PTRE.postSpyReport(n.api)
        }), this.ogl.cache.reports[n.id] = n
      }
    })), this.ogl.db.options.displaySpyTable && (this.buildTable(), n.parentNode.insertBefore(this.spytable, n)), Object.keys(a).length > 0 && this.ogl.PTRE.postActivities(a)
  }
  addToDeleteQueue(e) {
    this.ogl.cache.reports[e] && (this.ogl.cache.reports[e].deleted = !0), this.spytable?.querySelector(`[data-id="${e}"]`) && this.spytable.querySelector(`[data-id="${e}"]`).remove(), document.querySelector(`.msg[data-msg-id="${e}"]`) && document.querySelector(`.msg[data-msg-id="${e}"]`).remove(), delete this.ogl.cache.reports[e], this.deleteQueue.push(e)
  }
  deleteMessage() {
    let e = document.querySelector('[name="token"]');
    if (!this.tokenReady || !e) return;
    let t = Array.from(new Set(this.deleteQueue));
    if (t.length <= 0) return;
    this.tokenReady = !1;
    let n = {
      ajax: 1,
      standalone: 1,
      messageId: JSON.stringify(t),
      token: e.value,
      action: 103
    };
    $.ajax({
      type: "POST",
      url: "?page=messages",
      dataType: "json",
      data: n,
      success: n => {
        e.value = n.newAjaxToken, token = n.newAjaxToken, this.tokenReady = !0, t.forEach((e => {
          this.deleteQueue?.splice(this.deleteQueue.indexOf(e), 1)
        }))
      },
      error: e => {
        console.log(e)
      }
    })
  }
  buildTable() {
    this.spytable.querySelectorAll("[data-id]").forEach((e => e.remove())), document.querySelector('[name="token"]') && Util.observe(document.querySelector('[name="token"]'), {
      attributes: !0
    }, (() => {
      setTimeout((() => this.tokenReady = !0), 1)
    })), this.nextTarget = !1;
    const e = this.ogl.db.spytableSort?.indexOf("DESC") >= 0,
      t = this.ogl.db.spytableSort?.replace("DESC", "");
    if (Object.keys(this.ogl.cache.reports).length < 1) return void this.spytable.remove();
    Object.values(this.ogl.cache.reports).sort((function (n, o) {
      return e && isNaN(n[t]) ? o[t].localeCompare(n[t]) : !e && isNaN(n[t]) ? n[t].localeCompare(o[t]) : e && !isNaN(n[t]) ? o[t] - n[t] : n[t] - o[t]
    })).forEach((e => {
      if (this.spytable && this.spytable.querySelector(`[data-id="${e.id}"]`) || e.isShared) return;
      let t = 0;
      const n = serverTime.getTime() - e.date;
      t = n > 864e5 ? Math.floor(n / 864e5) + LocalizationStrings.timeunits.short.day : n > 36e5 ? Math.floor(n / 36e5) + LocalizationStrings.timeunits.short.hour : Math.floor(n / 6e4) + LocalizationStrings.timeunits.short.minute;
      let o = 1 == this.ogl.server.warFleetSpeed ? .42 : 0,
        a = 1 + .042 * Math.ceil(n / 36e5) + o;
      const i = this.ogl._fleet.shipsForResources(this.ogl.db.options.defaultShip, e.total * a);
      let r = Util.addDom("div", {
          class: "ogl_spyLine",
          parent: this.spytable,
          "data-id": e.id
        }),
        l = Util.addDom("div", {
          parent: r,
          child: `\n                    <span class="ogl_textCenter"></span>\n                    <span class="ogl_textCenter tooltip" data-title="${this.ogl._time.convertTimestampToDate(e.date,!0).innerHTML}">${t}</span>\n                    <span class="ogl_activity ogl_textCenter">${e.activity<15?"*":e.activity}</span>\n                    <span class="ogl_type"></span>\n                    <span class="ogl_destination"><span data-galaxy="${e.coords.join(":")}">${e.coords.join(":")}</span></span>\n                    <a class="${e.status} tooltip overlay" data-title="${e.name}" href="${window.location.protocol}//${window.location.host}${window.location.pathname}?page=messages&messageId=${e.id}&tabid=20&ajax=1">${e.name}</a>\n                    <a class="ogl_reportTotal ogl_textRight tooltip" data-title="${ogl._lang.find(this.ogl.db.options.defaultShip)}: ${Util.formatNumber(i)}<div class='ogl_sidenote'>+4.2% cargo per hour since the spy</div>" href="?page=ingame&component=fleetdispatch&galaxy=${e.coords[0]}&system=${e.coords[1]}&position=${e.coords[2]}&type=${e.typeID}&mission=1&am${this.ogl.db.options.defaultShip}=${i}&oglmode=4" data-value="${e.total}">${Util.formatToUnits(e.total)}</a>\n                    <span class="ogl_reportFleet ogl_textRight" data-value="${e.fleet}" style="${0!=e.fleet?"background:linear-gradient(192deg, #622a2a, #3c1717 70%)":""}">${e.fleet>=0?Util.formatToUnits(e.fleet,0):"?"}</span>\n                    <span class="ogl_textRight" style="${0!=e.def?"background:linear-gradient(192deg, #622a2a, #3c1717 70%)":""}">${e.def>=0?Util.formatToUnits(e.def,0):"?"}</span>\n                    <span class="ogl_actions"></span>\n                `
        });
      if (e.activity <= 15 ? l.querySelector(".ogl_activity").classList.add("ogl_danger") : e.activity < 60 && l.querySelector(".ogl_activity").classList.add("ogl_warning"), e.total >= this.ogl.db.options.resourceTreshold && l.querySelector(".ogl_reportTotal").classList.add("ogl_important"), this.addSpyIcons(l.querySelector(".ogl_type"), e.coords, e.type), document.querySelector(`.msg[data-msg-id="${e.id}"]`)) {
        const t = document.querySelector(`.msg[data-msg-id="${e.id}"]`);
        e.attacked = !!t.querySelector(".msgAttackIconContainer .fleetHostile"), this.ogl.cache.reports[e.id].attacked = e.attacked
      }
      e.attacked && Util.addDom("div", {
        class: "material-icons ogl_fleetIcon ogl_mission1",
        parent: l.querySelector(".ogl_type")
      }), e.attacked || 0 !== e.def || 0 !== e.fleet || this.nextTarget || (this.nextTarget = e), this.ogl._ui.addTagButton(l.querySelector(".ogl_destination"), e.coords.join(":"));
      const s = Util.addDom("div", {
        class: "ogl_button material-icons ogl_moreButton",
        parent: l.querySelector(".ogl_actions"),
        child: "more_horiz",
        onclick: () => {
          if (r.querySelector(".ogl_more")) r.querySelector(".ogl_more").remove(), delete e.more;
          else {
            document.querySelectorAll(".ogl_more").forEach((e => {
              e.parentNode.querySelector(".ogl_moreButton").click()
            }));
            let t = e.allResources,
              n = 0;
            const o = Util.addDom("div", {
              class: "ogl_more",
              parent: r
            });
            for (let a = 0; a < 6; a++) {
              n = Math.floor(t * e.loot / 100), t -= n;
              const a = Util.addDom("div", {
                parent: o,
                child: `<div>${Util.formatToUnits(n)}</div>`
              });
              this.ogl.fretShips.forEach((t => {
                const o = this.ogl._fleet.shipsForResources(t, Math.round(1.07 * n));
                Util.addDom("a", {
                  class: `ogl_icon ogl_${t}`,
                  parent: a,
                  child: o.toLocaleString("de-DE") || "0",
                  href: `?page=ingame&component=fleetdispatch&galaxy=${e.coords[0]}&system=${e.coords[1]}&position=${e.coords[2]}&type=${e.typeID}&mission=1&am${t}=${o}&oglmode=4&oglLazy=true`
                })
              })), e.more = !0
            }
          }
        }
      });
      e.more && s.click();
      const d = Util.addDom("a", {
        class: "ogl_button material-icons",
        parent: l.querySelector(".ogl_actions"),
        child: "target",
        href: `?page=ingame&component=fleetdispatch&galaxy=${e.coords[0]}&system=${e.coords[1]}&position=${e.coords[2]}&type=${e.typeID}&mission=1`
      });
      e.attacked && d.classList.add("ogl_mission1"), Util.addDom("div", {
        class: "ogl_button material-icons",
        parent: l.querySelector(".ogl_actions"),
        child: "letter_s",
        onclick: () => window.open(Util.genTrashsimLink(this.ogl, e.api), "_blank")
      }), this.ogl.ptreKey && Util.addDom("div", {
        class: "ogl_button material-icons",
        parent: l.querySelector(".ogl_actions"),
        child: "ptre",
        onclick: () => this.ogl.PTRE.postSpyReport(e.api)
      }), Util.addDom("div", {
        class: "ogl_button material-icons",
        parent: l.querySelector(".ogl_actions"),
        child: "close",
        onclick: () => this.addToDeleteQueue(e.id)
      })
    }));
    let n = 0;
    this.spytable.querySelectorAll(".ogl_reportTotal").forEach((e => n += parseInt(e.getAttribute("data-value")))), this.spytable.setAttribute("data-total", "Total: " + Util.formatNumber(n))
  }
  checkRaids(e, t) {
    const n = document.querySelector(`.ui-tabs-tab[data-tabid="${e}"]`).getAttribute("aria-labelledby");
    document.querySelector(`.ui-tabs-panel[aria-labelledby="${n}"]`).querySelectorAll(".msg").forEach((e => {
      if (e.querySelector(".ogl_battle") || !e.querySelector(".combatLeftSide")) return;
      const n = e.getAttribute("data-msg-id"),
        o = e.querySelector(".icon_apikey"),
        a = (o.getAttribute("data-tooltip-title") || o.getAttribute("title") || o.getAttribute("data-title") || o.getAttribute("data-api-code")).match(/cr-[a-z0-9-]*/)[0];
      o.setAttribute("data-api-code", a), Util.addDom("div", {
        class: "ogl_battle",
        before: e.querySelector(".msg_actions"),
        child: '<div class="ogl_loading"></div>'
      }), this.ogl.cache.raids[n] ? this.buildRecap(this.ogl.cache.raids[n], e) : this.ogl._fetch.pending.push({
        url: `?page=messages&messageId=${n}&tabid=21&ajax=1`,
        callback: o => {
          const a = JSON.parse(o.match(/{(.*)}/g));
          if (!a?.event_time) return;
          const i = {};
          i.id = n, i.isExpe = 16 === a.coordinates.position, i.messageType = "raid", i.resultType = "raid", i.date = new Date(parseInt(e.querySelector("[data-time-server]").getAttribute("data-time-server"))), i.type = i.isExpe ? "expe" : "raid", i.fleetID = [], i.isAttacker = !1, i.isDefender = !1, i.probesOnly = !1, i.debris = {
            metal: a.debris.metal,
            crystal: a.debris.crystal,
            deut: a.debris.deuterium
          }, i.loss = {}, i.recap = {}, Object.values(a.attackerJSON.member).forEach((e => {
            e && e.ownerID == this.ogl.account.id && (i.fleetID.push(e.fleetID), i.isAttacker = !0)
          })), Object.values(a.defenderJSON.member).forEach((e => {
            e && e.ownerID == this.ogl.account.id && (i.fleetID.push(e.fleetID), i.isDefender = !0)
          }));
          const r = i.isDefender ? -1 : 1;
          i.loot = {
            metal: a.loot.metal * r,
            crystal: a.loot.crystal * r,
            deut: a.loot.deuterium * r,
            food: a.loot.food * r
          };
          let l = a.attackerJSON.combatRounds,
            s = a.defenderJSON.combatRounds;
          if (i.fleetID.forEach((e => {
              1 == Object.keys(Object.values(l[0].ships)[0]).length && 210 == Object.keys(Object.values(l[0].ships)[0])[0] && (i.probesOnly = !0);
              for (let [t, n] of Object.entries(s[s.length - 1].losses?.[e] || {})) i.loss[-t] = (i.loss[-t] || 0) + parseInt(n);
              for (let [t, n] of Object.entries(l[l.length - 1].losses?.[e] || {})) i.loss[-t] = (i.loss[-t] || 0) + parseInt(n)
            })), a.defender?.[0]?.ownerID == this.ogl.account.id)
            for (let [e, t] of Object.entries(a.repairedDefense)) i.loss[-e] = (i.loss[-e] || 0) - parseInt(t);
          for (let [e, t] of Object.entries(i.loss)) Object.entries(Datafinder.getTech(Math.abs(e))).forEach((e => i.recap[e[0]] += e[1] * t));
          i.probesOnly && i.loot.metal + i.loot.crystal + i.loot.deut > 0 && (i.probesOnly = !1), this.ogl.cache.raids[n] = i, this.buildRecap(i, e), i.probesOnly || t || this.updateStats(i)
        }
      }), Util.addDom("div", {
        class: "ogl_messageButton tooltip",
        title: "Convert this battle",
        parent: e.querySelector(".msg_actions message-footer-actions"),
        child: "C",
        onclick: () => window.open(Util.genConverterLink(this.ogl, a), "_blank")
      })
    }))
  }
  checkExpeditions() {
    const e = this.ogl.calcExpeditionMax().max;
    document.querySelectorAll('#ui-id-2 div[aria-hidden="false"] .msg').forEach((t => {
      if (t.querySelector(".ogl_battle")) return;
      if (-1 == t.querySelector(".msg_title").innerText.indexOf(":16]")) return;
      const n = {};
      n.id = t.getAttribute("data-msg-id"), n.date = new Date(parseInt(t.querySelector("[data-time-server]").getAttribute("data-time-server"))), n.messageType = "expe", n.gain = {};
      const o = ["metal", "crystal", "deut", "dm", 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 213, 214, 215, 217, 218, 219],
        a = new RegExp(/\.|,|\(|\)|:/, "g"),
        i = new RegExp(/( de | de$)/, "g"),
        r = t.querySelector(".msg_content").innerText.replace(a, "").replace(i, " ").toLowerCase();
      Util.addDom("div", {
        class: "ogl_battle",
        before: t.querySelector(".msg_actions"),
        child: '<div class="ogl_loading"></div>'
      });
      for (let [e, t] of Object.entries(this.expeResults || {})) t.some((e => r.includes(e.replace(a, "").replace(i, " ").toLowerCase()))) && (n.resultType = e);
      if (n.resultType || (o.forEach((t => {
          const o = this.ogl._lang.find(t).replace(a, "").replace(i, " ").toLowerCase(),
            l = this.ogl._lang.find(t, !0).replace(a, "").replace(i, " ").toLowerCase(),
            s = new RegExp(`(\\d+) (?:${l}|${o})`, "g"),
            d = new RegExp(`(?:${l}|${o}) (\\d+)`, "g"),
            c = parseInt(s.exec(r)?.[1]?.replace(/\D/g, "") || d.exec(r)?.[1]?.replace(/\D/g, ""));
          (c || 0 == c) && (n.resultType = isNaN(t) ? "dm" == t ? "darkmatter" : "resource" : "ship", n.gain[t] = c, "metal" == t ? n.percentage = 100 - Math.round((e - parseInt(c)) / e * 100) : "crystal" == t ? n.percentage = 100 - Math.round((e - 2 * parseInt(c)) / e * 100) : "deut" == t && (n.percentage = 100 - Math.round((e - 3 * parseInt(c)) / e * 100)))
        })), t.querySelector('.msg_content a[href*="page=shop"]') && (n.resultType = "item")), this.ogl.db.options.debugMode && (this.ogl.cache.expeFix = this.ogl.cache.expeFix || {}, "fr" == this.ogl.account.lang && (this.ogl.cache.expeFix[n.id] = n.resultType)), !n.resultType) return console.log("OGL: unkown expedition type"), void(this.ogl.db.options.debugMode && this.ogl.cache.expeFix[n.id] && this.expeResults[this.ogl.cache.expeFix[n.id]] && (this.expeResUpdated = !0, this.expeResults[this.ogl.cache.expeFix[n.id]].push(r.slice(0, 40))));
      t.querySelector(".msg_content").classList.add("ogl_hidden"), t.setAttribute("data-msgType", "expe"), this.buildRecap(n, t), this.updateStats(n), document.cookie = `oglocale=${this.ogl.account.lang}`
    })), this.expeResUpdated && localStorage.setItem("ogl_tempExpe", JSON.stringify(this.expeResults))
  }
  checkDiscovery() {
    document.querySelectorAll('#ui-id-2 div[aria-hidden="false"] .msg').forEach((e => {
      if (e.querySelector(".ogl_battle")) return;
      Util.addDom("div", {
        class: "ogl_battle",
        before: e.querySelector(".msg_actions"),
        child: '<div class="ogl_loading"></div>'
      });
      const t = {};
      if (t.id = e.getAttribute("data-msg-id"), t.date = new Date(parseInt(e.querySelector("[data-time-server]").getAttribute("data-time-server"))), t.messageType = "discovery", t.gain = {}, e.querySelector(".lifeform-item-icon")) t.resultType = e.querySelector(".lifeform-item-icon").className.replace("lifeform-item-icon ", ""), t.gain[t.resultType] = "?";
      else {
        let n = e.querySelector(".msg_content").innerHTML.replace(/<a(.*)<\/a>/g, "").replace(LocalizationStrings.thousandSeperator, "").match(/\d+/g) || [0];
        n = parseInt(n[n.length - 1]), n ? (t.resultType = "artefact", t.gain[t.resultType] = n) : t.resultType = "nothing"
      }
      e.querySelector(".msg_content").classList.add("ogl_hidden"), e.setAttribute("data-msgType", "discovery"), this.buildRecap(t, e), this.updateStats(t)
    }))
  }
  checkRR() {
    document.querySelectorAll('#ui-id-2 div[aria-hidden="false"] .msg').forEach((e => {
      if (e.querySelector(".ogl_battle")) return;
      const t = Util.addDom("div", {
          class: "ogl_battle",
          before: e.querySelector(".msg_actions"),
          child: '<div class="ogl_loading"></div>'
        }),
        n = e.querySelector(".icon_apikey");
      if (n) {
        const e = (n.getAttribute("data-tooltip-title") || n.getAttribute("title") || n.getAttribute("data-title") || n.getAttribute("data-api-code")).match(/rr-[a-z0-9-]*/)[0];
        n.setAttribute("data-api-code", e)
      }
      const o = new RegExp(/\.|,|\(|\) | de |:/, "g"),
        a = e.querySelector(".msg_content").innerText.replace(o, "").match(/\d+/g),
        i = {};
      i.id = e.getAttribute("data-msg-id"), i.date = new Date(parseInt(e.querySelector("[data-time-server]").getAttribute("data-time-server"))), i.messageType = -1 == e.querySelector(".msg_title").innerText.indexOf(":16]") ? "debris" : "debris16", i.resultType = "debris", i.gain = {}, ["metal", "crystal", "deut"].forEach(((e, t) => {
        if (!e || !n) return;
        const o = parseInt(a[a.length + t - 3]);
        i.gain[e] = o
      })), Object.entries(i).length <= 0 || !n ? t.remove() : (this.buildRecap(i, e), this.updateStats(i))
    }))
  }
  checkDialog() {
    if (serverTime.getTime() - this.dialogDelay < 500) return;
    this.dialogDelay = serverTime.getTime();
    const e = document.querySelector(".ui-dialog"),
      t = e.querySelector(".detail_msg")?.getAttribute("data-msg-id"),
      n = e.querySelector("[data-combatreportid]"),
      o = e.querySelector('[data-message-type="10"]');
    if (t && n && !e.querySelector(".ogl_messageButton")) {
      const t = e.querySelector(".icon_apikey"),
        n = (t.getAttribute("data-tooltip-title") || t.getAttribute("title") || t.getAttribute("data-title") || t.getAttribute("data-api-code")).match(/cr-[a-z0-9-]*/)[0];
      t.setAttribute("data-api-code", n), Util.addDom("div", {
        class: "ogl_messageButton tooltip",
        title: "Convert this battle",
        parent: e.querySelector(".msg_actions"),
        child: "C",
        onclick: () => window.open(Util.genConverterLink(this.ogl, n), "_blank")
      })
    }
    else if (t && o && !e.querySelector(".ogl_messageButton")) {
      const t = new URLSearchParams(e.querySelector(".msg_title a")?.href),
        n = [t.get("galaxy") || "0", t.get("system") || "0", t.get("position") || "0"],
        o = e.querySelector(".icon_apikey"),
        a = (o.getAttribute("data-tooltip-title") || o.getAttribute("title") || o.getAttribute("data-title") || o.getAttribute("data-api-code")).match(/sr-[a-z0-9-]*/)[0];
      if (o.setAttribute("data-api-code", a), !e.querySelector(".ogl_tagPicker")) {
        const t = Util.addDom("div", {
          class: "ogl_messageButton",
          parent: e.querySelector(".msg_actions")
        });
        this.ogl._ui.addTagButton(t, n)
      }
      e.querySelector(".ogl_trashsim") || Util.addDom("div", {
        class: "ogl_messageButton material-icons ogl_trashsim",
        parent: e.querySelector(".msg_actions"),
        child: "letter_s",
        onclick: () => window.open(Util.genTrashsimLink(this.ogl, a), "_blank")
      }), !e.querySelector(".ogl_ptre") && this.ogl.ptreKey && Util.addDom("div", {
        class: "ogl_messageButton material-icons",
        parent: e.querySelector(".msg_actions"),
        child: "ptre",
        onclick: () => this.ogl.PTRE.postSpyReport(a)
      })
    }
  }
  buildRecap(e, t) {
    const n = t.querySelector(".ogl_battle");
    if (n.setAttribute("data-resultType", e.resultType || "unknown"), n.innerText = "", t.querySelector(".ogl_checked") || Util.addDom("div", {
        class: "material-icons ogl_checked ogl_mainIcon tooltipLeft",
        child: "oglight_simple",
        title: this.ogl._lang.find("oglMessageDone"),
        parent: t.querySelector(".msg_title")
      }), document.querySelector("#ogame-tracker-menu")) return n.classList.add("ogl_hidden"), void t.querySelector(".msg_content").classList.remove("ogl_hidden");
    t.querySelector(".msg_content").classList.contains("ogl_hidden") && (n.classList.add("ogl_clickable"), n.addEventListener("click", (() => {
      t.querySelector(".msg_content").classList.toggle("ogl_hidden")
    })));
    const o = {};
    if (e.percentage && (n.setAttribute("title", `${e.percentage}% max.`), n.classList.add("tooltip")), "raid" == e.messageType) {
      for (let [t, n] of Object.entries(e.loot || {})) o[t] = (o[t] || 0) + n;
      for (let [t, n] of Object.entries(e.loss || {}))
        for (let [e, a] of Object.entries(Datafinder.getTech(Math.abs(t)) || {})) o[e] = (o[e] || 0) - a * n;
      ["metal", "crystal", "deut"].forEach((t => {
        const a = o[t],
          i = e.debris?.[t] || 0;
        a + i !== 0 && Util.addDom("span", {
          class: `ogl_icon ogl_${t}`,
          child: `<span class="${a>=0?"":"ogl_danger"}">${Util.formatNumber(a)}</span><span>${Util.formatNumber(i)}</span>`,
          parent: n
        })
      })), "" == n.innerText && n.classList.add("ogl_hidden")
    }
    else if ("expe" == e.messageType || "discovery" == e.messageType || "debris" == e.messageType || "debris16" == e.messageType)
      if (Object.keys(e.gain || {}).length > 0)
        for (let [t, o] of Object.entries(e.gain || {})) Util.addDom("span", {
          class: `ogl_icon ogl_${t}`,
          child: `${"?"!=o?Util.formatNumber(o):""}`,
          parent: n
        });
      else Util.addDom("span", {
        class: "ogl_icon",
        child: this.ogl._lang.find(e.resultType),
        parent: n
      })
  }
  updateStats(e) {
    const t = this.ogl._stats.getDayStats(e.date.getTime());
    if (t.ids?.indexOf(e.id) > -1) return;
    e.id && (t.ids = t.ids || [], t.ids.push(e.id));
    const n = "raid" == e.messageType && "expe" == e.type ? e.type : e.messageType;
    t[n] = t[n] || {}, t[n].count = (t[n].count || 0) + 1, "raid" == e.messageType && "expe" == e.type ? t[n].count = (t[n].count || 0) - 1 : "expe" != n && "discovery" != n || (t[n].occurence = t[n].occurence || {}, t[n].occurence[e.resultType] = (t[n].occurence[e.resultType] || 0) + 1);
    for (let [o, a] of Object.entries(e.gain || {})) a > 0 && (t[n].gain = t[n].gain || {}, t[n].gain[o] = (t[n].gain[o] || 0) + ("?" == a ? 1 : a));
    for (let [o, a] of Object.entries(e.loot || {})) a > 0 && (t[n].gain = t[n].gain || {}, t[n].gain[o] = (t[n].gain[o] || 0) + ("?" == a ? 1 : a));
    for (let [o, a] of Object.entries(e.loss || {})) a > 0 && (t[n].gain = t[n].gain || {}, t[n].gain[o] = (t[n].gain[o] || 0) + ("?" == a ? 1 : a));
    this.ogl._stats.miniStats();
    const o = {};
    ["loot", "loss", "gain"].forEach((t => {
      for (let [n, a] of Object.entries(e[t] || {})) {
        const e = !isNaN(n) && n < 0 ? -1 : 1,
          t = isNaN(n) ? n : Math.abs(n);
        o[t] = (o[t] || 0) + a * e
      }
    })), e.resultType && "artefact" != e.resultType && (o[e.resultType] = (o[e.resultType] || 0) + 1), document.querySelector("#ogame-tracker-menu") || this.ogl._notification.addToQueue(!1, void 0, o)
  }
  addBoardTab() {}
  checkBoard() {
    if ("undefined" != typeof GM_xmlhttpRequest && "fr" == this.ogl.server.lang && this.ogl.db.options.boardTab)
      if (this.ogl.db.lastBoardPosts = this.ogl.db.lastBoardPosts || [0, 0, 0], Date.now() > this.ogl.db.lastBoardPosts[2] + 36e5) GM_xmlhttpRequest({
        method: "GET",
        url: "https://board.fr.ogame.gameforge.com/index.php?board-feed/101/",
        onload: e => {
          const t = (new DOMParser).parseFromString(e.responseText, "text/xml");
          this.ogl.db.lastBoardPosts[0] = 0;
          if (t.querySelectorAll("item").forEach(((e, t) => {
              const n = new Date(e.querySelector("pubDate").textContent).getTime();
              n > this.ogl.db.lastBoardPosts[1] && this.ogl.db.lastBoardPosts[0]++, 0 == t && (this.ogl.db.lastBoardPosts[1] = n)
            })), this.ogl.db.lastBoardPosts[0] > 0) {
            const e = document.querySelector(".comm_menu.messages .new_msg_count") || Util.addDom("span", {
              class: "new_msg_count totalMessages news"
            });
            e.innerText = parseInt(e?.innerText || 0) + this.ogl.db.lastBoardPosts[0]
          }
          this.ogl.db.lastBoardPosts[2] = Date.now(), "messages" == this.ogl.page && this.addBoardTab()
        }
      });
      else {
        if (this.ogl.db.lastBoardPosts[0] > 0) {
          const e = document.querySelector(".comm_menu.messages .new_msg_count") || Util.addDom("span", {
            class: "new_msg_count totalMessages news",
            parent: document.querySelector(".comm_menu.messages")
          });
          e.innerText = parseInt(e?.innerText || 0) + this.ogl.db.lastBoardPosts[0]
        }
        "messages" == this.ogl.page && this.addBoardTab()
      }
  }
  addSpyIcons(e, t, n, o) {
    if (t = "string" == typeof t ? t = t.split(":") : t, "planet" == n || !n) {
      const n = Util.addDom("div", {
          class: "material-icons ogl_spyIcon tooltip",
          title: this.ogl._lang.find("spyPlanet"),
          "data-spy-coords": `${t[0]}:${t[1]}:${t[2]}:1`,
          child: "language",
          parent: e,
          onclick: e => this.ogl._fleet.addToSpyQueue(6, t[0], t[1], t[2], 1)
        }),
        a = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.spy?.[0] || 0;
      if (serverTime.getTime() - a < this.ogl.db.options.spyIndicatorDelay && (n.setAttribute("data-spy", "recent"), n.setAttribute("title", "recently spied")), o) {
        const e = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.acti || [],
          o = serverTime.getTime() - e[2] < 36e5,
          a = Util.addDom("span", {
            parent: n,
            child: o ? e[0] : "?"
          });
        "*" == e[0] && o ? a.classList.add("ogl_danger") : 60 == e[0] && o ? a.classList.add("ogl_ok") : a.classList.add("ogl_warning")
      }
    }
    if ("moon" == n || !n && this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.mid) {
      const n = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.mid > 0 ? Util.addDom("div", {
          class: "material-icons ogl_spyIcon tooltip",
          title: this.ogl._lang.find("spyMoon"),
          "data-spy-coords": `${t[0]}:${t[1]}:${t[2]}:3`,
          child: "bedtime",
          parent: e,
          onclick: e => this.ogl._fleet.addToSpyQueue(6, t[0], t[1], t[2], 3)
        }) : Util.addDom("div", {
          parent: e
        }),
        a = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.spy?.[1] || 0;
      if (serverTime.getTime() - a < this.ogl.db.options.spyIndicatorDelay && (n.setAttribute("data-spy", "recent"), n.setAttribute("title", "recently spied")), o && this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.mid > -1) {
        const e = this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.acti || [],
          o = serverTime.getTime() - e[2] < 36e5,
          a = Util.addDom("span", {
            parent: n,
            child: o ? e[1] : "?"
          });
        "*" == e[1] && o ? a.classList.add("ogl_danger") : 60 == e[1] && o ? a.classList.add("ogl_ok") : a.classList.add("ogl_warning")
      }
    }
    n || this.ogl.db.pdb[`${t[0]}:${t[1]}:${t[2]}`]?.mid || Util.addDom("div", {
      parent: e
    })
  }
}
class MovementManager extends Manager {
  load(e) {
    this.ogl.cache.movements = this.ogl.cache.movements || {}, e || (refreshFleetEvents = e => {
      eventlistLink && (document.querySelector("#eventboxContent").innerHTML = '<img height="16" width="16" src="//gf3.geo.gfsrv.net/cdne3/3f9884806436537bdec305aa26fc60.gif" />', fetch(eventlistLink, {
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        }
      }).then((e => e.text())).then((e => {
        $("#eventboxContent").html(e), toggleEvents.loaded = !0;
        let t = {},
          n = [];
        (new DOMParser).parseFromString(e, "text/html").querySelectorAll("#eventContent tbody tr").forEach((e => {
          const o = Util.addDom("div", {
              child: (e.querySelector(".icon_movement .tooltip") || e.querySelector(".icon_movement_reserve .tooltip"))?.getAttribute("title")
            }),
            a = {};
          if (a.id = parseInt(e.getAttribute("id").replace("eventRow-", "")), a.mission = e.getAttribute("data-mission-type"), a.isBack = "true" === e.getAttribute("data-return-flight"), a.arrivalTime = 1e3 * parseInt(e.getAttribute("data-arrival-time")), a.isBack || n.push(a.id + 1), n.indexOf(a.id) > -1) return;
          if (a.from = {}, a.from.anotherPlayer = !Boolean(Array.from(document.querySelectorAll("#planetList .planet-koords")).find((t => t.innerText === e.querySelector(".coordsOrigin").innerText.trim().slice(1, -1)))), a.from.isMoon = Boolean(e.querySelector(".originFleet figure.moon")), a.from.coords = e.querySelector(".coordsOrigin").innerText.trim().slice(1, -1), a.to = {}, a.to.anotherPlayer = !Boolean(Array.from(document.querySelectorAll("#planetList .planet-koords")).find((t => t.innerText === e.querySelector(".destCoords").innerText.trim().slice(1, -1)))), a.to.isMoon = Boolean(e.querySelector(".destFleet figure.moon")), a.to.coords = e.querySelector(".destCoords").innerText.trim().slice(1, -1), (1 == a.mission || 6 == a.mission || 9 == a.mission) && a.from.anotherPlayer) {
            const t = Array.from(document.querySelectorAll("#planetList .planet-koords")).find((t => t.innerText === e.querySelector(".destCoords").innerText.trim().slice(1, -1)));
            if (t) {
              const e = t.closest(".smallplanet");
              (a.to.isMoon ? e.querySelector(".moonlink") : e.querySelector(".planetlink")).classList.add("ogl_attacked")
            }
          }
          let i;
          o.querySelectorAll(".fleetinfo tr").forEach((e => {
            if (e.querySelector("td") && e.querySelector(".value")) {
              let t = e.querySelector("td").innerText.replace(":", ""),
                n = Object.entries(this.ogl.db.serverData).find((e => e[1] === t))?.[0],
                o = e.querySelector(".value").innerText.replace(/\.|,| /g, "");
              n && (a[n] = Number(o))
            }
          })), i = a.isBack ? a.from.coords + ":B" : a.to.anotherPlayer ? a.from.coords : a.from.anotherPlayer ? a.to.coords + ":B" : a.to.coords, i && (t[i] = t[i] || [], t[i].push(a))
        })), this.ogl.cache.movements = t, document.querySelectorAll(".smallplanet").forEach((e => {
          const t = e.querySelector(".planet-koords").innerText;
          e.querySelectorAll(".ogl_fleetIcon").forEach((e => e.remove())), this.ogl.cache?.movements?.[t] && this.addFleetIcon(this.ogl.cache.movements[t], e), this.ogl.cache?.movements?.[t + ":B"] && this.addFleetIcon(this.ogl.cache.movements[t + ":B"], e, !0)
        })), Util.runAsync((() => {
          this.ogl._ui.displayResourcesRecap(), this.ogl._tech.checkTodolist(), this.ogl._time.updateMovements()
        }))
      })))
    }), setTimeout((() => refreshFleetEvents()), 100), "movement" != this.ogl.page || e || (unsafeWindow.timerHandler.pageReloadAlreadyTriggered = !0, this.updateMovement())
  }
  addFleetIcon(e, t, n) {
    const o = n ? "ogl_sideIconBottom" : "ogl_sideIconTop",
      a = t.querySelector(`.${o}`) || Util.addDom("div", {
        class: o,
        parent: t
      });
    Util.addDom("div", {
      class: `material-icons ogl_fleetIcon ogl_mission${e[0].mission}`,
      parent: a,
      "data-list": e.length,
      onclick: () => {
        const t = Util.addDom("div", {
          class: "ogl_sideFleetTooltip"
        });
        let o = {
          metal: 0,
          crystal: 0,
          deut: 0
        };
        e.forEach((e => {
          const a = n ? "https://gf2.geo.gfsrv.net/cdn47/014a5d88b102d4b47ab5146d4807c6.gif" : "https://gf2.geo.gfsrv.net/cdnd9/f9cb590cdf265f499b0e2e5d91fc75.gif";
          let i = 0;
          Object.keys(e).filter((e => parseInt(e))).forEach((t => i += e[t]));
          const r = Util.addDom("div", {
            class: `ogl_mission${e.mission} ogl_sideFleetIcon`,
            child: `<div class="material-icons">${e.from.isMoon?"bedtime":"language"}</div><div>[${e.from.coords}]</div><span>${Util.formatToUnits(i)}</span><img src="${a}"><div class="material-icons">${8==e.mission?"debris":e.to.isMoon?"bedtime":"language"}</div><div>[${e.to.coords}]</div>`,
            parent: t
          });
          ["metal", "crystal", "deut"].forEach((t => {
            Util.addDom("div", {
              class: `ogl_icon ogl_${t}`,
              parent: r,
              child: Util.formatToUnits(e[t] || 0)
            }), o[t] += e[t]
          })), r.prepend(this.ogl._time.convertTimestampToDate(this.ogl._time.serverToClient(e.arrivalTime)))
        }));
        const a = Util.addDom("div", {
          class: "ogl_sideFleetIcon",
          child: "<span></span><span></span><span></span><span></span><span></span><span></span><span></span>",
          parent: t
        });
        ["metal", "crystal", "deut"].forEach((e => Util.addDom("div", {
          class: `ogl_icon ogl_${e}`,
          parent: a,
          child: Util.formatToUnits(o[e] || 0)
        }))), this.ogl._popup.open(t)
      }
    })
  }
  updateMovement() {
    let e = !1;
    document.querySelectorAll("#movementcomponent .reversal a").length > 0 && (document.querySelectorAll("#movementcomponent .reversal a")[0].setAttribute("data-key-color", "orange"), Array.from(document.querySelectorAll("#movementcomponent .reversal a")).sort(((e, t) => parseInt(t.closest(".fleetDetails").getAttribute("id").replace("fleet", "")) - parseInt(e.closest(".fleetDetails").getAttribute("id").replace("fleet", ""))))[0].setAttribute("data-key-color", "violet")), document.querySelectorAll(".route a").forEach(((t, n) => {
      t.classList.add("tooltipRight");
      const o = t.closest(".fleetDetails"),
        a = Util.addDom("div", {
          class: "ogl_resourcesBlock"
        }),
        i = Util.addDom("div", {
          class: "ogl_timeBlock"
        }),
        r = Util.addDom("div", {
          class: "ogl_actionsBlock"
        }),
        l = document.querySelector(`#${t.getAttribute("rel")}`);
      if (!l) return void(e = !0);
      l.querySelectorAll(".fleetinfo tr").forEach((e => {
        if (e.querySelector("td") && e.querySelector(".value")) {
          const t = e.querySelector("td").innerText.replace(":", ""),
            n = Object.entries(this.ogl.db.serverData).find((e => e[1] === t))[0],
            o = parseInt(e.querySelector(".value").innerText.replace(/\.|,| /g, "")),
            i = Util.formatToUnits(o, 0);
          if (!o) return;
          isNaN(n) ? "metal" == n ? Util.addDom("div", {
            class: `ogl_icon ogl_${n}`,
            child: i,
            prepend: a
          }) : "crystal" == n ? Util.addDom("div", {
            class: `ogl_icon ogl_${n}`,
            child: i,
            after: a.querySelector(".ogl_metal")
          }) : "deut" == n ? Util.addDom("div", {
            class: `ogl_icon ogl_${n}`,
            child: i,
            after: a.querySelector(".ogl_crystal")
          }) : "food" == n && Util.addDom("div", {
            class: `ogl_icon ogl_${n}`,
            child: i,
            after: a.querySelector(".ogl_deut")
          }) : Util.addDom("div", {
            class: `ogl_icon ogl_${n}`,
            child: i,
            parent: a
          })
        }
      })), 18 == o.getAttribute("data-mission-type") && (Util.addDom("div", {
        class: "ogl_icon ogl_metal",
        child: 0,
        prepend: a
      }), Util.addDom("div", {
        class: "ogl_icon ogl_crystal",
        child: 0,
        prepend: a
      }), Util.addDom("div", {
        class: "ogl_icon ogl_deut",
        child: 0,
        prepend: a
      }), Util.addDom("div", {
        class: "ogl_icon ogl_food",
        child: 0,
        prepend: a
      }));
      const s = Util.addDom("div", {
          class: "ogl_timeBlockLeft",
          parent: i
        }),
        d = Util.addDom("div", {
          class: "ogl_timeBlockRight",
          parent: i
        });
      s.appendChild(o.querySelector(".timer")), s.appendChild(o.querySelector(".absTime")), s.appendChild(o.querySelector(".originData")), s.querySelector(".originData").appendChild(s.querySelector(".originCoords")), d.appendChild(o.querySelector(".destinationData")), d.querySelector(".destinationData").appendChild(d.querySelector(".destinationPlanet")), o.querySelector(".nextabsTime") ? d.appendChild(o.querySelector(".nextabsTime")) : Util.addDom("div", {
        child: "-",
        parent: d
      }), o.querySelector(".nextTimer") ? d.appendChild(o.querySelector(".nextTimer")) : Util.addDom("div", {
        child: "-",
        parent: d
      }), Util.addDom("div", {
        class: `ogl_icon ogl_mission${o.getAttribute("data-mission-type")}`,
        prepend: r
      }), r.appendChild(o.querySelector(".route a")), o.querySelector(".fedAttack") && r.appendChild(o.querySelector(".fedAttack")), o.querySelector(".sendMail") && r.appendChild(o.querySelector(".sendMail")), o.prepend(a), o.prepend(i), o.prepend(r)
    })), e || this.ogl._time.updateMovements()
  }
}
class ShortcutManager extends Manager {
  load() {
    document.querySelector(".ogl_shortcuts")?.remove(), document.querySelector(".ogl_shortCutWrapper")?.remove(), this.keyList = {}, this.shortCutWrapper = Util.addDom("div", {
      class: "ogl_shortCutWrapper",
      child: "<div></div>"
    }), this.shortcutDiv = Util.addDom("div", {
      class: "ogl_shortcuts",
      parent: this.ogl.db.options.shortcutsOnRight ? document.querySelector("#rechts") : this.shortCutWrapper
    }), this.locked = !1, this.loaded || (document.addEventListener("keydown", (e => {
      let t = document.activeElement;
      ("INPUT" != t.tagName && "TEXTAREA" != t.tagName || document.querySelector('.tippy-box[data-state="visible"]') || document.querySelector(".tippy-box .ogl_formValidation")) && (!this.keyList[e.key.toLowerCase()] || this.locked || e.ctrlKey || e.shiftKey ? isNaN(e.key) || !this.keyList["2-9"] || this.locked || e.ctrlKey || e.shiftKey || (this.locked = !0, this.keyList["2-9"](e.key)) : (this.locked = !0, this.keyList[e.key.toLowerCase()]()), !e.repeat && "enter" == e.key.toLowerCase() && document.querySelector('.tippy-box[data-state="visible"]') && document.querySelector(".tippy-box .ogl_formValidation") && (document.querySelector(".tippy-box .ogl_formValidation").click(), unsafeWindow.tippy && tippy.hideAll()))
    })), document.addEventListener("keyup", (() => this.locked = !1)), visualViewport.addEventListener("resize", (() => this.updateShortcutsPosition())), visualViewport.addEventListener("scroll", (() => this.updateShortcutsPosition()))), this.loaded = !0, this.add("menu", (() => {
      document.querySelector(".ogl_side.ogl_active .ogl_config") ? (this.ogl._ui.side.classList.remove("ogl_active"), delete this.ogl.db.currentSide) : this.ogl._topbar.openSettings()
    })), this.add("showMenuResources", (() => {
      this.ogl.db.options.showMenuResources++, this.ogl.db.options.showMenuResources > 2 && (this.ogl.db.options.showMenuResources = 0), localStorage.setItem("ogl_menulayout", this.ogl.db.options.showMenuResources), document.body.setAttribute("data-menulayout", this.ogl.db.options.showMenuResources)
    })), this.add("previousPlanet", (() => {
      localStorage.setItem("ogl-redirect", !1), document.body.classList.remove("ogl_destinationPicker"), 1 === this.ogl.mode || 2 === this.ogl.mode || 5 === this.ogl.mode ? this.ogl._fleet.redirectionReady && (window.location.href = this.ogl.prevRedirection) : "planet" != this.ogl.currentPlanet.obj.type && this.ogl.currentPlanet.dom.prev.querySelector(".moonlink") ? this.ogl.currentPlanet.dom.prev.querySelector(".moonlink").click() : this.ogl.currentPlanet.dom.prev.querySelector(".planetlink").click()
    })), this.add("nextPlanet", (() => {
      localStorage.setItem("ogl-redirect", !1), document.body.classList.remove("ogl_destinationPicker"), 1 === this.ogl.mode || 2 === this.ogl.mode || 5 === this.ogl.mode ? this.ogl._fleet.redirectionReady && (window.location.href = this.ogl.nextRedirection) : "planet" != this.ogl.currentPlanet.obj.type && this.ogl.currentPlanet.dom.next.querySelector(".moonlink") ? this.ogl.currentPlanet.dom.next.querySelector(".moonlink").click() : this.ogl.currentPlanet.dom.next.querySelector(".planetlink").click()
    })), isNaN(this.ogl.db.currentSide) && "tagged" != this.ogl.db.currentSide || !document.querySelector(".ogl_side.ogl_active") || this.add("nextPinnedPosition", (() => {
      if (!isNaN(this.ogl.db.currentSide) && document.querySelector(".ogl_side.ogl_active")) {
        const e = Array.from(document.querySelectorAll(".ogl_pinDetail [data-galaxy]")),
          t = e.findLastIndex((e => e.classList.contains("ogl_active"))),
          n = Util.reorderArray(e, t)[1];
        n && n.click()
      }
      else if ("tagged" == this.ogl.db.currentSide && document.querySelector(".ogl_side.ogl_active")) {
        const e = Array.from(document.querySelectorAll(".ogl_tagged [data-galaxy]")),
          t = e.findLastIndex((e => e.classList.contains("ogl_active"))),
          n = Util.reorderArray(e, t)[1];
        n && n.click()
      }
      else fadeBox(this.ogl._lang.find("noCurrentPin"), !0)
    })), "fleetdispatch" == this.ogl.page ? (Util.addDom("div", {
      class: "ogl_separator",
      parent: this.shortcutDiv
    }), this.add("expeditionSC", (() => {
      "fleet1" == fleetDispatcher.currentPage && this.ogl._fleet.selectExpedition(202)
    }), "fleet"), this.add("expeditionLC", (() => {
      "fleet1" == fleetDispatcher.currentPage && this.ogl._fleet.selectExpedition(203)
    }), "fleet"), this.add("expeditionPF", (() => {
      "fleet1" == fleetDispatcher.currentPage && this.ogl._fleet.selectExpedition(219)
    }), "fleet"), this.add("fleetRepeat", (() => {
      "fleet1" == fleetDispatcher.currentPage && (fleetDispatcher.resetShips(), Object.values(this.ogl.db.previousFleet.shipsToSend).forEach((e => fleetDispatcher.selectShip(e.id, e.number)))), this.ogl._fleet.setRealTarget(fleetDispatcher.realTarget, {
        galaxy: this.ogl.db.previousFleet.targetPlanet.galaxy,
        system: this.ogl.db.previousFleet.targetPlanet.system,
        position: this.ogl.db.previousFleet.targetPlanet.position,
        type: this.ogl.db.previousFleet.targetPlanet.type,
        name: this.ogl.db.previousFleet.targetPlanet.name
      }), fleetDispatcher.selectMission(this.ogl.db.previousFleet.mission), fleetDispatcher.cargoMetal = this.ogl.db.previousFleet.cargoMetal, fleetDispatcher.cargoCrystal = this.ogl.db.previousFleet.cargoCrystal, fleetDispatcher.cargoDeuterium = this.ogl.db.previousFleet.cargoDeuterium, fleetDispatcher.realSpeedPercent = this.ogl.db.previousFleet.speedPercent, fleetDispatcher.speedPercent = this.ogl.db.previousFleet.speedPercent, "fleet2" == fleetDispatcher.currentPage && fleetDispatcher.fetchTargetPlayerData(), 15 == fleetDispatcher.mission && (document.querySelector("#fleet2 #expeditiontime").value = this.ogl.db.previousFleet.expeditionTime, document.querySelector("#fleet2 #expeditiontimeline .dropdown a").innerText = this.ogl.db.previousFleet.expeditionTime, fleetDispatcher.updateExpeditionTime()), fleetDispatcher.setFleetPercent(fleetDispatcher.realSpeedPercent), Object.values(document.querySelector("#speedPercentage"))[0].percentageBarInstance.setValue(fleetDispatcher.realSpeedPercent), fleetDispatcher.refresh(), fleetDispatcher.focusSubmitFleet1()
    }), "fleet"), this.add("fleetSelectAll", (() => {
      "fleet1" == fleetDispatcher.currentPage ? fleetDispatcher.selectAllShips() : "fleet2" == fleetDispatcher.currentPage && fleetDispatcher.selectMaxAll(), fleetDispatcher.refresh()
    }), "fleet"), this.ogl.db.quickRaidList && this.ogl.db.quickRaidList.length > 0 && this.add("quickRaid", (() => {
      if ("fleet1" == fleetDispatcher.currentPage) {
        fleetDispatcher.resetShips(), this.ogl._fleet.isQuickRaid = !0;
        const e = this.ogl.db.quickRaidList[0].match(/.{1,3}/g).map(Number),
          t = this.ogl._fleet.shipsForResources(this.ogl.db.options.defaultShip, this.ogl.db.options.resourceTreshold);
        fleetDispatcher.selectShip(this.ogl.db.options.defaultShip, t), fleetDispatcher.realTarget.galaxy = e[0], fleetDispatcher.realTarget.system = e[1], fleetDispatcher.realTarget.position = e[2], fleetDispatcher.realTarget.type = 1, fleetDispatcher.selectMission(1), fleetDispatcher.targetPlanet.name = `Quick raid ${e.join(":")}`, fleetDispatcher.cargoMetal = 0, fleetDispatcher.cargoCrystal = 0, fleetDispatcher.cargoDeuterium = 0, fleetDispatcher.mission = 1, fleetDispatcher.speedPercent = 10, fleetDispatcher.refresh(), fleetDispatcher.focusSubmitFleet1()
      }
    }), "fleet"), this.add("fleetReverseAll", (() => {
      "fleet1" == fleetDispatcher.currentPage ? (fleetDispatcher.shipsOnPlanet.forEach((e => {
        const t = e.number - (fleetDispatcher.findShip(e.id)?.number || 0);
        fleetDispatcher.selectShip(e.id, t), fleetDispatcher.refresh()
      })), fleetDispatcher.refresh(), fleetDispatcher.focusSubmitFleet1()) : "fleet2" == fleetDispatcher.currentPage && (["metal", "crystal", "deut", "food"].forEach((e => {
        fleetDispatcher[this.ogl._fleet.cargo[e]] = Math.min(fleetDispatcher[this.ogl._fleet.resOnPlanet[e]] - fleetDispatcher[this.ogl._fleet.cargo[e]], fleetDispatcher.getFreeCargoSpace())
      })), fleetDispatcher.refresh())
    }), "fleet"), this.add("fleetResourcesSplit", (e => {
      if (this.keyNumberClickFleet1 = this.keyNumberClickFleet1 || 0, this.keyNumberClickFleet2 = this.keyNumberClickFleet2 || 0, "fleet1" == fleetDispatcher.currentPage) isNaN(e) && (e = 2 + this.keyNumberClickFleet1), this.keyNumberClickFleet2 = this.keyNumberClickFleet1, this.keyNumberClickFleet1++, this.keyNumberClickFleet1 > 7 && (this.keyNumberClickFleet1 = 0), 0 == e ? fleetDispatcher.resetShips() : fleetDispatcher.shipsOnPlanet.forEach((t => fleetDispatcher.selectShip(t.id, Math.ceil(t.number / e))));
      else if ("fleet2" == fleetDispatcher.currentPage) {
        isNaN(e) && (e = 2 + this.keyNumberClickFleet2), this.keyNumberClickFleet2++, this.keyNumberClickFleet2 > 7 && (this.keyNumberClickFleet2 = 0);
        let t = ["metalOnPlanet", "crystalOnPlanet", "deuteriumOnPlanet"];
        0 == e ? fleetDispatcher.resetCargo() : document.querySelectorAll("#fleet2 #resources .res_wrap").forEach(((n, o) => {
          let a = ["cargoMetal", "cargoCrystal", "cargoDeuterium"],
            i = fleetDispatcher[t[o]];
          2 == o && (i -= fleetDispatcher.getConsumption()), fleetDispatcher[a[o]] = Math.max(Math.ceil(i / e), 0), n.querySelector("input").value = fleetDispatcher[a[o]]
        }))
      }
      fleetDispatcher.refresh()
    })), Util.addDom("div", {
      class: "ogl_shortcut ogl_button",
      "data-key": "enter",
      child: '<span class="material-icons">subdirectory_arrow_left</span>',
      parent: this.shortcutDiv,
      onclick: () => {
        document.querySelector("#fleetdispatchcomponent").dispatchEvent(new KeyboardEvent("keypress", {
          keyCode: 13
        }))
      }
    })) : "messages" == this.ogl.page ? (Util.addDom("div", {
      class: "ogl_separator",
      parent: this.shortcutDiv
    }), this.add("enter", (() => {
      if (this.ogl._message.nextTarget) {
        const e = this.ogl._message.nextTarget,
          t = this.ogl._fleet.shipsForResources(!1, Math.round(1.07 * e.total));
        window.location.href = `?page=ingame&component=fleetdispatch&galaxy=${e.coords[0]}&system=${e.coords[1]}&position=${e.coords[2]}&type=${3==e.type?3:1}&mission=1&am${this.ogl.db.options.defaultShip}=${t}&oglmode=4&oglmsg=${e.id}`
      }
    }))) : "galaxy" == this.ogl.page ? (Util.addDom("div", {
      class: "ogl_separator",
      parent: this.shortcutDiv
    }), this.add("galaxyUp", (() => submitOnKey("ArrowUp"))), this.add("galaxyLeft", (() => submitOnKey("ArrowLeft"))), this.add("galaxyDown", (() => submitOnKey("ArrowDown"))), this.add("galaxyRight", (() => submitOnKey("ArrowRight"))), this.add("galaxySpySystem", (() => document.querySelector(".spysystemlink").click())), this.add("discovery", (() => sendSystemDiscoveryMission()))) : "movement" == this.ogl.page && (Util.addDom("div", {
      class: "ogl_separator",
      parent: this.shortcutDiv
    }), this.add("backFirstFleet", (() => {
      document.querySelector('#movementcomponent .reversal a[data-key-color="orange"]') && document.querySelector('#movementcomponent .reversal a[data-key-color="orange"]').click()
    }), !1, "orange"), this.add("backLastFleet", (() => {
      document.querySelector('#movementcomponent .reversal a[data-key-color="violet"]') && document.querySelector('#movementcomponent .reversal a[data-key-color="violet"]').click()
    }), !1, "violet")), this.ogl.db.options.shortcutsOnRight || document.body.appendChild(this.shortCutWrapper), this.updateShortcutsPosition()
  }
  add(e, t, n, o) {
    let a = this.ogl.db.options.keyboardActions[e];
    "enter" == e && (a = e, e = "attackNext");
    const i = Util.addDom("div", {
      "data-key": a,
      "data-key-color": o,
      "data-key-id": e,
      class: "ogl_shortcut ogl_button tooltip",
      parent: this.shortcutDiv,
      title: this.ogl._lang.find(e),
      child: a.replace("enter", '<span class="material-icons">subdirectory_arrow_left</span>'),
      onclick: () => t()
    });
    "quickRaid" == e && (i.innerText += ` (${this.ogl.db.quickRaidList.length})`), this.keyList[a] = e => {
      ("fleet" != n || this.ogl._fleet.isReady && unsafeWindow.fleetDispatcher && !fleetDispatcher.fetchTargetPlayerDataTimeout) && t(e)
    }
  }
  updateShortcutsPosition() {
    if (this.ogl.db.options.shortcutsOnRight) return;
    const e = this.shortCutWrapper;
    e.style.top = visualViewport.offsetTop + "px", e.style.height = visualViewport.height - 25 + "px", e.style.left = visualViewport.offsetLeft + "px", e.style.width = visualViewport.width + "px", e.querySelectorAll(".ogl_shortcut").forEach((e => e.style.zoom = 1 / visualViewport.scale))
  }
}
class TechManager extends Manager {
  load() {
    if (this.ogl.currentPlanet.obj.todolist = this.ogl.currentPlanet.obj.todolist || {}, this.initialLevel = 0, this.levelOffset = 0, this.detailCumul = {}, this.checkProductionBoxes(), unsafeWindow.technologyDetails) {
      technologyDetails.show = e => {
        this.xhr && this.xhr.abort();
        const t = document.querySelector("#technologydetails_wrapper"),
          n = t.querySelector("#technologydetails_content");
        n.querySelector(".ogl_loading") || (n.innerHTML = '<div class="ogl_wrapperloading"><div class="ogl_loading"></div></div>'), t.classList.add("ogl_active"), this.xhr = $.ajax({
          url: technologyDetails.technologyDetailsEndpoint,
          data: {
            technology: e
          }
        }).done((o => {
          const a = JSON.parse(o);
          "failure" === a.status ? technologyDetails.displayErrors(a.errors) : (n.innerText = "", $("#technologydetails_content").append(a.content[a.target]), this.check(e, t))
        }))
      }, technologyDetails.hide = () => {
        document.querySelector("#technologydetails_wrapper").classList.remove("ogl_active"), technologyDetails.id = !1, technologyDetails.lvl = !1
      };
      const e = new URLSearchParams(window.location.search).get("openTech");
      e && technologyDetails.show(e)
    }
    document.querySelectorAll("#technologies .technology[data-technology]").forEach((e => {
      const t = e.getAttribute("data-technology");
      this.ogl.db.serverData[t] = e.getAttribute("aria-label") || t
    })), this.ogl._topbar.checkUpgrade()
  }
  check(e, t) {
    t.querySelector(".shipyardSelection") && t.querySelector(".sprite_large").appendChild(t.querySelector(".shipyardSelection"));
    const n = Util.addDom("div", {
        parent: t.querySelector(".sprite") || t.querySelector(".sprite_large"),
        class: "ogl_actions"
      }),
      o = Datafinder.getTech(e);
    this.levelOffset = 0, this.initialLevel = parseInt(t.querySelector(".information .level")?.getAttribute("data-value") || 0);
    let a = t.querySelector("#build_amount");
    if (document.querySelector(`#technologies .technology[data-technology="${e}"] .targetlevel`)?.getAttribute("data-value") >= this.initialLevel && (this.initialLevel += 1), a) {
      a.addEventListener("input", (() => {
        setTimeout((() => {
          const n = parseInt(a.value) || 0;
          a.value = Math.min(99999, n), a.value && setTimeout((() => this.displayLevel(e, n, o, t)))
        }), 100)
      })), a.setAttribute("onkeyup", "checkIntInput(this, 1, 99999);event.stopPropagation();"), a.parentNode.querySelector(".maximum") && a.parentNode.querySelector(".maximum").addEventListener("click", (() => a.dispatchEvent(new Event("input")))), Util.addDom("div", {
        parent: n,
        class: "material-icons ogl_button",
        child: "format_list_bulleted_add",
        onclick: t => {
          this.todoData = {};
          const n = a.value && a.value > 0 ? a.value : 1,
            o = this.getTechData(e, n, this.ogl.currentPlanet.obj.id);
          this.todoData[e] = {}, this.todoData[e].amount = parseInt(n) || 0, this.todoData[e].id = e, this.todoData[e].metal = o.target.metal, this.todoData[e].crystal = o.target.crystal, this.todoData[e].deut = o.target.deut, this.addToTodolist(this.todoData)
        }
      });
      const i = Util.addDom("div", {
          parent: t.querySelector(".build_amount"),
          class: "ogl_queueShip"
        }),
        r = Util.addDom("div", {
          parent: i,
          title: this.ogl._lang.find("repeatQueue"),
          class: "ogl_button ogl_queue10 tooltip",
          child: "Repeat x",
          onclick: () => {
            r.classList.add("ogl_disabled"), l.classList.add("ogl_disabled");
            const t = () => {
              fetch(scheduleBuildListEntryUrl + `&technologyId=${e}&amount=${a.value||1}&mode=1&token=${token}`, {
                headers: {
                  "X-Requested-With": "XMLHttpRequest"
                }
              }).then((e => e.json())).then((e => {
                const n = parseInt(l.value?.replace(/\D/g, "") || 0) - 1;
                l.value = n, token = e.newAjaxToken, window.stop(), n > 0 ? t() : (r.classList.remove("ogl_disabled"), l.classList.remove("ogl_disabled"))
              }))
            };
            t()
          }
        }),
        l = Util.addDom("input", {
          type: "number",
          min: 0,
          max: 100,
          value: 1,
          parent: i,
          oninput: () => {
            const e = parseInt(l.value?.replace(/\D/g, "") || 0),
              t = parseInt(l.getAttribute("min")),
              n = parseInt(l.getAttribute("max"));
            l.value = Math.min(Math.max(e, t), n)
          }
        });
      t.querySelector(".build-it_wrap .upgrade[disabled]") && (r.classList.add("ogl_disabled"), l.classList.add("ogl_disabled"))
    }
    else 407 != e && 408 != e && (Util.addDom("div", {
      parent: n,
      class: "material-icons ogl_button",
      child: "chevron_left",
      onclick: () => {
        this.levelOffset > 1 - this.initialLevel && (this.levelOffset--, this.displayLevel(e, this.initialLevel + this.levelOffset, o, t))
      }
    }), Util.addDom("div", {
      parent: n,
      class: "material-icons ogl_button",
      child: "close",
      onclick: () => {
        this.levelOffset = 0, this.displayLevel(e, this.initialLevel, o, t)
      }
    }), Util.addDom("div", {
      parent: n,
      class: "material-icons ogl_button",
      child: "chevron_right",
      onclick: () => {
        this.levelOffset++, this.displayLevel(e, this.initialLevel + this.levelOffset, o, t)
      }
    })), Util.addDom("div", {
      parent: n,
      class: "material-icons ogl_button",
      child: "format_list_bulleted_add",
      onclick: t => {
        if (this.levelOffset >= 0) {
          t.target.classList.add("ogl_active"), this.todoData = {};
          for (let t = this.initialLevel; t <= this.initialLevel + this.levelOffset; t++) {
            const n = this.getTechData(e, t, this.ogl.currentPlanet.obj.id);
            this.todoData[t] = {}, this.todoData[t].level = t, this.todoData[t].id = e, this.todoData[t].metal = n.target.metal, this.todoData[t].crystal = n.target.crystal, this.todoData[t].deut = n.target.deut
          }
          this.addToTodolist(this.todoData)
        }
        else this.ogl._notification.addToQueue("Cannot lock previous levels", !1)
      }
    });
    this.displayLevel(e, this.initialLevel, o, t)
  }
  displayLevel(e, t, n, o) {
    const a = this.getTechData(e, t, this.ogl.currentPlanet.obj.id),
      i = {};
    this.detailCumul[e] = this.detailCumul[e] || {}, this.detailCumul[e][t] = this.detailCumul[e][t] || {};
    for (let [n, o] of Object.entries(a.target || {})) this.detailCumul[e][t][n] = o;
    for (let [t, n] of Object.entries(this.detailCumul[e] || {})) t >= this.initialLevel && t <= this.initialLevel + this.levelOffset && Object.entries(n).forEach((e => {
      "energy" == e[0] || "population" == e[0] ? i[e[0]] = e[1] : i[e[0]] = (i[e[0]] || 0) + e[1]
    }));
    unsafeWindow.technologyDetails && (technologyDetails.id = e, technologyDetails.lvl = t), this.ogl.db.options.debugMode && !o.querySelector("[data-debug]") && (o.querySelector(".build_duration time").setAttribute("data-debug", o.querySelector(".build_duration time").innerText), o.querySelector(".information .level") && o.querySelector(".information .level").setAttribute("data-debug", o.querySelector(".information .level").innerText), o.querySelector(".costs .metal") && o.querySelector(".costs .metal").setAttribute("data-debug", o.querySelector(".costs .metal").innerText), o.querySelector(".costs .crystal") && o.querySelector(".costs .crystal").setAttribute("data-debug", o.querySelector(".costs .crystal").innerText), o.querySelector(".costs .deuterium") && o.querySelector(".costs .deuterium").setAttribute("data-debug", o.querySelector(".costs .deuterium").innerText), o.querySelector(".costs .energy") && o.querySelector(".costs .energy").setAttribute("data-debug", o.querySelector(".costs .energy").innerText), o.querySelector(".costs .population") && o.querySelector(".costs .population").setAttribute("data-debug", o.querySelector(".costs .population").innerText), o.querySelector(".additional_energy_consumption .value") && o.querySelector(".additional_energy_consumption .value").setAttribute("data-debug", o.querySelector(".additional_energy_consumption .value").innerText), o.querySelector(".energy_production .value") && o.querySelector(".energy_production .value").setAttribute("data-debug", o.querySelector(".energy_production .value").innerText));
    const r = o.querySelector(".ogl_costsWrapper") || Util.addDom("div", {
      class: "ogl_costsWrapper",
      parent: o.querySelector(".costs")
    });
    if (r.innerText = "", o.querySelector(".build_duration time").innerText = a.target.timeresult, o.querySelector(".additional_energy_consumption .value")) {
      const n = o.querySelector(".additional_energy_consumption .value");
      n.classList.add("tooltip"), 217 == e && (a.target.conso = parseInt(n.getAttribute("data-value")) * (t || 1)), n.setAttribute("title", Util.formatNumber(a.target.conso)), n.innerHTML = Util.formatToUnits(a.target.conso, !1, !0)
    }
    o.querySelector(".energy_production .value") && (o.querySelector(".energy_production .value").innerHTML = `<span class="bonus">+${Util.formatToUnits(a.target.prodEnergy,!1,!0)}</span>`), o.querySelector(".information .level") && (o.querySelector(".information .level").innerHTML = `${t-1} <i class="material-icons">east</i> <b>${t}</b>`, this.ogl.currentPlanet.obj.todolist[e]?.[t] ? o.querySelector(".ogl_actions .ogl_button:last-child").classList.add("ogl_active") : o.querySelector(".ogl_actions .ogl_button:last-child").classList.remove("ogl_active")), o.querySelector(".required_population") && o.querySelector(".required_population span").setAttribute("data-formatted", Util.formatToUnits(o.querySelector(".required_population span").getAttribute("data-value"), 0).replace(/<[^>]+>/g, ""));
    const l = Util.addDom("div", {
      class: "ogl_icon",
      parent: r
    });
    Util.addDom("div", {
      parent: l
    }), Util.addDom("div", {
      parent: l,
      child: Math.max(t, 1)
    }), o.querySelector(".build_amount") || 407 == e || 408 == e || Util.addDom("div", {
      parent: l,
      child: `${this.initialLevel-1} <i class="material-icons">east</i> ${this.initialLevel+this.levelOffset}`
    }), Util.addDom("div", {
      parent: l,
      class: "material-icons",
      child: "globe"
    }), ["metal", "crystal", "deut", "energy", "population"].forEach((e => {
      if (o.querySelector(`.costs .${e.replace("deut","deuterium")}`)) {
        const t = o.querySelector(".build_amount") ? (this.ogl.currentPlanet.obj[e] || 0) - (a.target[e] || 0) : (this.ogl.currentPlanet.obj[e] || 0) - (i[e] || 0),
          n = Util.addDom("div", {
            class: `ogl_icon ogl_${e}`,
            parent: r
          });
        Util.addDom("div", {
          class: "tooltip",
          title: Util.formatNumber(a.target[e]),
          parent: n,
          child: Util.formatToUnits(a.target[e], 2)
        }), o.querySelector(".build_amount") || Util.addDom("div", {
          parent: n,
          class: "ogl_text tooltip",
          title: Util.formatNumber(i[e]),
          child: Util.formatToUnits(i[e], 2)
        }), t < 0 ? Util.addDom("div", {
          parent: n,
          class: "ogl_danger tooltip",
          title: Util.formatNumber(t),
          child: Util.formatToUnits(t, 2)
        }) : Util.addDom("div", {
          parent: n,
          class: "ogl_ok material-icons",
          child: "check"
        })
      }
    }));
    const s = this.ogl.db.options.msu,
      d = Util.addDom("div", {
        class: "ogl_icon ogl_msu",
        parent: r
      }),
      c = Util.getMSU(a.target.metal, a.target.crystal, a.target.deut, s);
    Util.addDom("div", {
      class: "tooltip",
      title: Util.formatNumber(c),
      parent: d,
      child: Util.formatToUnits(c, 2)
    });
    const p = Util.getMSU(i.metal, i.crystal, i.deut, s);
    o.querySelector(".build_amount") || Util.addDom("div", {
      parent: d,
      class: "ogl_text tooltip",
      title: Util.formatNumber(p),
      child: Util.formatToUnits(p, 2)
    })
  }
  addToTodolist(e) {
    this.ogl.currentPlanet.obj.todolist = this.ogl.currentPlanet.obj.todolist || {}, Object.values(e).forEach((e => {
      const t = this.ogl.currentPlanet.obj.todolist,
        n = e.level || Date.now() + performance.now();
      t[e.id] = t[e.id] || {}, t[e.id][n] = t[e.id][n] || {}, t[e.id][n].id = e.id, t[e.id][n].amount = e.amount || 0, t[e.id][n].level = n, t[e.id][n].cost = {
        metal: e.metal,
        crystal: e.crystal,
        deut: e.deut
      }
    })), this.checkTodolist()
  }
  checkTodolist() {
    document.querySelectorAll(".planetlink, .moonlink").forEach((e => {
      const t = e.classList.contains("moonlink");
      t ? e.parentNode.querySelectorAll(".ogl_todoIcon.ogl_moon").forEach((e => e.remove())) : e.parentNode.querySelectorAll(".ogl_todoIcon.ogl_planet").forEach((e => e.remove()));
      const n = new URLSearchParams(e.getAttribute("href")).get("cp").split("#")[0];
      let o, a = 0;
      if (Object.values(this.ogl.db.myPlanets[n]?.todolist || {}).forEach(((i, r) => {
          0 == r && (o = Util.addDom("div", {
            class: "material-icons ogl_todoIcon",
            child: "format_list_bulleted",
            onclick: () => {
              this.openTodolist(this.ogl.db.myPlanets[n].todolist, `${e.parentNode.querySelector(".planet-koords").innerText}:${t?3:1}`, n)
            }
          })), Object.values(i).forEach((e => {
            a++, (e.cost?.metal || 0) + (e.cost?.crystal || 0) + (e.cost?.deut || 0) <= 0 && o.classList.add("ogl_ok")
          }))
        })), o) {
        const n = t ? "ogl_sideIconBottom" : "ogl_sideIconTop",
          i = e.parentNode.querySelector(`.${n}`) || Util.addDom("div", {
            class: n,
            parent: e.parentNode
          });
        t ? o.classList.add("ogl_moon") : o.classList.add("ogl_planet"), o.setAttribute("data-list", a), i.appendChild(o)
      }
    }));
    let e = !1;
    document.querySelectorAll(".technology[data-technology]").forEach((t => {
      let n = t.getAttribute("data-technology"),
        o = t.querySelector(".targetlevel") || t.querySelector(".level");
      o && (o = parseInt(o.getAttribute("data-value")), Object.keys(this.ogl.currentPlanet.obj.todolist?.[n] || {}).forEach((t => {
        o >= parseInt(t) && (delete this.ogl.currentPlanet.obj.todolist[n][t], Object.values(this.ogl.currentPlanet.obj.todolist[n]).length < 1 && (delete this.ogl.currentPlanet.obj.todolist[n], e = !0))
      })))
    })), e && this.checkTodolist()
  }
  openTodolist(e, t, n) {
    let o = {};
    const a = t.split(":"),
      i = Util.addDom("div", {
        class: "ogl_todoList",
        child: `<h2>Todolist ${1==a[3]?"planet":"moon"} [${a[0]}:${a[1]}:${a[2]}]</h2>`
      }),
      r = Util.addDom("div", {
        parent: i
      }),
      l = Util.addDom("div", {
        parent: i,
        class: "ogl_actions"
      });
    let s = {},
      d = {},
      c = (e, t, a, i, r) => {
        setTimeout((() => {
          const l = a.querySelectorAll("input:checked").length,
            s = Object.keys(e).length,
            d = Object.values(e)[0]?.id;
          if (!s) return r.remove(), Object.keys(o).filter((e => e.startsWith(d + "_"))).forEach((e => delete o[e])), delete this.ogl.db.myPlanets[n].todolist[d], void this.checkTodolist();
          t.innerHTML = this.ogl.db.serverData[d], t.innerHTML += ` (<b>${l}</b>/${s})`, l != s && i && i.querySelector("input:checked") && (i.querySelector("input:checked").checked = !1), Object.entries(o).length > 0 ? m.classList.remove("ogl_disabled") : m.classList.add("ogl_disabled"), p()
        }))
      },
      p = () => {
        f.innerHTML = `\n                <div class="ogl_grid">\n                    <div class="ogl_icon"><div class="material-icons">sigma</div><div>Required</div><div>Selected</div></div>\n                    <div class="ogl_icon ogl_metal"><div>${Util.formatToUnits(s.metal||0)}</div><div>${Util.formatToUnits(d.metal||0)}</div></div>\n                    <div class="ogl_icon ogl_crystal"><div>${Util.formatToUnits(s.crystal||0)}</div><div>${Util.formatToUnits(d.crystal||0)}</div></div>\n                    <div class="ogl_icon ogl_deut"><div>${Util.formatToUnits(s.deut||0)}</div><div>${Util.formatToUnits(d.deut||0)}</div></div>\n                </div>\n            `
      },
      g = (e, t, n) => {
        setTimeout((() => {
          e.innerHTML = "";
          let o = Util.addDom("div", {
              class: "ogl_line ogl_blockRecap",
              parent: e,
              child: `\n                    <div>all</div>\n                    <div class="ogl_icon ogl_metal">${Util.formatToUnits(n.metal,2)}</div>\n                    <div class="ogl_icon ogl_crystal">${Util.formatToUnits(n.crystal,2)}</div>\n                    <div class="ogl_icon ogl_deut">${Util.formatToUnits(n.deut,2)}</div>\n                    <label></label>\n                `
            }),
            a = Util.addDom("input", {
              type: "checkbox",
              parent: o.querySelector("label"),
              oninput: () => {
                a.checked ? t.querySelectorAll("input").forEach((e => {
                  1 != e.checked && e.click()
                })) : t.querySelectorAll("input").forEach((e => {
                  1 == e.checked && e.click()
                }))
              }
            });
          Util.addDom("button", {
            class: "material-icons",
            parent: o,
            child: "cube-send",
            onclick: () => {
              t.querySelectorAll("input").forEach((e => {
                1 != e.checked && e.click()
              })), setTimeout((() => i.querySelector(".ogl_button").click()), 50)
            }
          }), Util.addDom("button", {
            class: "material-icons ogl_removeTodo",
            parent: o,
            child: "close",
            onclick: () => {
              t.querySelectorAll(".ogl_removeTodo").forEach((e => {
                e.click()
              })), setTimeout((() => p()), 10)
            }
          })
        }))
      };
    Object.values(e).forEach((e => {
      const t = Util.addDom("div", {
          class: "ogl_tech",
          parent: r
        }),
        a = Util.addDom("h3", {
          parent: t,
          onclick: () => t.classList.toggle("ogl_active")
        }),
        l = Util.addDom("div", {
          parent: t
        }),
        p = Util.addDom("footer", {
          parent: t
        }),
        u = {};
      Object.values(e).forEach((m => {
        const h = m.amount || m.level,
          f = `${m.id}_${m.level}`;
        let b = Util.addDom("div", {
          class: "ogl_line",
          "data-parent": this.ogl.db.serverData[m.id],
          parent: l,
          child: `\n                    <div>${h}</div><div class="ogl_icon ogl_metal">${Util.formatToUnits(m.cost?.metal,2)}</div>\n                    <div class="ogl_icon ogl_crystal">${Util.formatToUnits(m.cost?.crystal,2)}</div>\n                    <div class="ogl_icon ogl_deut">${Util.formatToUnits(m.cost?.deut,2)}</div>\n                    <label></label>\n                `
        });
        u.metal = (u.metal || 0) + (m.cost?.metal || 0), u.crystal = (u.crystal || 0) + (m.cost?.crystal || 0), u.deut = (u.deut || 0) + (m.cost?.deut || 0), s.metal = (s.metal || 0) + (m.cost?.metal || 0), s.crystal = (s.crystal || 0) + (m.cost?.crystal || 0), s.deut = (s.deut || 0) + (m.cost?.deut || 0);
        let y = Util.addDom("input", {
          type: "checkbox",
          parent: b.querySelector("label"),
          oninput: () => {
            y.checked ? (o[f] = m, y.setAttribute("data-clicked", performance.now()), d.metal = (d.metal || 0) + (m.cost?.metal || 0), d.crystal = (d.crystal || 0) + (m.cost?.crystal || 0), d.deut = (d.deut || 0) + (m.cost?.deut || 0)) : (delete o[f], y.removeAttribute("data-clicked"), d.metal = (d.metal || 0) - (m.cost?.metal || 0), d.crystal = (d.crystal || 0) - (m.cost?.crystal || 0), d.deut = (d.deut || 0) - (m.cost?.deut || 0)), r.querySelectorAll("label").forEach((e => e.removeAttribute("data-order"))), Array.from(r.querySelectorAll(".ogl_tech > div input:checked")).sort(((e, t) => e.getAttribute("data-clicked") - t.getAttribute("data-clicked"))).forEach(((e, t) => {
              e.parentNode.setAttribute("data-order", t + 1)
            })), c(e, a, l, p, t)
          }
        });
        Util.addDom("button", {
          class: "material-icons",
          parent: b,
          child: "cube-send",
          onclick: () => {
            y.click(), setTimeout((() => i.querySelector(".ogl_button").click()), 50)
          }
        }), Util.addDom("button", {
          class: "material-icons ogl_removeTodo",
          parent: b,
          child: "close",
          onclick: () => {
            b.remove(), u.metal = (u.metal || 0) - (m.cost?.metal || 0), u.crystal = (u.crystal || 0) - (m.cost?.crystal || 0), u.deut = (u.deut || 0) - (m.cost?.deut || 0), d.metal = (d.metal || 0) - (m.cost?.metal || 0), d.crystal = (d.crystal || 0) - (m.cost?.crystal || 0), d.deut = (d.deut || 0) - (m.cost?.deut || 0), delete o[f], delete this.ogl.db.myPlanets[n].todolist[m.id][m.level], Object.keys(this.ogl.db.myPlanets[n].todolist[m.id] || {}).length <= 0 && (delete this.ogl.db.myPlanets[n].todolist[m.id], t.remove()), Object.keys(ogl.db.myPlanets[n].todolist || {}).length <= 0 && (this.ogl.db.myPlanets[n].todolist = {}, this.ogl._popup.close()), Array.from(r.querySelectorAll(".ogl_tech > div input:checked")).sort(((e, t) => e.getAttribute("data-clicked") - t.getAttribute("data-clicked"))).forEach(((e, t) => {
              e.parentNode.setAttribute("data-order", t + 1)
            })), unsafeWindow.technologyDetails && n == this.ogl.currentPlanet.obj.id && document.querySelector("#technologydetails .ogl_actions .ogl_active") && document.querySelector("#technologydetails .ogl_actions .ogl_active").classList.remove("ogl_active"), c(e, a, l, p, t), g(p, l, u), this.checkTodolist()
          }
        })
      })), c(e, a, l, p, t), g(p, l, u)
    }));
    let u = `?page=ingame&component=fleetdispatch&galaxy=${a[0]}&system=${a[1]}&position=${a[2]}&oglmode=3&targetid=${n}&type=${a[3]}`,
      m = Util.addDom("button", {
        class: "ogl_button ogl_disabled",
        parent: l,
        child: 'Send selection <i class="material-icons">cube-send</i>',
        onclick: () => {
          this.ogl.cache.toSend = Object.values(o), h.querySelector("input").checked && (u += "&substractMode=true"), window.location.href = u, l.querySelectorAll(".ogl_button").forEach((e => e.classList.add("ogl_disabled")))
        }
      });
    Util.addDom("button", {
      class: "ogl_button",
      parent: l,
      child: 'Send all <i class="material-icons">cube-send</i>',
      onclick: () => {
        r.querySelectorAll("input").forEach((e => {
          1 != e.checked && e.click()
        })), setTimeout((() => {
          this.ogl.cache.toSend = Object.values(o), l.querySelectorAll(".ogl_button").forEach((e => e.classList.add("ogl_disabled"))), h.querySelector("input").checked && (u += "&substractMode=true"), window.location.href = u
        }), 100)
      }
    }), Util.addDom("button", {
      class: "ogl_button ogl_removeTodo",
      parent: l,
      child: 'Remove all <i class="material-icons">close</i>',
      onclick: () => {
        this.ogl.db.myPlanets[n].todolist = {}, this.ogl._popup.close(), this.checkTodolist(), unsafeWindow.technologyDetails && n == this.ogl.currentPlanet.obj.id && document.querySelector("#technologydetails .ogl_actions .ogl_active") && document.querySelector("#technologydetails .ogl_actions .ogl_active").classList.remove("ogl_active")
      }
    });
    let h = Util.addDom("label", {
      class: "ogl_button",
      parent: l,
      child: '<input type="checkbox">Substract planet resources'
    });
    const f = Util.addDom("div", {
      class: "ogl_totalRequired",
      parent: l
    });
    this.ogl._popup.open(i)
  }
  getTechData(e, t, n) {
    if (!e) return;
    const o = Datafinder.getTech(e),
      a = this.ogl.db.myPlanets[n] || {};
    let i = [],
      r = 0,
      l = {
        113: 1,
        120: 1,
        121: 4,
        114: 7,
        122: 4,
        115: 1,
        117: 2,
        118: 7,
        106: 3,
        108: 1,
        124: 3,
        123: 10,
        199: 12,
        109: 4,
        110: 6,
        111: 2
      };
    document.querySelectorAll(".smallplanet").forEach((t => {
      const o = t.getAttribute("id").replace("planet-", ""),
        a = this.ogl.db.myPlanets[o];
      a && n != o && a[31] >= l[e] && i.push(a[31])
    })), i.sort(((e, t) => t - e)), i = i.slice(0, Math.min(i.length, a[123])), i.length && (r = i.reduce(((e, t) => e + t)));
    const s = {};
    s.lifeform = a.lifeform || 0;
    const d = {};
    if (d.id = e, d.isBaseBuilding = d.id < 100, d.isBaseResearch = d.id > 100 && d.id <= 199, d.isBaseShip = d.id > 200 && d.id <= 299, d.isBaseDef = d.id > 400 && d.id <= 599, d.isLfBuilding = d.id > 11100 && d.id <= 11199 || d.id > 12100 && d.id <= 12199 || d.id > 13100 && d.id <= 13199 || d.id > 14100 && d.id <= 14199, d.isLfResearch = d.id > 11200 && d.id <= 11299 || d.id > 12200 && d.id <= 12299 || d.id > 13200 && d.id <= 13299 || d.id > 14200 && d.id <= 14299, d.base = {}, d.base.metal = o.metal || 0, d.base.crystal = o.crystal || 0, d.base.deut = o.deut || 0, d.base.energy = o.energy || 0, d.base.duration = o.durationbase || 0, d.base.conso = o.conso || 0, d.base.population = o.bonus1BaseValue || 0, d.factor = {}, d.factor.price = o.priceFactor || 2, d.factor.duration = o.durationfactor || 2, d.factor.energy = o.energyFactor || o.energyIncreaseFactor || 2, d.factor.population = o.bonus1IncreaseFactor || 2, d.bonus = {}, d.bonus.price = 0, d.bonus.duration = 0, d.bonus.classDuration = 0, d.bonus.eventDuration = 0, d.bonus.technocrat = 0, d.bonus.engineer = 0, d.bonus.conso = 0, d.bonus.prodEnergy = 0, 1 == this.ogl.account.class && (d.bonus.prodEnergy += .1), 2 == this.ogl.db.allianceClass && (d.bonus.prodEnergy += .05), 2 == s.lifeform ? (d.bonus.prodEnergy += a[12107] * Datafinder.getTech(12107).bonus1BaseValue / 100, d.bonus.conso += a[12107] * Datafinder.getTech(12107).bonus2BaseValue / 100, d.isLfBuilding && (d.bonus.price += a[12108] * Datafinder.getTech(12108).bonus1BaseValue / 100, d.bonus.duration += a[12108] * Datafinder.getTech(12108).bonus2BaseValue / 100)) : 3 == s.lifeform && (d.bonus.prodEnergy += a[13107] * Datafinder.getTech(13107).bonus1BaseValue / 100, (d.isBaseShip || d.isBaseDef) && (d.bonus.duration += a[13106] * Datafinder.getTech(13106).bonus1BaseValue / 100)), d.isBaseResearch && document.querySelector(".technology .acceleration") && (d.bonus.eventDuration += parseInt(document.querySelector(".technology .acceleration").getAttribute("data-value")) / 100), d.isBaseResearch && 3 == this.ogl.account.class && (d.bonus.classDuration += .25 * (1 + (this.ogl.db.lfBonuses?.Characterclasses3?.bonus || 0) / 100)), d.isBaseResearch && document.querySelector("#officers .technocrat.on") && (d.bonus.technocrat += .25), document.querySelector("#officers .engineer.on") && (d.bonus.engineer += .1), d.isLfResearch && (1 == s.lifeform ? (d.bonus.price += a[11103] * Datafinder.getTech(11103).bonus1BaseValue / 100, d.bonus.duration += a[11103] * Datafinder.getTech(11103).bonus2BaseValue / 100) : 2 == s.lifeform ? (d.bonus.price += a[12103] * Datafinder.getTech(12103).bonus1BaseValue / 100, d.bonus.duration += a[12103] * Datafinder.getTech(12103).bonus2BaseValue / 100) : 3 == s.lifeform ? (d.bonus.price += a[13103] * Datafinder.getTech(13103).bonus1BaseValue / 100, d.bonus.duration += a[13103] * Datafinder.getTech(13103).bonus2BaseValue / 100) : 4 == s.lifeform && (d.bonus.price += a[14103] * Datafinder.getTech(14103).bonus1BaseValue / 100, d.bonus.duration += a[14103] * Datafinder.getTech(14103).bonus2BaseValue / 100), d.bonus.price += (this.ogl.db.lfBonuses?.LfResearch?.cost || 0) / 100, d.bonus.duration += (this.ogl.db.lfBonuses?.LfResearch?.duration || 0) / 100), 2 != s.lifeform || 1 != d.id && 2 != d.id && 3 != d.id && 4 != d.id && 12 != d.id && 12101 != d.id && 12102 != d.id || (d.bonus.price += a[12111] * Datafinder.getTech(12111).bonus1BaseValue / 100), (d.isBaseResearch || d.isBaseDef || d.isBaseShip) && (d.bonus.price += (this.ogl.db.lfBonuses?.[d.id]?.cost || 0) / 100, d.bonus.duration += (this.ogl.db.lfBonuses?.[d.id]?.duration || 0) / 100), d.target = {}, d.isBaseBuilding || d.isBaseResearch) {
      const n = Math.floor(d.base.metal * Math.pow(d.factor.price, t - 1)),
        o = Math.floor(d.base.crystal * Math.pow(d.factor.price, t - 1)),
        i = Math.floor(d.base.deut * Math.pow(d.factor.price, t - 1));
      d.target.metal = Math.floor(n * (1 - d.bonus.price)), d.target.crystal = Math.floor(o * (1 - d.bonus.price)), d.target.deut = Math.floor(i * (1 - d.bonus.price)), d.target.energy = Math.floor(d.base.energy * Math.pow(d.factor.energy, t - 1)), 1 != d.id && 2 != d.id || (d.target.conso = Math.ceil(10 * t * Math.pow(1.1, t)) - Math.ceil(10 * (t - 1) * Math.pow(1.1, t - 1))), 3 == d.id && (d.target.conso = Math.ceil(20 * t * Math.pow(1.1, t)) - Math.ceil(20 * (t - 1) * Math.pow(1.1, t - 1))), 4 == d.id && (d.target.prodEnergy = Math.floor(20 * t * Math.pow(1.1, t)) - Math.floor(20 * (t - 1) * Math.pow(1.1, t - 1))), 12 == d.id && (d.target.prodEnergy = Math.floor(30 * t * Math.pow(1.05 + .01 * (a[113] || 0), t)) - Math.floor(30 * (t - 1) * Math.pow(1.05 + .01 * (a[113] || 0), t - 1))), d.isBaseBuilding ? d.target.duration = (n + o) / (2500 * Math.max(41 == e || 42 == e || 43 == e ? 1 : 4 - t / 2, 1) * (1 + (a[14] || 0)) * Math.pow(2, a[15] || 0)) * 3600 * 1e3 : d.target.duration = (n + o) / (1e3 * (1 + (a[31] || 0) + r)) * 3600 * 1e3
    }
    else if (d.isLfBuilding || d.isLfResearch) d.target.metal = Math.floor(Math.floor(d.base.metal * Math.pow(d.factor.price, t - 1) * t) * (1 - d.bonus.price)), d.target.crystal = Math.floor(Math.floor(d.base.crystal * Math.pow(d.factor.price, t - 1) * t) * (1 - d.bonus.price)), d.target.deut = Math.floor(Math.floor(d.base.deut * Math.pow(d.factor.price, t - 1) * t) * (1 - d.bonus.price)), d.target.energy = Math.floor(Math.floor(t * d.base.energy * Math.pow(d.factor.energy, t) * (1 - d.bonus.price))), d.target.population = Math.floor(Math.floor(d.base.population * Math.pow(d.factor.population, t - 1) * (1 - d.bonus.price))), d.target.conso = t < 2 ? Math.floor(t * d.base.energy) : Math.floor(Math.floor(t * d.base.energy * Math.pow(d.factor.energy, t) - (t - 1) * d.base.energy * Math.pow(d.factor.energy, t - 1))), d.isLfBuilding ? d.target.duration = Math.floor(t * d.base.duration * 1e3 * (1 / ((1 + (a[14] || 0)) * Math.pow(2, a[15] || 0))) * Math.pow(d.factor.duration, t)) : d.target.duration = Math.floor(t * d.base.duration * 1e3 * Math.pow(d.factor.duration, t));
    else if (d.isBaseShip || d.isBaseDef) {
      const e = t || 1;
      d.target.metal = d.base.metal * e, d.target.crystal = d.base.crystal * e, d.target.deut = d.base.deut * e, d.target.duration = (d.base.metal + d.base.crystal) / 5e3 * (2 / (1 + a[21] || 0)) * Math.pow(.5, a[15] || 0) * 3600 * 1e3, 212 == d.id && (d.target.prodEnergy = Math.floor(((a.temperature + 40 + a.temperature) / 2 + 160) / 6) * e)
    }
    if (this.ogl.db.options.debugMode) {
      const e = JSON.stringify(d);
      console.log(e)
    }
    d.target.prodEnergy = Math.floor(d.target.prodEnergy * (1 + d.bonus.prodEnergy + d.bonus.engineer)) || 0, d.target.conso = -Math.ceil(d.target.conso * (1 - d.bonus.conso)) || 0, d.target.duration = d.target.duration / (this.ogl.server.economySpeed * (d.isBaseResearch ? this.ogl.db.serverData.researchSpeed : 1)) * (1 - d.bonus.eventDuration) * (1 - d.bonus.classDuration) * (1 - d.bonus.technocrat) * (1 - Math.min(d.bonus.duration, .99)), d.target.duration = Math.max(d.target.duration, 1e3), (d.isBaseShip || d.isBaseDef) && (d.target.duration = 1e3 * Math.floor(d.target.duration / 1e3), d.target.duration = Math.max(d.target.duration, 1e3) * (t || 1));
    let c = d.target.duration / 1e3,
      p = Math.floor(c / 604800),
      g = Math.floor(c % 604800 / 86400),
      u = Math.floor(c % 86400 / 3600),
      m = Math.floor(c % 3600 / 60),
      h = Math.floor(c % 60),
      f = 0;
    return d.target.timeresult = "", p > 0 && f < 3 && (d.target.timeresult += `${p}${LocalizationStrings.timeunits.short.week} `, f++), g > 0 && f < 3 && (d.target.timeresult += `${g}${LocalizationStrings.timeunits.short.day} `, f++), u > 0 && f < 3 && (d.target.timeresult += `${u}${LocalizationStrings.timeunits.short.hour} `, f++), m > 0 && f < 3 && (d.target.timeresult += `${m}${LocalizationStrings.timeunits.short.minute} `, f++), h > 0 && f < 3 && (d.target.timeresult += `${h}${LocalizationStrings.timeunits.short.second}`, f++), d
  }
  checkProductionBoxes() {
    this.ogl.currentPlanet.obj.upgrades = this.ogl.currentPlanet.obj.upgrades || {}, Object.entries(this.ogl._time.productionBoxes).forEach((e => {
      if (document.querySelector(`#${e[1]} time`)) {
        const t = "productionboxbuildingcomponent" == e[1] ? "baseBuilding" : "productionboxresearchcomponent" == e[1] ? "baseResearch" : "productionboxshipyardcomponent" == e[1] ? "ship" : "productionboxlfbuildingcomponent" == e[1] ? "lfBuilding" : "productionboxlfresearchcomponent" == e[1] ? "lfResearch" : "productionboxextendedshipyardcomponent" == e[1] ? "mechaShip" : "unknown",
          n = document.querySelector(`#${[e[1]]} .first .queuePic`).parentNode.getAttribute("onclick")?.match(/[([0-9:]+]/)?.[0]?.slice(1, -1);
        let o = 0;
        const a = document.querySelectorAll(`#${[e[1]]} .queuePic`).length;
        document.querySelectorAll(`#${[e[1]]} .queuePic`).forEach(((i, r) => {
          const l = new URLSearchParams(i.parentNode.href).get("openTech") || i.parentNode?.getAttribute("onclick")?.match(/([0-9]+)/)[0];
          if (!l) return;
          const s = i.closest(".first")?.parentNode?.querySelector(".level")?.innerText.match(/\d+/)[0] || i.closest(".first")?.querySelector(".shipSumCount")?.innerText || i.parentNode.innerText,
            d = this.getTechData(l, s, this.ogl.currentPlanet.obj.id),
            c = 0 == r ? 1e3 * parseInt(document.querySelector(`#${[e[1]]} time.countdown`).getAttribute("data-end")) || serverTime.getTime() + d.target.duration : d.target.duration;
          if (o += c, 0 == r) {
            const a = document.querySelector(`#${[e[1]]} .content`),
              i = (this.ogl.db.options.useClientTime ? this.ogl._time.clientTimeZoneOffset - this.ogl._time.serverTimeZoneOffset : 0) + o;
            a.classList.add(`ogl_${t}`);
            let r = `<span>${new Date(i).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}</span>\n                        ${new Date(i).toLocaleTimeString("de-DE")}`;
            if (Util.addDom("time", {
                class: "ogl_timeBox",
                prepend: a.querySelector(".build-faster").parentNode,
                child: r
              }), "baseResearch" == t) {
              const e = {};
              if (e.name = this.ogl.db.serverData[l] || l, e.lvl = s, e.end = o, e.type = t, n && n != this.ogl.currentPlanet.obj.coords) {
                const o = Object.values(this.ogl.db.myPlanets).find((e => e.coords == n && "planet" == e.type)).id;
                this.ogl.db.myPlanets[o].upgrades = this.ogl.db.myPlanets[o].upgrades || [], this.ogl.db.myPlanets[o].upgrades[t] = this.ogl.db.myPlanets[o].upgrades[t] || [], this.ogl.db.myPlanets[o].upgrades[t][0] = e
              }
              else n == this.ogl.currentPlanet.obj.coords && "moon" != this.ogl.currentPlanet.obj.type && (this.ogl.currentPlanet.obj.upgrades[t][0] = e)
            }
          }
          else if (r == a - 1) {
            const n = document.querySelector(`#${[e[1]]} .content`),
              a = (this.ogl.db.options.useClientTime ? this.ogl._time.clientTimeZoneOffset - this.ogl._time.serverTimeZoneOffset : 0) + o;
            n.classList.add(`ogl_${t}`);
            let i = `<span>${new Date(a).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}</span>\n                        ${new Date(a).toLocaleTimeString("de-DE")}`;
            Util.addDom("time", {
              class: "ogl_timeBox",
              parent: n,
              child: i
            })
          }
        }))
      }
    }))
  }
}
class StatsManager extends Manager {
  load() {
    this.ogl.db.stats = this.ogl.db.stats || {}, this.types = ["raid", "expe", "discovery", "debris", "debris16", "blackhole"], this.data = {}, this.miniStats()
  }
  getKey(e) {
    const t = new Date(e);
    return `${t.getFullYear()}-${t.getMonth()+1}-${t.getDate()}`
  }
  getKeyDay(e, t) {
    const n = new Date(e);
    return this.getKey(new Date(n.getFullYear(), n.getMonth(), t, 0, 0, 0))
  }
  getKeysPrevMonth(e) {
    const t = new Date(e);
    return [this.getKey(new Date(t.getFullYear(), t.getMonth() - 1, 1, 0, 0, 0)), this.getKey(new Date(t.getFullYear(), t.getMonth(), 0, 23, 59, 59))]
  }
  getKeysNextMonth(e) {
    const t = new Date(e);
    return [this.getKey(new Date(t.getFullYear(), t.getMonth() + 1, 1, 0, 0, 0)), this.getKey(new Date(t.getFullYear(), t.getMonth() + 2, 0, 23, 59, 59))]
  }
  getDayStats(e) {
    const t = this.getKey(e);
    return this.ogl.db.stats[t] = this.ogl.db.stats[t] || {}, this.ogl.db.stats[t]
  }
  getData(e) {
    const t = this.ogl.db.stats[e],
      n = ["metal", "crystal", "deut", "dm", "artefact", "blackhole", 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 217, 218, 219, 401, 402, 403, 404, 405, 406, 407, 408],
      o = {
        total: {
          metal: 0,
          crystal: 0,
          deut: 0,
          dm: 0,
          artefact: 0,
          msu: 0
        },
        expe: {},
        raid: {}
      };
    this.types.forEach((e => {
      o[e] = o[e] || {};
      for (let [a, i] of Object.entries(t?.[e]?.gain || {}))
        if (n.findIndex((e => e == a || e == -a)) > -1)
          if (isNaN(a)) o.total[a] = (o.total[a] || 0) + i, "raid" != e && "debris" != e || (o.raid[a] = (o.raid[a] || 0) + i), "expe" != e && "debris16" != e && "blackhole" != e || (o.expe[a] = (o.expe[a] || 0) + i);
          else {
            const t = Datafinder.getTech(Math.abs(a)),
              n = "expe" == e ? this.ogl.db.options.expeditionShipRatio / 100 : 1,
              r = parseInt(a) > 0 ? 1 : -1;
            r < 0 && ("expe" == e || "blackhole" == e) && this.ogl.db.options.ignoreExpeShipsLoss || (o.total.metal = (o.total.metal || 0) + (t.metal || 0) * i * n * r, o.total.crystal = (o.total.crystal || 0) + (t.crystal || 0) * i * n * r, o.total.deut = (o.total.deut || 0) + (t.deut || 0) * i * n * r, "expe" != e && "blackhole" != e || (o.expeShip = o.expeShip || {}, o.expeShip[Math.abs(a)] = (o.expeShip[Math.abs(a)] || 0) + i * r), "raid" != e && "debris" != e || (o.raid.metal = (o.raid.metal || 0) + (t.metal || 0) * i * n * r, o.raid.crystal = (o.raid.crystal || 0) + (t.crystal || 0) * i * n * r, o.raid.deut = (o.raid.deut || 0) + (t.deut || 0) * i * n * r), "expe" != e && "debris16" != e && "blackhole" != e || (o.expe.metal = (o.expe.metal || 0) + (t.metal || 0) * i * n * r, o.expe.crystal = (o.expe.crystal || 0) + (t.crystal || 0) * i * n * r, o.expe.deut = (o.expe.deut || 0) + (t.deut || 0) * i * n * r))
          } for (let [n, a] of Object.entries(t?.[e]?.occurence || {})) o[e + "Occurence"] = o[e + "Occurence"] || {}, o[e + "Occurence"][n] = (o[e + "Occurence"][n] || 0) + a;
      o[e].count = (o[e].count || 0) + (t?.[e]?.count || 0)
    })), o.conso = (o.conso || 0) + (t?.conso || 0), this.ogl.db.options.ignoreConsumption || (o.total.deut -= o.conso);
    const a = this.ogl.db.options.msu;
    return o.total.msu = Util.getMSU(o.total.metal, o.total.crystal, o.total.deut, a), o.expe.msu = Util.getMSU(o.expe.metal, o.expe.crystal, o.expe.deut, a), o.raid.msu = Util.getMSU(o.raid.metal, o.raid.crystal, o.raid.deut, a), o
  }
  miniStats() {
    const e = serverTime,
      t = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 0, 0, 0);
    new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59), this.getData(this.getKey(t.getTime()));
    this.miniDiv || (this.miniDiv = Util.addDom("div", {
      class: "ogl_miniStats ogl_ogameDiv",
      parent: document.querySelector("#links"),
      onclick: e => {}
    })), this.miniDiv.innerHTML = '<p class="warning" style="line-height:1.6;">OGLight stats are disabled until next update :(</p>'
  }
  buildStats(e, t) {
    const n = serverTime;
    e = e || this.getKey(new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0).getTime()), t = t || this.getKey(new Date(n.getFullYear(), n.getMonth(), n.getDate(), 23, 59, 59).getTime());
    const o = new Date(t),
      a = new Date(o.getFullYear(), o.getMonth() + 1, 0, 23, 59, 59),
      i = Util.addDom("div", {
        class: "ogl_stats"
      }),
      r = Util.addDom("div", {
        parent: i,
        class: "ogl_statsMonth"
      });
    let l, s;
    Util.addDom("div", {
      parent: r,
      class: "ogl_button",
      child: LocalizationStrings?.timeunits?.short?.day || "D",
      onclick: () => {
        Util.runAsync((() => this.buildStats())).then((e => this.ogl._popup.open(e, !0)))
      }
    }), Util.addDom("div", {
      parent: r,
      class: "ogl_button",
      child: LocalizationStrings?.timeunits?.short?.week || "W",
      onclick: () => {
        const e = this.getKey(new Date(n.getFullYear(), n.getMonth(), n.getDate() - 6, 0, 0, 0).getTime()),
          t = this.getKey(new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0).getTime());
        Util.runAsync((() => this.buildStats(e, t))).then((e => this.ogl._popup.open(e, !0)))
      }
    }), Util.addDom("div", {
      parent: r,
      class: "ogl_button",
      child: LocalizationStrings?.timeunits?.short?.month || "M",
      onclick: () => {
        const e = this.getKey(new Date(n.getFullYear(), n.getMonth(), 1, 0, 0, 0).getTime()),
          t = this.getKey(new Date(n.getFullYear(), n.getMonth() + 1, 0, 23, 59, 59).getTime());
        Util.runAsync((() => this.buildStats(e, t))).then((e => this.ogl._popup.open(e, !0)))
      }
    }), Util.addDom("div", {
      parent: r,
      class: "ogl_button",
      child: "All",
      onclick: () => {
        const e = new Date(this.ogl.db.initialTime),
          t = this.getKey(new Date(e.getFullYear(), e.getMonth(), e.getDate(), 0, 0, 0).getTime()),
          o = this.getKey(new Date(n.getFullYear(), n.getMonth() + 1, 0, 23, 59, 59).getTime());
        Util.runAsync((() => this.buildStats(t, o))).then((e => this.ogl._popup.open(e, !0)))
      }
    }), Util.addDom("div", {
      parent: r,
      class: "ogl_separator"
    }), Util.addDom("div", {
      parent: r,
      class: "ogl_button material-icons",
      child: "arrow-left-thick",
      onclick: () => {
        const e = this.getKeysPrevMonth(t);
        Util.runAsync((() => this.buildStats(e[0], e[1]))).then((e => this.ogl._popup.open(e, !0)))
      }
    }), Util.addDom("div", {
      parent: r,
      child: a.toLocaleString("default", {
        month: "short",
        year: "numeric"
      })
    }), Util.addDom("div", {
      parent: r,
      class: "ogl_button material-icons",
      child: "arrow-right-thick",
      onclick: () => {
        const e = this.getKeysNextMonth(t);
        Util.runAsync((() => this.buildStats(e[0], e[1]))).then((e => this.ogl._popup.open(e, !0)))
      }
    });
    const d = () => {
        s && u && (u.querySelectorAll("[data-day]").forEach((e => e.classList.remove("ogl_selected"))), s.forEach((e => e.classList.add("ogl_selected"))))
      },
      c = [],
      p = [],
      g = [],
      u = Util.addDom("div", {
        parent: i,
        class: "ogl_dateBar",
        onmouseup: () => {
          this.isMoving = !1;
          const e = u.querySelectorAll("[data-day].ogl_selected");
          if (!e || e.length < 2) return d(), void s.forEach((e => e.classList.add("ogl_selected")));
          const n = this.getKeyDay(t, e[0].getAttribute("data-day")),
            o = this.getKeyDay(t, e[e.length - 1].getAttribute("data-day"));
          Util.runAsync((() => this.buildStats(n, o))).then((e => this.ogl._popup.open(e, !0)))
        },
        onmousedown: e => {
          s = u.querySelectorAll("[data-day].ogl_selected"), this.isMoving = !0, u.querySelectorAll("[data-day]").forEach((e => e.classList.remove("ogl_selected"))), e.target.getAttribute("data-day") && (l = parseInt(e.target.getAttribute("data-day"))), e.target.parentNode.getAttribute("data-day") && (l = parseInt(e.target.parentNode.getAttribute("data-day")))
        },
        onmouseleave: () => {
          this.isMoving = !1, l = !1, d()
        }
      }),
      m = Util.addDom("div", {
        parent: i,
        class: "ogl_statsDetails"
      });
    let h = 0,
      f = 0;
    for (let n = 1; n <= a.getDate(); n++) {
      const o = this.getKeyDay(t, n),
        a = this.getData(o);
      a.total?.msu < f && (f = a.total?.msu || 0), a.total?.msu > h && (h = a.total?.msu || 0), c.push(a);
      const i = Util.addDom("div", {
        class: "ogl_item",
        parent: u,
        "data-day": n,
        "data-value": a.total?.msu || 0,
        onclick: () => {
          g.forEach((e => e.classList.remove("ogl_selected"))), i.classList.add("ogl_selected"), this.displayDetails([a], m, o, o), s = u.querySelectorAll("[data-day].ogl_selected")
        },
        onmouseenter: () => {
          if (this.isMoving && (l || (l = parseInt(i.getAttribute("data-day"))), this.isMoving)) {
            const e = parseInt(i.getAttribute("data-day"));
            u.querySelectorAll("[data-day]").forEach((t => {
              const n = parseInt(t.getAttribute("data-day"));
              var o, a, i;
              a = e, i = l, (o = n) >= Math.min(a, i) && o <= Math.max(a, i) ? t.classList.add("ogl_selected") : t.classList.remove("ogl_selected")
            }))
          }
        }
      });
      g.push(i), Date.parse(o) >= Date.parse(e) && Date.parse(o) <= Date.parse(t) && i.classList.add("ogl_selected")
    }
    const b = new Date(e).getTime(),
      y = new Date(t).getTime();
    if (Object.keys(this.ogl.db.stats).filter((e => {
        const t = new Date(e).getTime();
        t >= b && t <= y && p.push(this.getData(e))
      })), g.forEach((e => {
        const t = parseInt(e.getAttribute("data-value"));
        let n = Math.ceil(Math.abs(t) / (Math.max(Math.abs(h), Math.abs(f)) / 100));
        n = n > 0 ? Math.max(n, 5) : 0;
        const o = t > 0 ? "#35cf95" : "#e14848";
        Util.addDom("div", {
          parent: e
        }).style.background = `linear-gradient(to top, ${o} ${n}%, #0e1116 ${n}%)`, 0 != t && e.classList.add("ogl_active")
      })), p.length < 1) {
      const e = {};
      this.types.forEach((t => e[t] = {})), e.total = {}, p.push(e)
    }
    return this.displayDetails(p, m, e, t), i
  }
  displayDetails(e, t, n, o) {
    t.innerText = "";
    const a = new Date(n).toLocaleString("default", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      i = new Date(o).toLocaleString("default", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      r = n == o ? a : `${a} -> ${i}`;
    Util.addDom("h3", {
      child: r,
      parent: t
    });
    const l = e.reduce(((e, t) => (Object.entries(t).forEach((([t, n]) => {
      "object" == typeof n ? (e[t] = e[t] || {}, Object.entries(n).forEach((([n, o]) => e[t][n] = (e[t][n] || 0) + o))) : e[t] = (e[t] || 0) + n
    })), e)), {});
    t.appendChild(this.buildPie(l.expeOccurence));
    const s = Util.addDom("div", {
      parent: t,
      class: "ogl_shipTable"
    });
    [202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 213, 214, 215, 218, 219].forEach((e => {
      Util.addDom("div", {
        class: `ogl_icon ogl_${e}`,
        parent: s,
        child: Util.formatToUnits(l?.expeShip?.[e] || "-", !1, !0)
      })
    }));
    const d = Util.addDom("div", {
        parent: t,
        class: "ogl_sumTable"
      }),
      c = Util.addDom("div", {
        parent: d
      });
    ["", "send", "metal", "crystal", "deut", "msu", "dm", "artefact"].forEach((e => {
      "send" == e ? Util.addDom("div", {
        class: "ogl_textCenter ogl_icon material-icons",
        child: "send",
        parent: c
      }) : Util.addDom("div", {
        class: `ogl_icon ogl_${e}`,
        parent: c
      })
    })), ["expe", "raid", "conso", "u", "total"].forEach((e => {
      const t = "u" == e ? "average" : e,
        n = Util.addDom("div", {
          parent: d,
          child: `<div>${t}</div>`
        }),
        o = {};
      o.expe = l.expe.count + l.debris16.count, o.raid = l.raid.count + l.debris.count, o.total = l.debris.count + l.debris16.count + l.expe.count + l.raid.count + l.discovery.count;
      const a = Util.addDom("div", {
        parent: n,
        child: Util.formatToUnits(o[e] || "-", !1, !0)
      });
      if (o[e]) {
        const t = "expe" == e ? `<div>Expedition: ${l.expe.count}</div><div>Debris p16: ${l.debris16.count}</div>` : "raid" == e ? `<div>Raid: ${l.raid.count}</div><div>Debris: ${l.debris.count}</div>` : "total" == e ? `<div>Expedition: ${l.expe.count}</div>\n                        <div>Debris p16: <span>${l.debris16.count}</span></div>\n                        <div>Raid: <span>${l.raid.count}</span></div>\n                        <div>Debris: <span>${l.debris.count}</span></div>\n                        <div>Discovery: <span>${l.discovery.count}</span></div>` : "";
        a.classList.add("tooltip"), a.setAttribute("title", t)
      }
      const i = l.debris.count + l.debris16.count + l.expe.count + l.raid.count,
        r = l.expe.count,
        s = l.discovery.count;
      ["metal", "crystal", "deut", "msu", "dm", "artefact"].forEach((t => {
        if ("u" == e) {
          let e = 0;
          "metal" == t || "crystal" == t || "deut" == t || "msu" == t ? e = l.total[t] / i : "dm" == t ? e = l.total[t] / r : "artefact" == t && (e = l.total[t] / s), Util.addDom("div", {
            class: `ogl_${t}`,
            parent: n,
            child: Util.formatToUnits(Math.floor(isFinite(e) ? e : 0), !1, !0)
          })
        }
        else "conso" == e && "deut" == t ? Util.addDom("div", {
          class: `ogl_${t}`,
          parent: n,
          child: Util.formatToUnits(-l.conso || 0, !1, !0)
        }) : "conso" == e && "msu" == t ? Util.addDom("div", {
          class: `ogl_${t}`,
          parent: n,
          child: Util.formatToUnits(Util.getMSU(0, 0, -l.conso, this.ogl.db.options.msu), !1, !0)
        }) : Util.addDom("div", {
          class: `ogl_${t}`,
          parent: n,
          child: Util.formatToUnits(l[e]?.[t] || 0, !1, !0)
        })
      }))
    }))
  }
  buildPie(e) {
    const t = Util.addDom("div", {
      class: "ogl_pie"
    });
    if (!e || Object.keys(e || {}).length < 1) return t.innerHTML = '<div class="ogl_noExpe"><span class="material-icons">compass</span>No expedition data</div>', t;
    let n = 1.5 * Math.PI,
      o = {
        nothing: "#ddd",
        resource: "#86edfd",
        darkmatter: "#b58cdb",
        ship: "#1dd1a1",
        battle: "#ffd60b",
        item: "#bf6c4d",
        blackhole: "#818181",
        duration: "#df5252",
        trader: "#ff7d30"
      };
    const a = {};
    a.resource = e.resource || 0, a.darkmatter = e.darkmatter || 0, a.ship = e.ship || 0, a.nothing = e.nothing || 0, a.blackhole = e.blackhole || 0, a.trader = e.trader || 0, a.item = e.item || 0, a.battle = (e.pirate || 0) + (e.alien || 0), a.duration = (e.early || 0) + (e.late || 0);
    const i = 256,
      r = 128,
      l = [],
      s = e => {
        c.clearRect(0, 0, i, i), l.forEach((t => {
          c.beginPath(), c.arc(r, r, 128, t.startAngle, t.endAngle), c.lineTo(r, r), c.closePath(), c.fillStyle = t.title == e?.title ? "white" : t.color, c.fill()
        })), c.fillStyle = "rgba(0,0,0,.5)", c.beginPath(), c.arc(128, 128, i / 2.7, 0, 2 * Math.PI, !1), c.fill(), c.fillStyle = "#1b212a", c.beginPath(), c.arc(128, 128, i / 3, 0, 2 * Math.PI, !1), c.fill(), t.setAttribute("data-pie", `${e?this.ogl._lang.find(e.title)+"\r\n":""}${e?e.percent+"%":u+"\r\nExpeditions"}`), p.querySelectorAll(".ogl_active").forEach((e => e.classList.remove("ogl_active"))), e && p.querySelector(`[data-entry="${e.title}"]`).classList.add("ogl_active")
      },
      d = Util.addDom("canvas", {
        parent: t,
        width: i,
        height: i,
        onmouseout: () => {
          s(), d.classList.remove("ogl_interactive")
        }
      }),
      c = d.getContext("2d", {
        willReadFrequently: !0
      }),
      p = Util.addDom("div", {
        parent: t,
        class: "ogl_pieLegendContainer",
        onmouseleave: () => s()
      }),
      g = Object.entries(a || {}),
      u = Object.values(e || {}).reduce(((e, t) => e + Math.max(0, t)), 0);
    t.setAttribute("data-pie", u);
    for (let [e, t] of g.sort(((e, t) => t[1] - e[1])))
      if (t > 0) {
        const a = {};
        a.title = e, a.value = t, a.percent = (t / u * 100).toFixed(2), a.startAngle = n, a.angle = t / u * 2 * Math.PI, a.endAngle = n + a.angle, a.color = o[e], l.push(a), n = a.endAngle, Util.addDom("div", {
          class: "ogl_pieLegend",
          "data-resultType": a.title,
          "data-entry": a.title,
          parent: p,
          child: `<div>${this.ogl._lang.find(e)}</div><span>${Util.formatToUnits(t)}</span><i>${a.percent}%</i>`
        })
      } return s(), p.querySelectorAll(".ogl_pieLegend").forEach((e => {
      e.addEventListener("mouseenter", (() => {
        const t = l.find((t => t.title == e.getAttribute("data-entry")));
        s(t)
      }))
    })), t
  }
  addBlackHoleButton() {
    Util.addDom("button", {
      class: "ogl_button material-icons tooltip ogl_blackHoleButton",
      title: this.ogl._lang.find("reportBlackhole"),
      parent: this.miniDiv,
      child: "skull",
      onclick: () => {
        this.ogl._popup.open(Util.addDom("div", {
          child: '<div class="ogl_loading"></div>'
        }));
        const e = Util.addDom("div", {
          class: "ogl_keeper ogl_blackhole"
        });
        Util.addDom("h2", {
          child: this.ogl._lang.find("reportBlackhole"),
          parent: e
        });
        const t = Util.addDom("div", {
          class: "ogl_shipLimiter",
          parent: e
        });
        [202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 213, 214, 215, 218, 219].forEach((e => {
          const n = Util.addDom("div", {
            class: "ogl_icon ogl_" + e,
            parent: t
          });
          Util.addDom("input", {
            class: "ogl_inputCheck",
            "data-ship": e,
            parent: n
          })
        })), Util.addDom("div", {
          class: "ogl_button",
          child: "Add",
          parent: e,
          onclick: () => {
            if (confirm(this.ogl._lang.find("reportBlackholeLong"))) {
              const t = {};
              t.date = new Date, t.messageType = "blackhole", t.gain = {}, e.querySelectorAll("input").forEach((e => {
                const n = parseInt(e.getAttribute("data-ship")),
                  o = parseInt(e.value.replace(/\D/g, "")) || 0;
                isNaN(n) || isNaN(o) || (t.gain[-n] = o)
              })), this.ogl._message.updateStats(t), this.ogl._popup.close()
            }
          }
        }), this.ogl._popup.open(e)
      }
    })
  }
}
class EmpireManager extends Manager {
  load() {
    if (this.getLFBonuses(), this.getAllianceClass(), "empire" != this.ogl.page) return;
    unsafeWindow.jumpGateLink = `?page=ajax&component=jumpgate&overlay=1&ajax=1`, unsafeWindow.jumpGateLoca = {
      LOCA_STATION_JUMPGATE_HEADLINE: "Jumpgate"
    };
    let e, t, n = !1;
    Util.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0
    }, (o => {
      if (!n && o.target.classList.contains("box-end") && o.target.closest(".summary") && o.target.closest(".groupresources")) "none" == document.querySelector("#loading").style.display && (n = !0, this.update(document.querySelector("#mainContent script").innerText, new URLSearchParams(window.location.search).get("planetType"), !0), document.querySelectorAll(".planet").forEach((n => {
        const o = this.ogl.db.myPlanets[n.id.replace("planet", "")];
        o && Util.addDom("div", {
          class: "material-icons ogl_empireJumpgate",
          child: "jump_to_element",
          parent: n.querySelectorAll(".row")[1],
          onclick: a => {
            a.preventDefault(), e = o, t = n.querySelector(".planetname").getAttribute("title") || n.querySelector(".planetname").innerText, document.querySelector(".ui-dialog")?.remove(), setTimeout((() => openJumpgate()), 5)
          }
        })
      })));
      else if (o.target.classList.contains("ui-dialog") && document.querySelector("#jumpgate")) {
        if (document.querySelector("#jumpgateNotReady")) return;
        if (document.querySelector(".currentlySelected")) {
          const n = document.querySelector(".currentlySelected a");
          n.setAttribute("data-value", e.planetID || e.moonID), n.innerText = `${t} [${e.coords}]`
        }
        else document.querySelector("#selecttarget select").value = this.ogl.db.myPlanets[e.planetID].moonID;
        let n = [e.metal, e.crystal, e.deut, e.food];
        this.ogl.db.fleetLimiter.resourceActive && (n[0] = Math.max(0, n[0] - (this.ogl.db.fleetLimiter.data.metal || 0)), n[1] = Math.max(0, n[1] - (this.ogl.db.fleetLimiter.data.crystal || 0)), n[2] = Math.max(0, n[2] - (this.ogl.db.fleetLimiter.data.deut || 0)), n[3] = Math.max(0, n[3] - (this.ogl.db.fleetLimiter.data.food || 0)));
        const o = n[0] + n[1] + n[2] + n[3];
        document.querySelector(`[name="ship_${this.ogl.db.options.defaultShip}"]`).value = this.ogl._fleet.shipsForResources(this.ogl.db.options.defaultShip, Math.max(0, o))
      }
    }))
  }
  update(e, t, n) {
    this.ogl.db.lastEmpireUpdate = Date.now();
    let o = ["id", "metal", "crystal", "deuterium", "energy", "food", "population", "fieldUsed", "fieldMax", "planetID", "moonID"];
    (e = n ? JSON.parse(e.match(/{(.*)}/g)[1]) : e).planets.forEach((e => {
      this.ogl.db.myPlanets[e.id] = this.ogl.db.myPlanets[e.id] || {}, this.ogl.db.myPlanets[e.id].type = 0 === t ? "planet" : "moon", Object.entries(e).forEach((t => {
        t[0].indexOf("html") >= 0 || ("temperature" === t[0] ? this.ogl.db.myPlanets[e.id][t[0]] = parseInt(t[1].match(/[-|0-9]+/g, "")[0]) : Number(t[0]) || t[0].indexOf("Storage") >= 0 || o.includes(t[0]) ? this.ogl.db.myPlanets[e.id][t[0].replace("deuterium", "deut")] = parseInt(t[1]) : "coordinates" === t[0] ? this.ogl.db.myPlanets[e.id].coords = t[1].slice(1, -1) : "production" === t[0] && (this.ogl.db.myPlanets[e.id].prodMetal = t[1].hourly[0] / 3600, this.ogl.db.myPlanets[e.id].prodCrystal = t[1].hourly[1] / 3600, this.ogl.db.myPlanets[e.id].prodDeut = t[1].hourly[2] / 3600))
      }))
    })), this.ogl.currentPlanet && (this.ogl.currentPlanet.obj = this.ogl.db.myPlanets[document.querySelector('head meta[name="ogame-planet-id"]')?.getAttribute("content")]), document.querySelectorAll(".planetlink, .moonlink").forEach((e => {
      const t = new URLSearchParams(e.getAttribute("href")).get("cp").split("#")[0];
      ["metal", "crystal", "deut"].forEach((n => {
        const o = this.ogl.db.myPlanets[t]?.[n] || 0,
          a = this.ogl.db.myPlanets[t]?.[n + "Storage"] || 0,
          i = e.querySelector(".ogl_available .ogl_" + n);
        i ? (i.innerHTML = Util.formatToUnits(o, 1), o >= a && e.classList.contains("planetlink") ? i.classList.add("ogl_danger") : o >= .9 * a && e.classList.contains("planetlink") ? i.classList.add("ogl_warning") : (i.classList.remove("ogl_warning"), i.classList.remove("ogl_danger"))) : e.querySelector(".ogl_available .ogl_" + n) && (e.querySelector(".ogl_available .ogl_" + n).innerHTML = Util.formatToUnits(o, 1))
      }))
    })), this.ogl._ui && Util.runAsync((() => this.ogl._ui.displayResourcesRecap()))
  }
  getLFBonuses(e) {
    const t = e || document;
    (e || "lfbonuses" == this.ogl.page) && (this.ogl.db.lfBonuses = {}, t.querySelectorAll("bonus-item-content-holder > [data-toggable]").forEach((e => {
      const t = e.getAttribute("data-toggable").replace(/subcategory|Ships|Defenses|CostAndTime/g, ""),
        n = new RegExp(`[0-9|-]+(${LocalizationStrings.decimalPoint}[0-9]+)?`, "g"),
        o = t > 100 && t <= 199,
        a = t > 200 && t <= 299,
        i = t > 400 && t <= 499,
        r = {},
        l = [];
      if (e.querySelectorAll("bonus-item").forEach((e => {
          const t = (e.innerText.match(n) || []).map((e => "-" == e ? 0 : parseFloat(e.replace(LocalizationStrings.decimalPoint, "."))));
          l.push(t)
        })), 0 == l.length) {
        let t = (e.innerText.match(n) || [])[0];
        t = t && "-" != t ? parseFloat(t.replace(LocalizationStrings.decimalPoint, ".")) : 0, r.bonus = t
      }
      a ? (r.armor = l[0][0], r.shield = l[1][0], r.weapon = l[2][0], r.speed = l[3][0], r.cargo = l[4][0], r.fuel = l[5][0]) : i ? (r.armor = l[0][0], r.shield = l[1][0], r.weapon = l[2][0]) : (o || "LfResearch" == t) && (r.cost = l[0][0], r.duration = l[1][0]), this.ogl.db.lfBonuses[t] = r
    }))), (e || "lfbonuses" == this.ogl.page || "lfsettings" == this.ogl.page) && (this.ogl.db.lfBonuses = this.ogl.db.lfBonuses || {}, t.querySelectorAll("lifeform-item, .lifeform-item").forEach((e => {
      const t = e.querySelector(".lifeform-item-icon").className.replace(/lifeform-item-icon| /g, ""),
        n = e.querySelector(".currentlevel").innerText.replace(/\D/g, "") / 10;
      this.ogl.db.lfBonuses[t] = {
        bonus: n
      }
    })))
  }
  getAllianceClass() {
    "alliance" == this.ogl.page && setTimeout((() => {
      const e = alliance.allianceContent[0].querySelector("#allyData .allianceclass.sprite");
      e ? Object.entries(allianceClassArr).forEach((t => {
        e.classList.contains(t[0]) && (this.ogl.db.allianceClass = t[1])
      })) : this.getAllianceClass()
    }), 1e3)
  }
}
class Util {
  static get simList() {
    return {
      battlesim: "https://battlesim.logserver.net/",
      obatsim: "https://obatsim.stevecohen.fr/",
      "simulator.ogame-tools": "https://simulator.ogame-tools.com/"
    }
  }
  static get converterList() {
    return {
      ogotcha: "https://ogotcha.universeview.be/",
      topraider: "https://topraider.eu/index.php",
      "ogame.tools": "https://battleconvertor.fr"
    }
  }
  static overWrite(e, t, n, o, a, i) {
    const r = t[e];
    let l = !1;
    t[e] = function (e, s) {
      n && "function" == typeof n && (l = n(a || e, i || s)), l || r.call(t, a || e, i || s), o && "function" == typeof o && !l && o(a || e, i || s)
    }
  }
  static drawLine(e, t, n, o) {
    if (unsafeWindow.fleetDispatcher && fleetDispatcher.realTarget && (fleetDispatcher.targetPlanet.galaxy != fleetDispatcher.realTarget.galaxy || fleetDispatcher.targetPlanet.system != fleetDispatcher.realTarget.system || fleetDispatcher.targetPlanet.position != fleetDispatcher.realTarget.position || fleetDispatcher.targetPlanet.type != fleetDispatcher.realTarget.type)) return;
    if (e.querySelector("line")?.remove(), !n || !o || n == o) return;
    n = n.querySelector(".planetPic, .icon-moon"), o = o.querySelector(".planetPic, .icon-moon");
    let a = Math.round(n.getBoundingClientRect().left + n.getBoundingClientRect().width / 2 - t.getBoundingClientRect().left) - 2,
      i = Math.round(n.getBoundingClientRect().top + n.getBoundingClientRect().height / 2 - t.getBoundingClientRect().top),
      r = Math.round(o.getBoundingClientRect().left + o.getBoundingClientRect().width / 2 - t.getBoundingClientRect().left) - 2,
      l = Math.round(o.getBoundingClientRect().top + o.getBoundingClientRect().height / 2 - t.getBoundingClientRect().top);
    t.appendChild(e);
    let s = document.createElementNS("http://www.w3.org/2000/svg", "line");
    e.appendChild(s), s.classList.add("ogl_line"), s.setAttribute("x1", a), s.setAttribute("y1", i), s.setAttribute("x2", r), s.setAttribute("y2", l), s.setAttribute("stroke-dasharray", "7 5")
  }
  static coordsToID(e) {
    return "string" == typeof e ? e.split(":").map((e => e.padStart(3, "0"))).join("") : e.map((e => e.padStart(3, "0"))).join("")
  }
  static removeFromArray(e, t) {
    e.splice(t, 1)
  }
  static formatNumber(e) {
    return (e || "0").toLocaleString("de-DE")
  }
  static formatToUnits(e, t, n) {
    if (e = ((e = Math.round(e || 0)) || 0).toString().replace(/[\,\. ]/g, ""), isNaN(e)) return e;
    let o = 0;
    o = 0 == (e = parseInt(e)) || 0 === t || e < 1e3 && e > -1e3 ? 0 : 1 === t || e < 1e6 && e > -1e6 ? 1 : 2;
    const a = Intl.NumberFormat("fr-FR", {
        notation: "compact",
        minimumFractionDigits: o,
        maximumFractionDigits: o
      }).format(e).match(/[a-zA-Z]+|[0-9,-]+/g),
      i = a[0].replace(/,/g, "."),
      r = a[1]?.replace("Md", "G").replace("Bn", "T") || "",
      l = Util.addDom("span", {
        class: "ogl_unit",
        child: `<span>${i}</span><span class="ogl_suffix">${r}</span>`
      });
    return e < 0 && n && l.classList.add("ogl_danger"), l.outerHTML
  }
  static formatFromUnits(e) {
    if (!e) return 0;
    let t = 3 * ((e = e.toLowerCase()).split(LocalizationStrings.thousandSeperator).length - 1);
    LocalizationStrings.thousandSeperator == LocalizationStrings.decimalPoint && (t = 0);
    let n = e.match(/\d+/g)[0].length;
    return e = e.indexOf(LocalizationStrings.unitMilliard.toLowerCase()) > -1 ? (e = (e = e.replace(LocalizationStrings.unitMilliard.toLowerCase(), "")).replace(/[\,\. ]/g, "")).padEnd(9 + t + n, "0") : e.indexOf(LocalizationStrings.unitMega.toLowerCase()) > -1 ? (e = (e = e.replace(LocalizationStrings.unitMega.toLowerCase(), "")).replace(/[\,\. ]/g, "")).padEnd(6 + t + n, "0") : e.indexOf(LocalizationStrings.unitKilo.toLowerCase()) > -1 ? (e = (e = e.replace(LocalizationStrings.unitKilo.toLowerCase(), "")).replace(/[\,\. ]/g, "")).padEnd(3 + t + n, "0") : e.replace(/[\,\. ]/g, ""), parseInt(e)
  }
  static formatInput(e, t, n) {
    setTimeout((() => {
      if ((!e.value || 0 == e.value) && e.classList.contains("ogl_placeholder")) return void(e.value = "");
      e.value = e.value.slice(0, e.selectionStart) + e.value.slice(e.selectionEnd);
      let o = e.value.length,
        a = 1;
      e.value.toLowerCase().indexOf("k") >= 0 ? a = 1e3 : e.value.toLowerCase().indexOf("m") >= 0 ? a = 1e6 : e.value.toLowerCase().indexOf("g") >= 0 && (a = 1e9);
      let i = e.selectionStart,
        r = (parseInt(e.value?.replace(/\D/g, "") || 0) * a).toString();
      r = r.replace(/\B(?=(\d{3})+(?!\d))/g, " "), e.value = r, i += e.value.length > o ? 1 : e.value.length < o ? -1 : 0, e.setSelectionRange(i, i), 0 == e.value && n && (e.value = ""), t && t()
    }), 5)
  }
  static reorderArray(e, t, n) {
    let o = e.slice(t, e.length).concat(e.slice(0, t));
    return n ? o.reverse() : o
  }
  static observe(e, t, n, o) {
    let a;
    t = t || {}, new MutationObserver((e => {
      o && "progress" !== e[0].target.tagName.toLowerCase() && (Util.runAsync(o._time.update, o._time), Util.runAsync(o._time.observe, o._time), document.querySelector('[onclick*="sendShips(6"]:not([data-spy-coords]), [onclick*="sendShipsWithPopup(6"]:not([data-spy-coords])') && (clearTimeout(a), a = setTimeout((() => {
        Util.runAsync(o._fleet.checkSendShips, o._fleet)
      }), 50)));
      for (let t = 0; t < e.length; t++) n(e[t])
    })).observe(e, t)
  }
  static addDom(e, t) {
    t = t || {};
    let n = document.createElement(e);
    return n.classList.add("ogl_addedElement"), Object.entries(t).forEach((e => {
      const t = "before" === e[0] || "prepend" === e[0] || "parent" === e[0] || "after" === e[0],
        o = "child" === e[0],
        a = e[0].startsWith("on");
      !o && !a && !t ? (n.setAttribute(e[0], e[1]), "class" == e[0] && e[1].indexOf("material-icons") > -1 && n.classList.add("notranslate")) : a ? n.addEventListener(e[0].toLowerCase().slice(2), (t => {
        e[1](t, n)
      })) : o && (typeof e[1] == typeof {} ? n.appendChild(e[1]) : "string" != typeof e[1] && "number" != typeof e[1] || (n.innerHTML = e[1].toString()))
    })), t.parent ? t.parent.appendChild(n) : t.before ? t.before.parentNode.insertBefore(n, t.before) : t.after ? t.after.after(n) : t.prepend && t.prepend.prepend(n), n
  }
  static runAsync(e, t) {
    return new Promise((n => {
      setTimeout((() => {
        n(t ? t[e.toString().split("(")[0]]() : e(t))
      }))
    }))
  }
  static takeScreenshot(e, t, n, o) {
    if ("undefined" == typeof html2canvas) fetch("https://cdn.jsdelivr.net/npm/html2canvas@1.0.0-rc.5/dist/html2canvas.min.js", {
      method: "get",
      headers: {
        Accept: "application/json"
      }
    }).then((e => e.text())).then((a => {
      (o = (o || 0) + 1) > 3 || (document.head.appendChild(Util.addDom("script", {
        type: "text/javascript",
        child: a
      })), Util.takeScreenshot(e, t, n))
    }));
    else {
      const o = e.getBoundingClientRect();
      html2canvas(e, {
        backgroundColor: null,
        useCORS: !0,
        ignoreElements: e => e.classList.contains("ogl_close") || e.classList.contains("ogl_share"),
        x: o.x,
        y: o.y,
        scrollX: 0,
        scrollY: 0,
        width: o.width,
        height: o.height,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
      }).then((e => {
        const o = e.toDataURL();
        Util.addDom("a", {
          download: n,
          href: o
        }).click(), t.classList.remove("ogl_disabled")
      }))
    }
  }
  static hash(e) {
    return [...e].reduce(((e, t) => Math.imul(31, e) + t.charCodeAt(0) | 0), 0)
  }
  static getMSU(e, t, n, o) {
    return o = o.split(":"), Math.ceil((e || 0) + (t || 0) * o[0] / o[1] + (n || 0) * o[0])
  }
  static getPlayerScoreFD(e, t) {
    if (!e) return "?";
    const n = Math.max(e.military - (e.global - e.economy - e.research - e.lifeform), 0),
      o = e.military - n;
    return "defense" == t ? n : o
  }
  static genTrashsimLink(e, t, n, o, a) {
    n && ["metal", "crystal", "deut", "food"].forEach((e => {
      n.ships?.[e] && delete n.ships?.[e]
    }));
    let i = e.currentPlanet.obj.coords.split(":"),
      r = {
        0: [{
          planet: {
            galaxy: i[0],
            system: i[1],
            position: i[2]
          },
          class: e.account.class,
          characterClassesEnabled: !0,
          allianceClass: e.db.allianceClass || 0,
          research: {},
          ships: n?.ships || {}
        }],
        1: [{
          planet: o?.planet || {},
          research: {},
          ships: o?.ships || {}
        }]
      };
    [109, 110, 111, 114, 115, 117, 118].forEach((t => {
      r[0][0].research[t] = {
        level: e.currentPlanet.obj[t]
      }
    })), a || (r[0][0].lifeformBonuses = r[0][0].lifeformBonuses || {}, r[0][0].lifeformBonuses.BaseStatsBooster = r[0][0].lifeformBonuses.BaseStatsBooster || {}, e.shipsList.forEach((t => {
      r[0][0].lifeformBonuses.BaseStatsBooster[t] = r[0][0].lifeformBonuses.BaseStatsBooster[t] || {}, Object.entries(e.db.lfBonuses?.[t] || {}).forEach((e => {
        "fuel" == e[0] && 0 != e[1] ? r[0][0].lifeformBonuses.ShipFuelConsumption = Math.abs(e[1] / 100) : r[0][0].lifeformBonuses.BaseStatsBooster[t][e[0]] = e[1] / 100
      }))
    })), r[0][0].lifeformBonuses.CharacterClassBooster = {}, r[0][0].lifeformBonuses.CharacterClassBooster[e.account.class] = (e.db.lfBonuses?.["Characterclasses" + e.account.class]?.bonus || 0) / 100), r = btoa(JSON.stringify(r));
    let l = "us" == e.account.lang ? "en" : "ar" == e.account.lang ? "es" : e.account.lang,
      s = e.db.options.sim && Util.simList[e.db.options.sim] ? e.db.options.sim : Object.keys(Util.simList)[Math.floor(Math.random() * Object.keys(Util.simList).length)];
    const d = Util.simList[s];
    return t ? d + l + "?SR_KEY=" + t + "#prefill=" + r : d + l + "#prefill=" + r
  }
  static genConverterLink(e, t) {
    let n = "us" == e.account.lang ? "en" : "ar" == e.account.lang ? "es" : e.account.lang,
      o = e.db.options.converter && Util.converterList[e.db.options.converter] ? e.db.options.converter : Object.keys(Util.converterList)[Math.floor(Math.random() * Object.keys(Util.converterList).length)];
    const a = Util.converterList[o];
    return "ogotcha" == o ? `${a}${n}?CR_KEY=${t}&utm_source=OGLight` : "topraider" == o ? `${a}?CR_KEY=${t}&lang=${n}` : "ogame.tools" == o ? `${a}?CR_KEY=${t}` : void 0
  }
  static genOgotchaLink(e, t) {
    return `https://ogotcha.universeview.be/${"us"==e.account.lang?"en":"ar"==e.account.lang?"es":e.account.lang}?CR_KEY=${t}&utm_source=OGLight`
  }
  static genTopRaiderLink(e, t) {
    return `https://topraider.eu/index.php?CR_KEY=${t}&lang=${"us"==e.account.lang?"en":"ar"==e.account.lang?"es":e.account.lang}`
  }
  static genMmorpgstatLink(e, t) {
    return `https://www.mmorpg-stat.eu/0_fiche_joueur.php?pays=${["fr","de","en","es","pl","it","ru","ar","mx","tr","fi","tw","gr","br","nl","hr","sk","cz","ro","us","pt","dk","no","se","si","hu","jp","ba"].indexOf(e.server.lang)}&ftr=${t}.dat&univers=_${e.server.id}`
  }
}
class PTRE {
  constructor(e) {
    this.ogl = e, this.url = "https://ptre.chez.gg/scripts/", this.playerPositionsDelay = 36e5, this.manageSyncedListUrl = "https://ptre.chez.gg/?page=players_list"
  }
  request(e, t) {
    const n = {},
      o = {};
    document.querySelector(".ogl_ptreActionIcon i") && (this.ogl.ptreNotificationIconTimeout && clearTimeout(this.ogl.ptreNotificationIconTimeout), document.querySelector(".ogl_ptreActionIcon i").className = "material-icons ogl_warning", document.querySelector(".ogl_ptreActionIcon i").classList.add("ogl_active")), Object.entries(t).forEach((e => {
      0 === e[0].indexOf("_") ? o[e[0].replace("_", "")] = e[1] : n[e[0]] = e[1]
    })), n.tool = "oglight", n.team_key = this.ogl.ptreKey, n.country = this.ogl.server.lang, n.univers = this.ogl.server.id;
    const a = n ? "?" + new URLSearchParams(n).toString() : "";
    return fetch(`${this.url}${e}${a}`, o).then((e => e.json())).then((e => (this.ogl.ptreNotificationIconTimeout = setTimeout((() => this.notify(e.message, e.code, e.message_verbose)), 100), Promise.resolve(e))))
  }
  notify(e, t, n) {
    document.querySelector(".ogl_ptreActionIcon i") && (document.querySelector(".ogl_ptreActionIcon i").className = "material-icons", document.querySelector(".ogl_ptreActionIcon i").classList.remove("ogl_active"), 1 != t ? (this.log(t, n || e), document.querySelector(".ogl_ptreActionIcon i").classList.add("ogl_danger")) : document.querySelector(".ogl_ptreActionIcon i").classList.add("ogl_ok"))
  }
  log(e, t) {
    const n = serverTime.getTime();
    this.ogl.cache.ptreLogs = this.ogl.cache.ptreLogs || [], this.ogl.cache.ptreLogs.push({
      code: e,
      message: t,
      id: n
    }), this.ogl.cache.ptreLogs.length > 10 && this.ogl.cache.ptreLogs.shift()
  }
  displayLogs() {
    const e = Util.addDom("div", {
      class: "ogl_log"
    });
    this.ogl.cache.ptreLogs?.length > 0 ? (this.ogl.cache.ptreLogs.forEach((t => {
      const n = this.ogl._time.convertTimestampToDate(t.id);
      Util.addDom("div", {
        child: `<div>${n.outerHTML}</div><div>${t.code}</div><div>${t.message}</div>`,
        prepend: e
      })
    })), Util.addDom("div", {
      child: "<div>time</div><div>error code</div><div>message</div>",
      prepend: e
    })) : Util.addDom("div", {
      child: "empty",
      parent: e
    }), Util.addDom("div", {
      child: "<h2>PTRE errors</h2>",
      prepend: e
    }), this.ogl._popup.open(e, !0)
  }
  postPositions(e) {
    this.request("api_galaxy_import_infos.php", {
      _method: "POST",
      _body: JSON.stringify(e)
    })
  }
  postActivities(e) {
    this.request("oglight_import_player_activity.php", {
      _method: "POST",
      _body: JSON.stringify(e)
    }).then((t => {
      1 == t.code && Object.keys(e).forEach((e => {
        const t = document.querySelector(`.msg[data-msg-id="${e}"] .msg_title`);
        t && !document.querySelector(`.msg[data-msg-id="${e}"] .ogl_checked`) && Util.addDom("div", {
          class: "material-icons ogl_checked tooltipLeft ogl_ptre",
          child: "ptre",
          title: this.ogl._lang.find("ptreActivityImported"),
          parent: t
        }), "messages" == this.ogl.page && this.ogl.cache.counterSpies.push(e)
      }))
    }))
  }
  postPTRECompatibility(e) {
    this.request("oglight_update_version.php", {
      _method: "POST",
      _body: JSON.stringify(e)
    }).then((e => {
      1 == e.code && (this.ogl.id[1] = serverTime.getTime(), GM_setValue("ogl_id", this.ogl.id))
    }))
  }
  postSpyReport(e) {
    this.request("oglight_import.php", {
      _method: "POST",
      sr_id: e
    }).then((e => {
      this.ogl._notification.addToQueue(`PTRE: ${e.message_verbose}`, 1 == e.code)
    }))
  }
  syncTargetList() {
    let e = [];
    Object.values(this.ogl.db.udb).filter((e => "ptre" == e.pin)).forEach((t => {
      e.push({
        id: t.uid,
        pseudo: t.name
      })
    })), this.request("api_sync_target_list.php", {
      _method: "POST",
      _body: JSON.stringify(e)
    }).then((e => {
      1 == e.code && (e.targets_array.forEach((e => {
        const t = parseInt(e.player_id),
          n = this.ogl.db.udb[t] || this.ogl.createPlayer(t);
        n.name = e.pseudo, n.pin || (n.pin = "ptre")
      })), document.querySelector(".ogl_side.ogl_active") && "ptre" == this.ogl.db.lastPinTab && this.ogl._topbar.openPinned()), this.ogl._notification.addToQueue(`PTRE: ${e.message}`, 1 == e.code)
    }))
  }
  getPlayerInfo(e, t) {
    const n = Util.addDom("div", {
      class: "ogl_ptreContent",
      child: '<div class="ogl_loading"></div>'
    });
    this.ogl._popup.open(n), t = t || "week", this.request("oglight_get_player_infos.php", {
      _method: "GET",
      player_id: e.id,
      pseudo: e.name,
      input_frame: t
    }).then((o => {
      if (1 == o.code) {
        const a = JSON.parse(o.activity_array?.activity_array || "{}"),
          i = JSON.parse(o.activity_array?.check_array || "{}");
        n.innerHTML = `\n                    <h3>${e.name}</h3>\n                    <div class="ogl_ptreActivityBlock">\n                        <div class="ogl_frameSelector"></div>\n                        <div class="ogl_ptreActivities"><span></span><div></div></div>\n                    </div>\n                    <div class="ogl_ptreBestReport">\n                        <div>${this.ogl._lang.find("reportFound")} (${new Date(1e3*o.top_sr_timestamp).toLocaleDateString("fr-FR")})</div>\n                        <div>\n                            <div class="ogl_fleetDetail"></div>\n                            <b><i class="material-icons">rocket_launch</i>${Util.formatToUnits(o.top_sr_fleet_points)} pts</b>\n                        </div>\n                        <div>\n                            <a class="ogl_button" target="_blank" href="${o.top_sr_link}">${this.ogl._lang.find("topReportDetails")}</a>\n                            <a class="ogl_button" target="_blank" href="https://ptre.chez.gg/?country=${this.ogl.server.lang}&univers=${this.ogl.server.id}&player_id=${e.id}">${this.ogl._lang.find("playerProfile")}</a>\n                        </div>\n                    </div>\n                    <!--<ul class="ogl_ptreLegend">\n                        <li><u>Green circle</u>: no activity detected & fully checked</li>\n                        <li><u>Green dot</u>: no activity detected</li>\n                        <li><u>Red dot</u>: multiple activities detected</li>\n                        <li><u>Transparent dot</u>: not enough planet checked</li>\n                    </ul>-->\n                `, Object.entries({
          last24h: "Last 24h",
          "2days": "2 days",
          "3days": "3 days",
          week: "Week",
          "2weeks": "2 weeks",
          month: "Month"
        }).forEach((o => {
          const a = Util.addDom("button", {
            class: "ogl_button",
            child: o[1],
            parent: n.querySelector(".ogl_frameSelector"),
            onclick: () => {
              this.getPlayerInfo(e, o[0])
            }
          });
          o[0] == t && a.classList.add("ogl_active")
        })), 1 == o.activity_array.succes && a.forEach(((e, t) => {
          if (!isNaN(e[1])) {
            let a, r = Util.addDom("div", {
                class: "tooltip",
                child: `<div>${e[0]}</div>`
              }),
              l = r.appendChild(Util.addDom("span", {
                class: "ogl_ptreDotStats"
              })).appendChild(Util.addDom("div", {
                "data-acti": e[1],
                "data-check": i[t][1]
              })),
              s = e[1] / o.activity_array.max_acti_per_slot * 100 * 7;
            s = 30 * Math.ceil(s / 30), l.style.color = `hsl(${Math.max(0,100-s)}deg 75% 40%)`, l.style.opacity = i[t][1] + "%";
            let d = Math.max(0, 100 - s);
            a = 100 === d ? "- No activity detected" : d >= 60 ? "- A few activities detected" : d >= 40 ? "- Some activities detected" : "- A lot of activities detected", 100 == i[t][1] ? a += "<br>- Perfectly checked" : i[t][1] >= 75 ? a += "<br>- Nicely checked" : i[t][1] >= 50 ? a += "<br>- Decently checked" : a = i[t][1] > 0 ? "Poorly checked" : "Not checked", r.setAttribute("title", a), 100 === i[t][1] && 0 == e[1] && l.classList.add("ogl_active"), n.querySelector(".ogl_ptreActivities > div").appendChild(r)
          }
        })), o.fleet_json && this.ogl.shipsList.forEach((e => {
          const t = o.fleet_json.find((t => t.ship_type == e));
          t && Util.addDom("div", {
            class: `ogl_icon ogl_${e}`,
            child: Util.formatToUnits(t.count),
            parent: n.querySelector(".ogl_fleetDetail")
          })
        })), this.ogl._popup.open(n, !0)
      }
      else n.innerHTML = `${o.message}<hr><a target="_blank" href="https://ptre.chez.gg/?page=splash">More informations here</a>`
    }))
  }
  getPlayerPositions(e) {
    const t = () => {
        document.querySelector(".ogl_pinDetail") && this.ogl.db.currentSide == e.id && this.ogl._topbar.openPinnedDetail(e.id, !0)
      },
      n = this.ogl.db.udb[e.id] || this.ogl.createPlayer(e.player_id);
    this.ogl._fetch.fetchPlayerAPI(e.id, e.name, (() => {
      this.ogl.ptreKey && serverTime.getTime() - (n.ptre || 0) > this.playerPositionsDelay ? this.request("api_galaxy_get_infos.php", {
        _method: "GET",
        player_id: e.id
      }).then((e => {
        1 == e.code && (t(), n.ptre = serverTime.getTime(), e.galaxy_array.forEach((e => {
          const t = this.ogl.db.pdb[e.coords] || {};
          (t.api || 0) < e.timestamp_ig && (t.uid = e.player_id, t.pid = e.id, t.mid = e.moon?.id || -1, t.coo = e.coords, t.acti = ["60", "60", e.timestamp_ig], this.ogl.removeOldPlanetOwner(e.coords, e.player_id), n.planets && n.planets.indexOf(e.coords) < 0 && n.planets.push(e.coords), this.ogl.db.pdb[e.coords] = t, document.querySelector(".ogl_pinDetail") && this.ogl.db.currentSide == e.player_id && this.ogl._topbar.openPinnedDetail(this.ogl.db.currentSide))
        }))), this.ogl._notification.addToQueue(`PTRE: ${e.message}`, 1 == e.code)
      })) : t()
    }))
  }
}
class Datafinder {
  static getTech(e) {
    return {
      1: {
        metal: 60,
        crystal: 15,
        deut: 0,
        priceFactor: 1.5
      },
      2: {
        metal: 48,
        crystal: 24,
        deut: 0,
        priceFactor: 1.6
      },
      3: {
        metal: 225,
        crystal: 75,
        deut: 0,
        priceFactor: 1.5
      },
      4: {
        metal: 75,
        crystal: 30,
        deut: 0,
        priceFactor: 1.5
      },
      12: {
        metal: 900,
        crystal: 360,
        deut: 180,
        priceFactor: 1.8
      },
      14: {
        metal: 400,
        crystal: 120,
        deut: 200
      },
      15: {
        metal: 1e6,
        crystal: 5e5,
        deut: 1e5,
        durationFactor: 1
      },
      21: {
        metal: 400,
        crystal: 200,
        deut: 100
      },
      22: {
        metal: 1e3,
        crystal: 0,
        deut: 0
      },
      23: {
        metal: 1e3,
        crystal: 500,
        deut: 0
      },
      24: {
        metal: 1e3,
        crystal: 1e3,
        deut: 0
      },
      31: {
        metal: 200,
        crystal: 400,
        deut: 200
      },
      33: {
        metal: 0,
        crystal: 5e4,
        deut: 1e5,
        energy: 1e3,
        energyFactor: 2
      },
      34: {
        metal: 2e4,
        crystal: 4e4,
        deut: 0
      },
      36: {
        metal: 200,
        crystal: 0,
        deut: 50,
        energy: 50,
        priceFactor: 5,
        energyFactor: 2.5
      },
      41: {
        metal: 2e4,
        crystal: 4e4,
        deut: 2e4
      },
      42: {
        metal: 2e4,
        crystal: 4e4,
        deut: 2e4
      },
      43: {
        metal: 2e6,
        crystal: 4e6,
        deut: 2e6
      },
      44: {
        metal: 2e4,
        crystal: 2e4,
        deut: 1e3
      },
      106: {
        metal: 200,
        crystal: 1e3,
        deut: 200
      },
      108: {
        metal: 0,
        crystal: 400,
        deut: 600
      },
      109: {
        metal: 800,
        crystal: 200,
        deut: 0
      },
      110: {
        metal: 200,
        crystal: 600,
        deut: 0
      },
      111: {
        metal: 1e3,
        crystal: 0,
        deut: 0
      },
      113: {
        metal: 0,
        crystal: 800,
        deut: 400
      },
      114: {
        metal: 0,
        crystal: 4e3,
        deut: 2e3
      },
      115: {
        metal: 400,
        crystal: 0,
        deut: 600
      },
      117: {
        metal: 2e3,
        crystal: 4e3,
        deut: 600
      },
      118: {
        metal: 1e4,
        crystal: 2e4,
        deut: 6e3
      },
      120: {
        metal: 200,
        crystal: 100,
        deut: 0
      },
      121: {
        metal: 1e3,
        crystal: 300,
        deut: 100
      },
      122: {
        metal: 2e3,
        crystal: 4e3,
        deut: 1e3
      },
      123: {
        metal: 24e4,
        crystal: 4e5,
        deut: 16e4
      },
      124: {
        metal: 4e3,
        crystal: 8e3,
        deut: 4e3,
        priceFactor: 1.75
      },
      199: {
        metal: 0,
        crystal: 0,
        deut: 0,
        energy: 3e5,
        priceFactor: 3,
        energyFactor: 3,
        durationFactor: 1
      },
      202: {
        metal: 2e3,
        crystal: 2e3,
        deut: 0
      },
      203: {
        metal: 6e3,
        crystal: 6e3,
        deut: 0
      },
      204: {
        metal: 3e3,
        crystal: 1e3,
        deut: 0
      },
      205: {
        metal: 6e3,
        crystal: 4e3,
        deut: 0
      },
      206: {
        metal: 2e4,
        crystal: 7e3,
        deut: 2e3
      },
      207: {
        metal: 45e3,
        crystal: 15e3,
        deut: 0
      },
      208: {
        metal: 1e4,
        crystal: 2e4,
        deut: 1e4
      },
      209: {
        metal: 1e4,
        crystal: 6e3,
        deut: 2e3
      },
      210: {
        crystal: 1e3,
        deut: 0
      },
      211: {
        metal: 5e4,
        crystal: 25e3,
        deut: 15e3
      },
      212: {
        metal: 0,
        crystal: 2e3,
        deut: 500
      },
      213: {
        metal: 6e4,
        crystal: 5e4,
        deut: 15e3
      },
      214: {
        metal: 5e6,
        crystal: 4e6,
        deut: 1e6
      },
      215: {
        metal: 3e4,
        crystal: 4e4,
        deut: 15e3
      },
      217: {
        metal: 2e3,
        crystal: 2e3,
        deut: 1e3
      },
      218: {
        metal: 85e3,
        crystal: 55e3,
        deut: 2e4
      },
      219: {
        metal: 8e3,
        crystal: 15e3,
        deut: 8e3
      },
      401: {
        metal: 2e3,
        crystal: 0,
        deut: 0
      },
      402: {
        metal: 1500,
        crystal: 500,
        deut: 0
      },
      403: {
        metal: 6e3,
        crystal: 2e3,
        deut: 0
      },
      404: {
        metal: 2e4,
        crystal: 15e3,
        deut: 2e3
      },
      405: {
        metal: 5e3,
        crystal: 3e3,
        deut: 0
      },
      406: {
        metal: 5e4,
        crystal: 5e4,
        deut: 3e4
      },
      407: {
        metal: 1e4,
        crystal: 1e4,
        deut: 0
      },
      408: {
        metal: 5e4,
        crystal: 5e4,
        deut: 0
      },
      502: {
        metal: 8e3,
        crystal: 0,
        deut: 2e3
      },
      503: {
        metal: 12e3,
        crystal: 2500,
        deut: 1e4
      },
      11101: {
        type: "building",
        lifeform: "human",
        metal: 7,
        crystal: 2,
        deut: 0,
        priceFactor: 1.2,
        bonus1BaseValue: 210,
        bonus1IncreaseFactor: 1.21,
        bonus2BaseValue: 16,
        bonus2IncreaseFactor: 1.2,
        bonus3Value: 9,
        bonus3IncreaseFactor: 1.15,
        durationfactor: 1.21,
        durationbase: 40
      },
      11102: {
        type: "building",
        lifeform: "human",
        metal: 5,
        crystal: 2,
        deut: 0,
        energy: 8,
        priceFactor: 1.23,
        energyIncreaseFactor: 1.02,
        bonus1BaseValue: 10,
        bonus1IncreaseFactor: 1.15,
        bonus2BaseValue: 10,
        bonus2IncreaseFactor: 1.14,
        durationfactor: 1.25,
        durationbase: 40
      },
      11103: {
        type: "building",
        lifeform: "human",
        metal: 2e4,
        crystal: 25e3,
        deut: 1e4,
        energy: 10,
        priceFactor: 1.3,
        energyIncreaseFactor: 1.08,
        bonus1BaseValue: .25,
        bonus1IncreaseFactor: 1,
        bonus1Max: .25,
        bonus2BaseValue: 2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.25,
        durationbase: 16e3
      },
      11104: {
        type: "building",
        lifeform: "human",
        metal: 5e3,
        crystal: 3200,
        deut: 1500,
        energy: 15,
        priceFactor: 1.7,
        energyIncreaseFactor: 1.25,
        bonus1BaseValue: 2e7,
        bonus1IncreaseFactor: 1.1,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.6,
        durationbase: 16e3
      },
      11105: {
        type: "building",
        lifeform: "human",
        metal: 5e4,
        crystal: 4e4,
        deut: 5e4,
        energy: 30,
        priceFactor: 1.7,
        energyIncreaseFactor: 1.25,
        bonus1BaseValue: 1e8,
        bonus1IncreaseFactor: 1.1,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.7,
        durationbase: 64e3
      },
      11106: {
        type: "building",
        lifeform: "human",
        metal: 9e3,
        crystal: 6e3,
        deut: 3e3,
        energy: 40,
        priceFactor: 1.5,
        energyIncreaseFactor: 1.1,
        bonus1BaseValue: 1.5,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 2e3
      },
      11107: {
        type: "building",
        lifeform: "human",
        metal: 25e3,
        crystal: 13e3,
        deut: 7e3,
        priceFactor: 1.09,
        bonus1BaseValue: 1,
        bonus1IncreaseFactor: 1,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        bonus2Max: .8,
        bonus3Value: .8,
        bonus3IncreaseFactor: 1,
        durationfactor: 1.17,
        durationbase: 12e3
      },
      11108: {
        type: "building",
        lifeform: "human",
        metal: 5e4,
        crystal: 25e3,
        deut: 15e3,
        energy: 80,
        priceFactor: 1.5,
        energyIncreaseFactor: 1.1,
        bonus1BaseValue: 1.5,
        bonus1IncreaseFactor: 1,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 28e3
      },
      11109: {
        type: "building",
        lifeform: "human",
        metal: 75e3,
        crystal: 2e4,
        deut: 25e3,
        energy: 50,
        priceFactor: 1.09,
        energyIncreaseFactor: 1.02,
        bonus1BaseValue: 1.5,
        bonus1IncreaseFactor: 1,
        bonus2BaseValue: 1.5,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 4e4
      },
      11110: {
        type: "building",
        lifeform: "human",
        metal: 15e4,
        crystal: 3e4,
        deut: 15e3,
        energy: 60,
        priceFactor: 1.12,
        energyIncreaseFactor: 1.03,
        bonus1BaseValue: 5,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 52e3
      },
      11111: {
        type: "building",
        lifeform: "human",
        metal: 8e4,
        crystal: 35e3,
        deut: 6e4,
        energy: 90,
        priceFactor: 1.5,
        energyIncreaseFactor: 1.05,
        bonus1BaseValue: .5,
        bonus1IncreaseFactor: 1,
        bonus1Max: 1,
        durationfactor: 1.3,
        durationbase: 9e4
      },
      11112: {
        type: "building",
        lifeform: "human",
        metal: 25e4,
        crystal: 125e3,
        deut: 125e3,
        energy: 100,
        priceFactor: 1.15,
        energyIncreaseFactor: 1.02,
        bonus1BaseValue: 3,
        bonus1IncreaseFactor: 1,
        bonus1Max: .9,
        durationfactor: 1.2,
        durationbase: 95e3
      },
      11201: {
        type: "tech 1",
        lifeform: "human",
        metal: 5e3,
        crystal: 2500,
        deut: 500,
        priceFactor: 1.3,
        bonus1BaseValue: 1,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 1e3
      },
      11202: {
        type: "tech 2",
        lifeform: "human",
        metal: 7e3,
        crystal: 1e4,
        deut: 5e3,
        priceFactor: 1.5,
        bonus1BaseValue: .06,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 2e3
      },
      11203: {
        type: "tech 3",
        lifeform: "human",
        metal: 15e3,
        crystal: 1e4,
        deut: 5e3,
        priceFactor: 1.3,
        bonus1BaseValue: .5,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 2500
      },
      11204: {
        type: "tech 4",
        lifeform: "human",
        metal: 2e4,
        crystal: 15e3,
        deut: 7500,
        priceFactor: 1.3,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 3500
      },
      11205: {
        type: "tech 5",
        lifeform: "human",
        metal: 25e3,
        crystal: 2e4,
        deut: 1e4,
        priceFactor: 1.3,
        bonus1BaseValue: 4,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 4500
      },
      11206: {
        type: "tech 6",
        lifeform: "human",
        metal: 35e3,
        crystal: 25e3,
        deut: 15e3,
        priceFactor: 1.5,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .99,
        durationfactor: 1.3,
        durationbase: 5e3
      },
      11207: {
        type: "tech 7",
        lifeform: "human",
        metal: 7e4,
        crystal: 4e4,
        deut: 2e4,
        priceFactor: 1.3,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 8e3
      },
      11208: {
        type: "tech 8",
        lifeform: "human",
        metal: 8e4,
        crystal: 5e4,
        deut: 2e4,
        priceFactor: 1.5,
        bonus1BaseValue: .06,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 6e3
      },
      11209: {
        type: "tech 9",
        lifeform: "human",
        metal: 32e4,
        crystal: 24e4,
        deut: 1e5,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 6500
      },
      11210: {
        type: "tech 10",
        lifeform: "human",
        metal: 32e4,
        crystal: 24e4,
        deut: 1e5,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 7e3
      },
      11211: {
        type: "tech 11",
        lifeform: "human",
        metal: 12e4,
        crystal: 3e4,
        deut: 25e3,
        priceFactor: 1.5,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .99,
        durationfactor: 1.3,
        durationbase: 7500
      },
      11212: {
        type: "tech 12",
        lifeform: "human",
        metal: 1e5,
        crystal: 4e4,
        deut: 3e4,
        priceFactor: 1.3,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 1e4
      },
      11213: {
        type: "tech 13",
        lifeform: "human",
        metal: 2e5,
        crystal: 1e5,
        deut: 1e5,
        priceFactor: 1.3,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 8500
      },
      11214: {
        type: "tech 14",
        lifeform: "human",
        metal: 16e4,
        crystal: 12e4,
        deut: 5e4,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 9e3
      },
      11215: {
        type: "tech 15",
        lifeform: "human",
        metal: 16e4,
        crystal: 12e4,
        deut: 5e4,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 9500
      },
      11216: {
        type: "tech 16",
        lifeform: "human",
        metal: 32e4,
        crystal: 24e4,
        deut: 1e5,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 1e4
      },
      11217: {
        type: "tech 17",
        lifeform: "human",
        metal: 3e5,
        crystal: 18e4,
        deut: 12e4,
        priceFactor: 1.5,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        bonus1Max: .99,
        durationfactor: 1.3,
        durationbase: 11e3
      },
      11218: {
        type: "tech 18",
        lifeform: "human",
        metal: 5e5,
        crystal: 3e5,
        deut: 2e5,
        priceFactor: 1.2,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        bonus1Max: .99,
        durationfactor: 1.3,
        durationbase: 13e3
      },
      12101: {
        type: "building",
        lifeform: "rocktal",
        metal: 9,
        crystal: 3,
        deut: 0,
        priceFactor: 1.2,
        bonus1BaseValue: 150,
        bonus1IncreaseFactor: 1.216,
        bonus2BaseValue: 12,
        bonus2IncreaseFactor: 1.2,
        bonus3Value: 5,
        bonus3IncreaseFactor: 1.15,
        durationfactor: 1.21,
        durationbase: 40
      },
      12102: {
        type: "building",
        lifeform: "rocktal",
        metal: 7,
        crystal: 2,
        deut: 0,
        energy: 10,
        priceFactor: 1.2,
        energyIncreaseFactor: 1.03,
        bonus1BaseValue: 8,
        bonus1IncreaseFactor: 1.15,
        bonus2BaseValue: 6,
        bonus2IncreaseFactor: 1.14,
        durationfactor: 1.21,
        durationbase: 40
      },
      12103: {
        type: "building",
        lifeform: "rocktal",
        metal: 4e4,
        crystal: 1e4,
        deut: 15e3,
        energy: 15,
        priceFactor: 1.3,
        energyIncreaseFactor: 1.1,
        bonus1BaseValue: .25,
        bonus1IncreaseFactor: 1,
        bonus1Max: .25,
        bonus2BaseValue: 2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.25,
        durationbase: 16e3
      },
      12104: {
        type: "building",
        lifeform: "rocktal",
        metal: 5e3,
        crystal: 3800,
        deut: 1e3,
        energy: 20,
        priceFactor: 1.7,
        energyIncreaseFactor: 1.35,
        bonus1BaseValue: 16e6,
        bonus1IncreaseFactor: 1.14,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.6,
        durationbase: 16e3
      },
      12105: {
        type: "building",
        lifeform: "rocktal",
        metal: 5e4,
        crystal: 4e4,
        deut: 5e4,
        energy: 60,
        priceFactor: 1.65,
        energyIncreaseFactor: 1.3,
        bonus1BaseValue: 9e7,
        bonus1IncreaseFactor: 1.1,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.7,
        durationbase: 64e3
      },
      12106: {
        type: "building",
        lifeform: "rocktal",
        metal: 1e4,
        crystal: 8e3,
        deut: 1e3,
        energy: 40,
        priceFactor: 1.4,
        energyIncreaseFactor: 1.1,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 2e3
      },
      12107: {
        type: "building",
        lifeform: "rocktal",
        metal: 2e4,
        crystal: 15e3,
        deut: 1e4,
        priceFactor: 1.2,
        bonus1BaseValue: 1.5,
        bonus1IncreaseFactor: 1,
        bonus2BaseValue: .5,
        bonus2IncreaseFactor: 1,
        bonus2Max: .4,
        durationfactor: 1.25,
        durationbase: 16e3
      },
      12108: {
        type: "building",
        lifeform: "rocktal",
        metal: 5e4,
        crystal: 35e3,
        deut: 15e3,
        energy: 80,
        priceFactor: 1.5,
        energyIncreaseFactor: 1.3,
        bonus1BaseValue: 1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        bonus2Max: .5,
        durationfactor: 1.4,
        durationbase: 4e4
      },
      12109: {
        type: "building",
        lifeform: "rocktal",
        metal: 85e3,
        crystal: 44e3,
        deut: 25e3,
        energy: 90,
        priceFactor: 1.4,
        energyIncreaseFactor: 1.1,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 4e4
      },
      12110: {
        type: "building",
        lifeform: "rocktal",
        metal: 12e4,
        crystal: 5e4,
        deut: 2e4,
        energy: 90,
        priceFactor: 1.4,
        energyIncreaseFactor: 1.1,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 52e3
      },
      12111: {
        type: "building",
        lifeform: "rocktal",
        metal: 25e4,
        crystal: 15e4,
        deut: 1e5,
        energy: 120,
        priceFactor: 1.8,
        energyIncreaseFactor: 1.3,
        bonus1BaseValue: .5,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        durationfactor: 1.3,
        durationbase: 9e4
      },
      12112: {
        type: "building",
        lifeform: "rocktal",
        metal: 25e4,
        crystal: 125e3,
        deut: 125e3,
        energy: 100,
        priceFactor: 1.5,
        energyIncreaseFactor: 1.1,
        bonus1BaseValue: .6,
        bonus1IncreaseFactor: 1,
        bonus1Max: .3,
        durationfactor: 1.3,
        durationbase: 95e3
      },
      12201: {
        type: "tech 1",
        lifeform: "rocktal",
        metal: 1e4,
        crystal: 6e3,
        deut: 1e3,
        priceFactor: 1.5,
        bonus1BaseValue: .25,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 1e3
      },
      12202: {
        type: "tech 2",
        lifeform: "rocktal",
        metal: 7500,
        crystal: 12500,
        deut: 5e3,
        priceFactor: 1.5,
        bonus1BaseValue: .08,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 2e3
      },
      12203: {
        type: "tech 3",
        lifeform: "rocktal",
        metal: 15e3,
        crystal: 1e4,
        deut: 5e3,
        priceFactor: 1.5,
        bonus1BaseValue: .08,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 2500
      },
      12204: {
        type: "tech 4",
        lifeform: "rocktal",
        metal: 2e4,
        crystal: 15e3,
        deut: 7500,
        priceFactor: 1.3,
        bonus1BaseValue: .4,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 3500
      },
      12205: {
        type: "tech 5",
        lifeform: "rocktal",
        metal: 25e3,
        crystal: 2e4,
        deut: 1e4,
        priceFactor: 1.5,
        bonus1BaseValue: .08,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 4500
      },
      12206: {
        type: "tech 6",
        lifeform: "rocktal",
        metal: 5e4,
        crystal: 5e4,
        deut: 2e4,
        priceFactor: 1.5,
        bonus1BaseValue: .25,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 5e3
      },
      12207: {
        type: "tech 7",
        lifeform: "rocktal",
        metal: 7e4,
        crystal: 4e4,
        deut: 2e4,
        priceFactor: 1.5,
        bonus1BaseValue: .08,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 5500
      },
      12208: {
        type: "tech 8",
        lifeform: "rocktal",
        metal: 16e4,
        crystal: 12e4,
        deut: 5e4,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 6e3
      },
      12209: {
        type: "tech 9",
        lifeform: "rocktal",
        metal: 75e3,
        crystal: 55e3,
        deut: 25e3,
        priceFactor: 1.5,
        bonus1BaseValue: .15,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .3,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 6500
      },
      12210: {
        type: "tech 10",
        lifeform: "rocktal",
        metal: 85e3,
        crystal: 4e4,
        deut: 35e3,
        priceFactor: 1.5,
        bonus1BaseValue: .08,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 7e3
      },
      12211: {
        type: "tech 11",
        lifeform: "rocktal",
        metal: 12e4,
        crystal: 3e4,
        deut: 25e3,
        priceFactor: 1.5,
        bonus1BaseValue: .08,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 7500
      },
      12212: {
        type: "tech 12",
        lifeform: "rocktal",
        metal: 1e5,
        crystal: 4e4,
        deut: 3e4,
        priceFactor: 1.5,
        bonus1BaseValue: .08,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 8e3
      },
      12213: {
        type: "tech 13",
        lifeform: "rocktal",
        metal: 2e5,
        crystal: 1e5,
        deut: 1e5,
        priceFactor: 1.2,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 8500
      },
      12214: {
        type: "tech 14",
        lifeform: "rocktal",
        metal: 22e4,
        crystal: 11e4,
        deut: 11e4,
        priceFactor: 1.3,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 9e3
      },
      12215: {
        type: "tech 15",
        lifeform: "rocktal",
        metal: 24e4,
        crystal: 12e4,
        deut: 12e4,
        priceFactor: 1.3,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 9500
      },
      12216: {
        type: "tech 16",
        lifeform: "rocktal",
        metal: 25e4,
        crystal: 25e4,
        deut: 25e4,
        priceFactor: 1.4,
        bonus1BaseValue: .5,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 1e4
      },
      12217: {
        type: "tech 17",
        lifeform: "rocktal",
        metal: 5e5,
        crystal: 3e5,
        deut: 2e5,
        priceFactor: 1.5,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 13e3
      },
      12218: {
        type: "tech 18",
        lifeform: "rocktal",
        metal: 3e5,
        crystal: 18e4,
        deut: 12e4,
        priceFactor: 1.7,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 11e3
      },
      13101: {
        type: "building",
        lifeform: "mecha",
        metal: 6,
        crystal: 2,
        deut: 0,
        priceFactor: 1.21,
        bonus1BaseValue: 500,
        bonus1IncreaseFactor: 1.205,
        bonus2BaseValue: 24,
        bonus2IncreaseFactor: 1.2,
        bonus3Value: 22,
        bonus3IncreaseFactor: 1.15,
        durationfactor: 1.22,
        durationbase: 40
      },
      13102: {
        type: "building",
        lifeform: "mecha",
        metal: 5,
        crystal: 2,
        deut: 0,
        energy: 8,
        priceFactor: 1.18,
        energyIncreaseFactor: 1.02,
        bonus1BaseValue: 18,
        bonus1IncreaseFactor: 1.15,
        bonus2BaseValue: 23,
        bonus2IncreaseFactor: 1.12,
        durationfactor: 1.2,
        durationbase: 48
      },
      13103: {
        type: "building",
        lifeform: "mecha",
        metal: 3e4,
        crystal: 2e4,
        deut: 1e4,
        energy: 13,
        priceFactor: 1.3,
        energyIncreaseFactor: 1.08,
        bonus1BaseValue: .25,
        bonus1IncreaseFactor: 1,
        bonus1Max: .25,
        bonus2BaseValue: 2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.25,
        durationbase: 16e3
      },
      13104: {
        type: "building",
        lifeform: "mecha",
        metal: 5e3,
        crystal: 3800,
        deut: 1e3,
        energy: 10,
        priceFactor: 1.8,
        energyIncreaseFactor: 1.2,
        bonus1BaseValue: 4e7,
        bonus1IncreaseFactor: 1.1,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.6,
        durationbase: 16e3
      },
      13105: {
        type: "building",
        lifeform: "mecha",
        metal: 5e4,
        crystal: 4e4,
        deut: 5e4,
        energy: 40,
        priceFactor: 1.8,
        energyIncreaseFactor: 1.2,
        bonus1BaseValue: 13e7,
        bonus1IncreaseFactor: 1.1,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.7,
        durationbase: 64e3
      },
      13106: {
        type: "building",
        lifeform: "mecha",
        metal: 7500,
        crystal: 7e3,
        deut: 1e3,
        priceFactor: 1.3,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        bonus1Max: .99,
        durationfactor: 1.3,
        durationbase: 2e3
      },
      13107: {
        type: "building",
        lifeform: "mecha",
        metal: 35e3,
        crystal: 15e3,
        deut: 1e4,
        energy: 40,
        priceFactor: 1.5,
        energyIncreaseFactor: 1.05,
        bonus1BaseValue: 1,
        bonus1IncreaseFactor: 1,
        bonus1Max: 1,
        bonus2BaseValue: .3,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 16e3
      },
      13108: {
        type: "building",
        lifeform: "mecha",
        metal: 5e4,
        crystal: 2e4,
        deut: 3e4,
        energy: 40,
        priceFactor: 1.07,
        energyIncreaseFactor: 1.01,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        bonus2BaseValue: 2,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.17,
        durationbase: 12e3
      },
      13109: {
        type: "building",
        lifeform: "mecha",
        metal: 1e5,
        crystal: 1e4,
        deut: 3e3,
        energy: 80,
        priceFactor: 1.14,
        energyIncreaseFactor: 1.04,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        bonus2BaseValue: 6,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 4e4
      },
      13110: {
        type: "building",
        lifeform: "mecha",
        metal: 1e5,
        crystal: 4e4,
        deut: 2e4,
        energy: 60,
        priceFactor: 1.5,
        energyIncreaseFactor: 1.1,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 52e3
      },
      13111: {
        type: "building",
        lifeform: "mecha",
        metal: 55e3,
        crystal: 5e4,
        deut: 3e4,
        energy: 70,
        priceFactor: 1.5,
        energyIncreaseFactor: 1.05,
        bonus1BaseValue: .4,
        bonus1IncreaseFactor: 1,
        bonus1Max: 1,
        durationfactor: 1.3,
        durationbase: 5e4
      },
      13112: {
        type: "building",
        lifeform: "mecha",
        metal: 25e4,
        crystal: 125e3,
        deut: 125e3,
        energy: 100,
        priceFactor: 1.4,
        energyIncreaseFactor: 1.05,
        bonus1BaseValue: 1.3,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        durationfactor: 1.4,
        durationbase: 95e3
      },
      13201: {
        type: "tech 1",
        lifeform: "mecha",
        metal: 1e4,
        crystal: 6e3,
        deut: 1e3,
        priceFactor: 1.5,
        bonus1BaseValue: .08,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 1e3
      },
      13202: {
        type: "tech 2",
        lifeform: "mecha",
        metal: 7500,
        crystal: 12500,
        deut: 5e3,
        priceFactor: 1.3,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 2e3
      },
      13203: {
        type: "tech 3",
        lifeform: "mecha",
        metal: 15e3,
        crystal: 1e4,
        deut: 5e3,
        priceFactor: 1.5,
        bonus1BaseValue: .03,
        bonus1IncreaseFactor: 1,
        bonus1Max: .3,
        durationfactor: 1.4,
        durationbase: 2500
      },
      13204: {
        type: "tech 4",
        lifeform: "mecha",
        metal: 2e4,
        crystal: 15e3,
        deut: 7500,
        priceFactor: 1.3,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 3500
      },
      13205: {
        type: "tech 5",
        lifeform: "mecha",
        metal: 16e4,
        crystal: 12e4,
        deut: 5e4,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 4500
      },
      13206: {
        type: "tech 6",
        lifeform: "mecha",
        metal: 5e4,
        crystal: 5e4,
        deut: 2e4,
        priceFactor: 1.5,
        bonus1BaseValue: .06,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 5e3
      },
      13207: {
        type: "tech 7",
        lifeform: "mecha",
        metal: 7e4,
        crystal: 4e4,
        deut: 2e4,
        priceFactor: 1.3,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 5500
      },
      13208: {
        type: "tech 8",
        lifeform: "mecha",
        metal: 16e4,
        crystal: 12e4,
        deut: 5e4,
        priceFactor: 1.5,
        bonus1BaseValue: 1,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 6e3
      },
      13209: {
        type: "tech 9",
        lifeform: "mecha",
        metal: 16e4,
        crystal: 12e4,
        deut: 5e4,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 6500
      },
      13210: {
        type: "tech 10",
        lifeform: "mecha",
        metal: 85e3,
        crystal: 4e4,
        deut: 35e3,
        priceFactor: 1.2,
        bonus1BaseValue: .15,
        bonus1IncreaseFactor: 1,
        bonus1Max: .9,
        durationfactor: 1.3,
        durationbase: 7e3
      },
      13211: {
        type: "tech 11",
        lifeform: "mecha",
        metal: 12e4,
        crystal: 3e4,
        deut: 25e3,
        priceFactor: 1.3,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 7500
      },
      13212: {
        type: "tech 12",
        lifeform: "mecha",
        metal: 16e4,
        crystal: 12e4,
        deut: 5e4,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 8e3
      },
      13213: {
        type: "tech 13",
        lifeform: "mecha",
        metal: 2e5,
        crystal: 1e5,
        deut: 1e5,
        priceFactor: 1.5,
        bonus1BaseValue: .06,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 8500
      },
      13214: {
        type: "tech 14",
        lifeform: "mecha",
        metal: 16e4,
        crystal: 12e4,
        deut: 5e4,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 9e3
      },
      13215: {
        type: "tech 15",
        lifeform: "mecha",
        metal: 32e4,
        crystal: 24e4,
        deut: 1e5,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 9500
      },
      13216: {
        type: "tech 16",
        lifeform: "mecha",
        metal: 32e4,
        crystal: 24e4,
        deut: 1e5,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 1e4
      },
      13217: {
        type: "tech 17",
        lifeform: "mecha",
        metal: 5e5,
        crystal: 3e5,
        deut: 2e5,
        priceFactor: 1.5,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 13e3
      },
      13218: {
        type: "tech 18",
        lifeform: "mecha",
        metal: 3e5,
        crystal: 18e4,
        deut: 12e4,
        priceFactor: 1.7,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 11e3
      },
      14101: {
        type: "building",
        lifeform: "kaelesh",
        metal: 4,
        crystal: 3,
        deut: 0,
        priceFactor: 1.21,
        bonus1BaseValue: 250,
        bonus1IncreaseFactor: 1.21,
        bonus2BaseValue: 16,
        bonus2IncreaseFactor: 1.2,
        bonus3Value: 11,
        bonus3IncreaseFactor: 1.15,
        durationfactor: 1.22,
        durationbase: 40
      },
      14102: {
        type: "building",
        lifeform: "kaelesh",
        metal: 6,
        crystal: 3,
        deut: 0,
        energy: 9,
        priceFactor: 1.2,
        energyIncreaseFactor: 1.02,
        bonus1BaseValue: 12,
        bonus1IncreaseFactor: 1.15,
        bonus2BaseValue: 12,
        bonus2IncreaseFactor: 1.14,
        durationfactor: 1.22,
        durationbase: 40
      },
      14103: {
        type: "building",
        lifeform: "kaelesh",
        metal: 2e4,
        crystal: 15e3,
        deut: 15e3,
        energy: 10,
        priceFactor: 1.3,
        energyIncreaseFactor: 1.08,
        bonus1BaseValue: .25,
        bonus1IncreaseFactor: 1,
        bonus1Max: .25,
        bonus2BaseValue: 2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.25,
        durationbase: 16e3
      },
      14104: {
        type: "building",
        lifeform: "kaelesh",
        metal: 7500,
        crystal: 5e3,
        deut: 800,
        energy: 15,
        priceFactor: 1.8,
        energyIncreaseFactor: 1.3,
        bonus1BaseValue: 3e7,
        bonus1IncreaseFactor: 1.1,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.7,
        durationbase: 16e3
      },
      14105: {
        type: "building",
        lifeform: "kaelesh",
        metal: 6e4,
        crystal: 3e4,
        deut: 5e4,
        energy: 30,
        priceFactor: 1.8,
        energyIncreaseFactor: 1.3,
        bonus1BaseValue: 1e8,
        bonus1IncreaseFactor: 1.1,
        bonus2BaseValue: 1,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.8,
        durationbase: 64e3
      },
      14106: {
        type: "building",
        lifeform: "kaelesh",
        metal: 8500,
        crystal: 5e3,
        deut: 3e3,
        priceFactor: 1.25,
        bonus1BaseValue: 1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        durationfactor: 1.35,
        durationbase: 2e3
      },
      14107: {
        type: "building",
        lifeform: "kaelesh",
        metal: 15e3,
        crystal: 15e3,
        deut: 5e3,
        priceFactor: 1.2,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 12e3
      },
      14108: {
        type: "building",
        lifeform: "kaelesh",
        metal: 75e3,
        crystal: 25e3,
        deut: 3e4,
        energy: 30,
        priceFactor: 1.05,
        energyIncreaseFactor: 1.03,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        bonus2BaseValue: 6,
        bonus2IncreaseFactor: 1,
        durationfactor: 1.18,
        durationbase: 16e3
      },
      14109: {
        type: "building",
        lifeform: "kaelesh",
        metal: 87500,
        crystal: 25e3,
        deut: 3e4,
        energy: 40,
        priceFactor: 1.2,
        energyIncreaseFactor: 1.02,
        bonus1BaseValue: 200,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 4e4
      },
      14110: {
        type: "building",
        lifeform: "kaelesh",
        metal: 15e4,
        crystal: 3e4,
        deut: 3e4,
        energy: 140,
        priceFactor: 1.4,
        energyIncreaseFactor: 1.05,
        bonus1BaseValue: 2,
        bonus1IncreaseFactor: 1,
        bonus1Max: .3,
        durationfactor: 1.8,
        durationbase: 52e3
      },
      14111: {
        type: "building",
        lifeform: "kaelesh",
        metal: 75e3,
        crystal: 5e4,
        deut: 55e3,
        energy: 90,
        priceFactor: 1.2,
        energyIncreaseFactor: 1.04,
        bonus1BaseValue: 1.5,
        bonus1IncreaseFactor: 1,
        bonus1Max: .7,
        durationfactor: 1.3,
        durationbase: 9e4
      },
      14112: {
        type: "building",
        lifeform: "kaelesh",
        metal: 5e5,
        crystal: 25e4,
        deut: 25e4,
        energy: 100,
        priceFactor: 1.4,
        energyIncreaseFactor: 1.05,
        bonus1BaseValue: .5,
        bonus1IncreaseFactor: 1,
        bonus1Max: .3,
        durationfactor: 1.3,
        durationbase: 95e3
      },
      14201: {
        type: "tech 1",
        lifeform: "kaelesh",
        metal: 1e4,
        crystal: 6e3,
        deut: 1e3,
        priceFactor: 1.5,
        bonus1BaseValue: .03,
        bonus1IncreaseFactor: 1,
        bonus1Max: .3,
        durationfactor: 1.4,
        durationbase: 1e3
      },
      14202: {
        type: "tech 2",
        lifeform: "kaelesh",
        metal: 7500,
        crystal: 12500,
        deut: 5e3,
        priceFactor: 1.5,
        bonus1BaseValue: .08,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 2e3
      },
      14203: {
        type: "tech 3",
        lifeform: "kaelesh",
        metal: 15e3,
        crystal: 1e4,
        deut: 5e3,
        priceFactor: 1.5,
        bonus1BaseValue: .05,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        durationfactor: 1.4,
        durationbase: 2500
      },
      14204: {
        type: "tech 4",
        lifeform: "kaelesh",
        metal: 2e4,
        crystal: 15e3,
        deut: 7500,
        priceFactor: 1.5,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 3500
      },
      14205: {
        type: "tech 5",
        lifeform: "kaelesh",
        metal: 25e3,
        crystal: 2e4,
        deut: 1e4,
        priceFactor: 1.5,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 4500
      },
      14206: {
        type: "tech 6",
        lifeform: "kaelesh",
        metal: 5e4,
        crystal: 5e4,
        deut: 2e4,
        priceFactor: 1.3,
        bonus1BaseValue: .4,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 5e3
      },
      14207: {
        type: "tech 7",
        lifeform: "kaelesh",
        metal: 7e4,
        crystal: 4e4,
        deut: 2e4,
        priceFactor: 1.5,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .99,
        durationfactor: 1.3,
        durationbase: 5500
      },
      14208: {
        type: "tech 8",
        lifeform: "kaelesh",
        metal: 8e4,
        crystal: 5e4,
        deut: 2e4,
        priceFactor: 1.2,
        bonus1BaseValue: .6,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 6e3
      },
      14209: {
        type: "tech 9",
        lifeform: "kaelesh",
        metal: 32e4,
        crystal: 24e4,
        deut: 1e5,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 6500
      },
      14210: {
        type: "tech 10",
        lifeform: "kaelesh",
        metal: 85e3,
        crystal: 4e4,
        deut: 35e3,
        priceFactor: 1.2,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.2,
        durationbase: 7e3
      },
      14211: {
        type: "tech 11",
        lifeform: "kaelesh",
        metal: 12e4,
        crystal: 3e4,
        deut: 25e3,
        priceFactor: 1.5,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 7500
      },
      14212: {
        type: "tech 12",
        lifeform: "kaelesh",
        metal: 1e5,
        crystal: 4e4,
        deut: 3e4,
        priceFactor: 1.5,
        bonus1BaseValue: .06,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.3,
        durationbase: 8e3
      },
      14213: {
        type: "tech 13",
        lifeform: "kaelesh",
        metal: 2e5,
        crystal: 1e5,
        deut: 1e5,
        priceFactor: 1.5,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        bonus1Max: .99,
        durationfactor: 1.3,
        durationbase: 8500
      },
      14214: {
        type: "tech 14",
        lifeform: "kaelesh",
        metal: 16e4,
        crystal: 12e4,
        deut: 5e4,
        priceFactor: 1.5,
        bonus1BaseValue: 1,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 9e3
      },
      14215: {
        type: "tech 15",
        lifeform: "kaelesh",
        metal: 24e4,
        crystal: 12e4,
        deut: 12e4,
        priceFactor: 1.5,
        bonus1BaseValue: .1,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 9500
      },
      14216: {
        type: "tech 16",
        lifeform: "kaelesh",
        metal: 32e4,
        crystal: 24e4,
        deut: 1e5,
        priceFactor: 1.5,
        bonus1BaseValue: .3,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 1e4
      },
      14217: {
        type: "tech 17",
        lifeform: "kaelesh",
        metal: 5e5,
        crystal: 3e5,
        deut: 2e5,
        priceFactor: 1.5,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        bonus1Max: .5,
        bonus2BaseValue: .2,
        bonus2IncreaseFactor: 1,
        bonus2Max: .99,
        durationfactor: 1.3,
        durationbase: 13e3
      },
      14218: {
        type: "tech 18",
        lifeform: "kaelesh",
        metal: 3e5,
        crystal: 18e4,
        deut: 12e4,
        priceFactor: 1.7,
        bonus1BaseValue: .2,
        bonus1IncreaseFactor: 1,
        durationfactor: 1.4,
        durationbase: 11e3
      }
    } [parseInt(e)]
  }
  static getAllExpeditionsText() {
    return {
      nothing: ["bueno ahora sabemos que esas anomalías r", "tu flota expedición siguió unas peculiar", "un ser pura energía causó que toda la tr", "a pesar los prometedores escaneos prelim", "quizás no deberíamos haber celebrado el ", "podivný počítačový virus nakazil navigač", "dziwny wirus komputerowy zaatakował syst", "krátko po opustení našej slnečnej sústav", "udover nogle underlige smådyr på en uken", "un virus calculator a atacat sistemele n", "een onbekend computervirus is in het nav", "egy ismeretlen számítógép vírus támadta ", "uno strano virus per computer ha intacca", "a strange computer virus attacked the na", "un virus informatique a fait planter vot", "un extraño virus informático atacó el si", "ein seltsames computervirus legte kurz n", "um virus computador atacou o sistema nav", "το σύστημα ναυσιπλοϊας προσβλήθηκε από κ", "evrenin tüm yönbulma sistemleri garip bi", "экспедиция не принесла ничего особого кр", "celá expedice strávila mnoho času zírání", "żywa istota zbudowana z czystej energii ", "neznáma životná forma z čistej energie s", "en skabelse af ren energi sikrede at eks", "o fiinta formata din energie pura s-a as", "een levensvorm van pure energie hypnotis", "egy élőlény akit tiszta energiából csiná", "una forma di vita di pura energia ha fat", "a living being made out of pure energy c", "une forme vie composée d`énergie pure a ", "un ser pura energía se aseguró que todos", "eine lebensform aus reiner energie hat d", "um ser feito energia hipnotizou toda a t", "μια οντότητα αποτελούμενη από καθαρή ενέ", "bu kesif seni kelimenin tam anlamiyla ev", "несмотря на первые многообещающие сканы ", "porucha v reaktoru velitelské lodi málem", "awaria reaktora głównego statku ekspedyc", "kaptajnens fødselsdagsfest burde nok ikk", "un esec la reactorul navei lider aproape", "een storing in reactor van het moedersch", "a vezető hajó reaktorának meghibásodása ", "un problema al reattore della nave ammir", "a failure in the flagships reactor core ", "un problème réacteur a failli détruire t", "un fallo en los motores la nave insignia", "ein reaktorfehler des führungsschiffes h", "um problema no reactor da nave principal", "μια αποτυχία στον αντιδραστήρα του ηγούμ", "bu kesif sonucunda kücük garip bir yarat", "неполадка в реакторе ведущего корабля чу", "někdo nainstaloval na palubní počítače e", "ekspedycja niemalże została złapana prze", "oslava kapitánových narodenín na povrchu", "det nye navigationsmodul har stadigvæk n", "iemand heeft een oud strategiespel geïns", "valaki feltelepített egy régi stratégiai", "qualcuno ha installato un antico gioco d", "due to a failure in the central computer", "quelqu`un a installé un jeu stratégie su", "alguien instaló un viejo juego estrategi", "irgendjemand hat auf allen schiffscomput", "alguém instalou um velho jogo estratégia", "κάποιος εγκατέστησε ένα παλιό παιχνίδι σ", "filo merkez gemisinin reaktöründeki hata", "жизненная форма состоящая из чистой энер", "tvá expedice se poučila o prázdnosti tét", "ekspedycja napotkała na rozległą pustkę ", "din ekspedition har lært om store tomrum", "expeditia ta a invatat despre pustietate", "de expeditie heeft uitgebreid onderzoek ", "az expedíciód megtanulta mi a nagy üres ", "la tua spedizione si è imbattuta nel vuo", "your expedition has learnt about the ext", "votre expédition a découvert le vide pas", "tu expedición aprendió acerca del extens", "deine expedition hat wortwörtlich mit de", "a tripulação descobriu o significado da ", "η αποστολή έμαθε για το αχανές κενό του ", "bu bölgeden gelen ilk raporlar cok ilgi ", "ваша экспедиция в прямом смысле слова по", "あなたの艦隊はこの空間にはなにもないことを学んだ、小惑星や何か分子でさえ存在しな", "zdá se že jsme na té osamělé planetě nem", "naš ekspedicijski tim je naišao na čudnu", "ktoś zainstalował w komputerach statku s", "en fejl i moderskibets reaktor ødelagde ", "echipa noastră expediție a ajuns la o co", "waarschijnlijk was het toch geen goed id", "valószínűleg a kapitányok szülinapi ünne", "forse le celebrazioni per il compleanno ", "our expedition team came across a strang", "nous n`aurions peut-être pas dû fêter l`", "probablemente la celebración del cumplea", "vielleicht hätte man den geburtstag des ", "provavelmente a festa aniversário do cap", "τα γενέθλια του καπετάνιου μάλλον δεν έπ", "ilginc bir sekilde gemi mürettabindan bi", "ваша экспедиция сделала замечательные сн", "až na pár prvních velmi slibných scannů ", "iako su prva skeniranja sektora bila dob", "mimo pierwszych obiecujących skanów tego", "den nye og vovede kommandør har med succ", "in ciuda primelor foarte promitatoare sc", "ondanks veelbelovende scans van deze sec", "az eleinte ígéretes letapogatási eredmén", "nonostante la prima scansione mostrasse ", "despite the first very promising scans o", "malgré un scan du secteur assez promette", "a pesar los resultados iniciales escaneo", "trotz der ersten vielversprechenden scan", "embora este sector tenha mostrado result", "δυστυχώς παρά τις πολλά υποσχόμενες αρχι", "kesif filon acil durum sinyali yakaladi!", "ну по крайней мере мы теперь знаем что к", "už víme že ty podivné anomálie dokážou z", "teraz wiemy że czerwone anomalie klasy 5", "fajn - prinajmenšom už vieme že červené ", "ei bine acum stim ca acele anomalii rosi", "hoe dan ook we weten nu in ieder geval d", "nos mostmár tudjuk hogy azok a piros 5-ö", "bene ora sappiamo che le anomalie rosse ", "well now we know that those red class 5 ", "bien nous savons désormais que les anoma", "bueno ahora sabemos que esas 5 anomalías", "nun zumindest weiß man jetzt dass rote a", "bem agora sabemos que aquelas anomalias ", "τώρα λοιπόν γνωρίζουμε πως αυτές οι αστρ", "galiba kaptanin dogumgününün bu bilinmed", "вскоре после выхода за пределы солнечной", "expedice pořídila skvělé záběry supernov", "podczas wyprawy zrobiono wspaniałe zdjęc", "expedícii sa podarilo zaznamenať úžasné ", "expeditia ta a facut poze superbe la o s", "je expeditie heeft adembenemende foto`s ", "az expedíciód egy fantasztikus képet kés", "la tua spedizione ha fatto stupende foto", "your expedition took gorgeous pictures o", "votre expédition a fait superbes images ", "tu expedición hizo magníficas fotos una ", "deine expedition hat wunderschöne bilder", "a expedição tirou lindas fotos uma super", "η αποστολή έβγαλε μερικές φαντασμαγορικέ", "kesif filon supernova` nin cok güzel res", "думаю не стоило всё-таки отмечать день р", "expedice po nějakou dobu sledovala podiv", "ekspedycja śledziła dziwny sygnał od jak", "expedičná flotila sledovala zvláštny sig", "din ekspeditionsflåde opsnapper nogle un", "flota ta expeditie a urmarit niste semna", "je expeditievloot heeft korte tijd vreem", "az expedíciós flottád különös jeleket kö", "la tua flotta in esplorazione ha seguito", "your expedition fleet followed odd signa", "votre expédition a suivi la trace signau", "tu flota en expedición siguió señales fu", "deine expeditionsflotte folgte einige ze", "a tua frota expedição seguiu uns sinais ", "η αποστολή σας ακολούθησε περίεργα σήματ", "eh en azindan simdi herkes 5 siniftan ki", "кто-то установил на всех корабельных ком", "až na pár malých zvířátek z neznámé baži", "ekspedicija nije vratila ništa drugo osi", "poza osobliwymi małymi zwierzętami pocho", "okrem zvláštneho domáceho zvieratka z ne", "cu exceptia unor animale mici pe o plane", "behalve een bijzonder vreemd klein dier ", "néhány kicsi furcsa háziállaton kívül am", "eccetto alcuni quaint piccoli animali pr", "besides some quaint small pets from a un", "mis à part quelques petits animaux prove", "además algunos pintorescos pequeños anim", "außer einiger kurioser kleiner tierchen ", "para além uns pequenos e esquisitos anim", "εκτός από μερικά περίεργα μικρά ζώα από ", "bir ara kesif filona garip sinyaller esl", "ваш экспедиционный флот следовал некотор", "あなたの艦隊は沼地の惑星で風変わりなペットを見つけた以外に何も収穫がありませんで", "tvá expedice málem nabourala do neutrono", "vaša ekspedicija je naletjela u gravitac", "ktoś zainstalował w komputerach statku s", "ekspeditionsflåden kom tæt på gravitatio", "expeditia ta aproape că a nimerit in câm", "je expeditie kwam bijna in een zwaartekr", "az expedíciód túl közel került egy neutr", "la tua spedizione si è imbattuta nel cam", "your expedition nearly ran into a neutro", "votre flotte d`expédition a eu chaud ell", "tu expedición casi entra en el campo gra", "deine expeditionsflotte geriet gefährlic", "a tua frota entrou no campo gravitaciona", "η αποστολή σας παραλίγο να εγκλωβιστεί σ", "tüm mürettebatın saf enerjiden oluşan bi", "ваш экспедиционный флот попал в опасную ", "chyba nie powinniśmy byli urządzać przyj", "a strange computer virus infected the sh", "the expeditionary fleet followed the str", "tu expedición se ha enfrentado textualme", "aparte unos pintorescos animalitos prove", "a sua frota expedição seguiu uns sinais ", "um estranho vírus computador atacou ao s", "apesar inicialmente esse setor ter mostr", "uma falha no reator da nave principal qu", "a sua expedição entrou no campo gravitac", "a sua expedição descobriu o significado ", "além uns pequenos e esquisitos animais u", "din ekspedition tog fantastiske billeder", "en underlig computervirus angreb navigat", "på grund af en fejl i det centrale compu", "trods det første meget lovende skan af s", "tja nu ved vi at der røde klasse 5 urege", "retkikuntasi otti mahtavia kuvia superno", "retkikuntasi seurasi outoja signaaleja j", "outo tietokonevirus iski navigaatiojärje", "lippulaivan keskustietokoneessa ilmennee", "puhtaasta energiasta tehty elävä pakotti", "huolimatta erittäin lupaavista ensimmäis", "retkikuntajoukkueemme saapui oudolle sii", "no nyt tiedämme että noilla punaisilla l", "vika lippulaivan reaktorin ytimessä lähe", "retkiuntasi lähes ajautui neutronitähden", "retkikuntasi on oppinut paljon avaruuden", "lukuunottamatta joitakin vanhanaikaisia ", "zbog otkazivanja brodskog reaktora jedno", "čudni računalni virus je zarazio brodsku", "sada znamo da te crvene anomalije klase ", "vaša ekspedicija je prikupila nova sazna", "vasa ekspedicija je snimila prelijepe sl", "ekspedicijska flota je pratila čudan sig", "netko je instalirao staru stratešku igru", "živo biće napravljeno od čiste energije ", "旗艦の動力炉の故障によりあなたの艦隊は壊滅しかけました。幸いにも有能な技術者によ", "あなたの艦隊は中性子惑星の引力に曳かれ、脱出するのに幾ばくかの時間がかかりました", "あなたの探索チームは、はるか昔に廃れた妙なコロニーにたどり着いた。\n着陸後、乗組", "我々の本星のある太陽系を脱出するとすぐに、奇妙なコンピューターウイルスがナビゲー", "私たちはクラス５に分類されるエリアは船のナビゲーションシステムを狂わすだけではな", "あなたの艦隊は素晴らしい超新星の写真を撮ることに成功した。探索としては特に何も無", "あなたの艦隊は奇妙なシグナルに近づきました。そしてそれは異星人の調査船の動力炉か", "旗艦のメインコンピューターの故障により探索任務は中止されました。残念ながら艦隊は", "艦隊に接近してきた小型エネルギー生命体によってあなたの艦隊の乗組員は睡眠状態に陥", "とても見込みのある領域を探索したのにも関わらず、残念ながら収穫なしに帰還しました", "tu expedición ha aprendido sobre el exte", "cineva a instalat cu joc strategic vechi", "ett fel i ledarskeppets reaktor förstörd", "din expedition körde nästan in i ett gra", "förutom lite lustiga små djur från en ok", "kaptenens födelsedagsfest skulle kanske ", "ett konstigt datorvirus attackerade navi", "ja nu vet vi iallafall att där röda klas", "din expedition har lärt sig hur tom rymd", "din expedition tog läckra bilder utav en", "din expeditionsflotta följde några märkl", "någon installerade ett gammalt strategis", "en varelse gjord utav enbart energi gjor", "trots den första mycket lovande satellit", "zaradi odpovedi enega od ladijskih motor", "tvoja ekspedicija je naletela na gravita", "ekspedicija je prinesla nazaj samo neka ", "naša ekspedicija je naletela na čudno ko", "čuden virus je napadel navigacijski sist", "zdaj vsaj vemo da te rdeče razreda 5 ano", "tvoja ekspedicija je pridobila znanje o ", "tvoji ekspediciji je uspelo narediti vel", "ekspedicijska flota je nekaj časa spreml", "prišlo je do napake na računalniških sis", "naleteli smo na vesoljsko bitje ki je om", "čeprav so bile prve raziskave področja o", "porucha na reaktore veliteľskej lodi tak", "tvoja expedícia takmer skončila v gravit", "členovia výpravy sa počas expedície dôkl", "nejaký dobrák nainštaloval do palubného ", "napriek pozitívnym očakávaniam vychádzaj", "旗艦的反應器失常差點導致整個遠征探險艦隊覆滅值得慶幸的是技術專家們表現極為出色避", "您的遠征探險隊誤入了一顆中子星的引力場需要一段時間來掙脫該力場由於在掙脫時幾乎將", "在那個不知名的沼澤行星上除了一些新奇有趣的小動物這次遠征探險艦隊在旅程中一無所獲", "我們的遠征探險隊途徑一個已經廢棄很久的怪異殖民星降落以後我們的船員感染了一種外星", "就在剛離開我們母星太陽系宙域不久後一種怪異的電腦病毒入侵了導航系統這使得遠征探險", "現在我們已經知道了那些紅色5級異象不僅對艦船的導航系統帶來混亂干擾同時也使船員產", "您的遠征探險隊已對帝國遼闊的空域瞭如指掌這裡毫無新意甚至連一顆小行星或輻射源乃至", "您的遠征探險隊拍攝了超新星華麗的照片雖然遠征探險隊沒有帶回來任何新的發現但是最起", "您的遠征探險隊斷斷續續追蹤到一些奇怪的訊號後來才知道原來那些訊號是從古老的間諜衛", "由於旗艦的中央電腦系統發生錯誤探險任務不得不終止另外由於電腦故障的原因我們的艦隊", "一個散發著高純能量的生物悄然來到甲板上用意念控制所有的探險隊員令他們凝視著電腦熒", "儘管我們是第一個來到這個非常有希望的區域很不幸我們空手而歸\n\n通訊官日誌記錄似乎", "儘管我們是第一個來到這個非常有希望的區域很不幸我們空手而歸\n\n通訊官日誌記錄作為", "your expedition has learned about the ex"],
      early: ["tvá expedice nenalezla nic zajímavého v ", "twoja ekspedycja nie wykryła żadnych ano", "din ekspedition har ikke rapporteret nog", "je expeditie heeft geen rariteiten gevon", "az expedícióid nem jelentett semmilyen r", "la tua spedizione non riporta alcuna ano", "your expeditions doesn`t report any anom", "votre expédition ne signale aucune parti", "tu expedición no informa ninguna anomalí", "deine expedition meldet keine besonderhe", "a tua expedição não reportou qualquer an", "η αποστολή σας δεν αναφέρει ανωμαλίες στ", "tüm mürettebatın saf enerjiden oluşan bi", "неожиданное замыкание в энергетических к", "nečekané výboje v skladištích energie mo", "niespodziewane sprzężenie zwrotne w zwoj", "den nye og vovede kommandør har med succ", "o neasteptata explozie la motoarele din ", "een onverwachte terugkoppeling in energi", "váratlanul meghibásodtak a hajtóművek a ", "un componente inserito nel generatore di", "an unexpected back coupling in the energ", "un petit défaut dans les réacteurs votre", "un inesperado acoplamiento energía en lo", "eine unvorhergesehene rückkopplung in de", "um problema no reactor da nave principal", "μια απρόσμενη ανάστροφη σύζευξη στα ενερ", "kesfedilen bölgede olagandisi bir veriye", "отважный новый командир использовал нест", "nový a odvážný velitel letky úspěšně pro", "młody odważny dowódca pomyślnie przedost", "en uforudset tilbagekobling i energispol", "noul si putin indraznetul comandant a tr", "je nieuwe en ongeremde vlootcommandant h", "az új és kicsit merész parancsnok sikere", "il nuovo e audace comandante ha usato co", "the new and daring commander successfull", "votre nouveau commandant bord étant asse", "¡el nuevo y un poco atrevido comandante ", "der etwas wagemutige neue kommandant nut", "um comandante novo e destemido conseguiu", "ο νέος και τολμηρός διοικητής ταξίδευσε ", "motor takımlarının enerji halkalarında y", "ваша экспедиция не сообщает ничего необы", "keşif filon bir şekilde nötron yıldızlar", "geminin yeni komutani oldukca cesur cikt", "a sua expedição não reportou nenhuma ano", "retikuntasi ei raportoi mitään poikkeami", "el nuevo comandante que es bastante osad", "o novo e destemido comandante conseguiu ", "uusi ja rohkea komentaja ohjasi laivueen", "novi i odvažni komander je uspješno puto", "izvještaji ekspedicije ne javljaju nikak", "新任の勇敢な指揮官は不安定なワームホールを通って帰還を早めることに成功しました。", "あなたの艦隊は探索した地域で異変を発見することはできませんでした。しかし、艦隊は", "expeditia ta nu raporteaza nici o anorma", "den nya och lite orädda befälhavaren lyc", "dina expeditioner rapporterar inga avvik", "novi poveljnik je uspešno potoval skozi ", "poročila ekspedicije ne poročajo o nikak", "nový mimoriadne ctižiadostivý veliteľ ús", "naša výprava nehlási žiadne anomálie v s", "年輕而膽識過人的指揮官成功穿越了一個不穩定的蟲洞減少了返回的飛行時間!而然這支遠", "您的遠征探險艦隊報告稱在遠征探險的宇宙空域內並沒有找到什麼異象正當他們返回之時艦", "um problema inesperado no campo energéti", "odottamaton takaisinkytkentä moottorin e", "neke anomalije u motorima ekspedicijskih", "en oväntad omvänd koppling i energispola", "anomalije v motorjih ekspedicijskih ladi", "neočakávané spätné výboje v pohonných je", "在引擎的能源軸線上發生了一個未能預期耦合逆轉狀況導致艦隊加速了返回時間遠征探險艦"],
      late: ["debido a motivos desconocidos el salto l", "tu expedición entró en un sector asolado", "z neznámých důvodů se expedice vynořila ", "z nieznanych powodów ekspedycja nieomal ", "z neznámych dôvodov sa expedícii podaril", "på grund af en ukendt fejl gik ekspediti", "datorita motivelor necunoscute saltul ex", "door onbekende oorzaak is expeditiespron", "ismeretlen okok miatt az expedíciós ugrá", "per ragioni sconosciute il salto nell`ip", "for unknown reasons the expeditions jump", "pour une raison inconnue le saut spatial", "a causa razones desconocidas el salto la", "aus bisher unbekannten gründen ging der ", "devido a razões ainda desconhecidas o sa", "για άγνωστη αιτία το άλμα της αποστολής ", "kırmızı devin yildiz rüzgari yüzünden ke", "халтурно собранный навигатор неправильно", "tvůj navigátor se dopustil vážné chyby v", "główny nawigator miał zły dzień co spowo", "navigátor výpravy sa dopustil hrubej chy", "din navigationschef havde en dårlig dag ", "de navigatieleider had een slechte dag w", "a navigációs vezetőnek rossz napja volt ", "una svista commessa dal capo-navigazione", "your navigator made a grave error in his", "une erreur calcul votre officier navigat", "el líder la navegación tuvo un mal día y", "ein böser patzer des navigators führte z", "um erro no sistema navegação fez com que", "ο κυβερνήτης της αποστολής δε κοιμήθηκε ", "sebebi bilinmeyen bir arizadan dolayi gö", "новый навигационный модуль всё-таки имее", "nový navigační modul má pořád nějaké mou", "ekspeditionens moderskib havde et sammen", "noul modul navigare inca se lupta cu une", "de nieuwe navigatiemodule heeft nog een ", "kesif filon tanecik fırtınası yaşanan bi", "звёздный ветер от красного гиганта исказ", "nowy system nawigacyjny nadal nie jest w", "das neue navigationsmodul hat wohl doch ", "o novo módulo navegação ainda tem alguns", "a navigációs modul még hibákkal kűzd az ", "il nuovo modulo di navigazione sta ancor", "the new navigation module is still buggy", "votre module navigation semble avoir que", "el nuevo módulo navegación está aún luch", "το νέο σύστημα ναυσιπλοΐας αντιμετωπίζει", "kesif merkez gemin hicbir uyarida bulunm", "по пока неустановленным причинам прыжок ", "sluneční vítr rudého obra překazil skok ", "gwiezdny wiatr wiejący ze strony czerwon", "din navigationschef havde en dårlig dag ", "vantul unei stele ale unui gigant rosu a", "de zonnewind van een rode reus verstoord", "egy vörös óriás csillagszele tönktretett", "il vento-stellare di una gigante rossa h", "the solar wind of a red giant ruined the", "le vent solaire causé par une supernova ", "el viento una estrella gigante roja arru", "der sternwind eines roten riesen verfäls", "o vento solar uma gigante vermelha fez c", "ο αστρικός άνεμος ενός κόκκινου γίγαντα ", "kesif filon navigasyon sistemindeki önem", "ваша экспедиция попала в сектор с усилен", "tvoje expedice se dostala do sektoru pln", "ekspedicija je završila u sektoru sa olu", "twoja ekspedycja osiągnęła sektor pełen ", "din ekspedition er kommet ind i en parti", "expediția a ajuns în mijlocul unei furtu", "je expeditie komt terecht in een sector ", "az expedíciód egy részecskeviharral teli", "la tua spedizione è andata in un settore", "your expedition went into a sector full ", "votre expédition a dû faire face à plusi", "tu expedición entró en un sector lleno t", "deine expedition geriet in einen sektor ", "a missão entrou num sector com tempestad", "η αποστολή σας βρέθηκε σε τομέα σωματιδι", "yeni yönbulma ünitesi hala sorunlarla sa", "ведущий корабль вашего экспедиционного ф", "velitelská loď expedice se při výstupu z", "główny statek ekspedycyjny zderzył się z", "nava mama a expeditiei a facut o coliziu", "het moederschip van expeditie is in bots", "az expedició fő hajója ütközött egy ideg", "la nave ammiraglia della tua spedizione ", "the expedition`s flagship collided with ", "un vos vaisseaux est entré en collision ", "la nave principal la expedición colision", "das führungsschiff deiner expeditionsflo", "a nave principal colidiu com uma nave es", "η ναυαρχίδα της αποστολής συγκρούστηκε μ", "el viento estelar una gigante roja ha ar", "el nuevo módulo navegación aún está lidi", "un pequeño fallo del navegador provocó u", "el nuevo módulo navegación está aún llen", "a missão entrou num setor com tempestade", "o vento uma estrela vermelha gigante fez", "stjernevinden i en gigantisk rød stjerne", "retkikuntasi päätyi hiukkasmyrskyn täytt", "tuntemattomista syistä lentorata oli tot", "punaisen jättiläisen aurinkotuuli pilasi", "navigaatiomoduuli on silti buginen retki", "navigaattori teki vakavan virheen laskel", "a nave principal da expedição colidiu co", "retkikuntasi lippulaiva vieraaseen aluks", "ekspedicijska flota se susrela sa neprij", "navigator glavnog broda je imao loš dan ", "zbog nepoznatih razloga ekspedicijski sk", "gravitacija crvenog diva uništila je sko", "novi navigacijski modul još uvijek ima n", "異星の宇宙船があなたの旗艦に衝突しました。その際相手の宇宙船が爆発し、あなたの旗", "あなたの航海士は艦隊の航路を決めるにあたって深刻な計算ミスを犯しました。その結果", "あなたの艦隊は宇宙嵐に巻き込まれました。結果動力炉は壊れ、宇宙船の基幹システムは", "原因不明の事態により艦隊は予定とは違う場所にたどり着きました。危うく太陽に不時着", "恒星からの太陽風で航路は大きくずれました。\nその空間には全くなにもありませんでし", "新しいナビゲーションシステムにはまだバグが残っていました。それは艦隊を間違った座", "el líder en la navegación tuvo un mal dí", "el viento una estrella gigante roja ha a", "liderul navigatiei a avut o zi proasta s", "флагманский корабль вашего экспедиционно", "när expeditionen avslutade hyperrymdshop", "navigationsledaren hade en dålig dag och", "din expedition hamnade i en sektor fylld", "på grund av okända orsaker så blev exped", "stjärnvinden hos en röd jätte förstörde ", "den nya navigationsmodulen jobbar fortfa", "ekspedicijska flota je naletela na nezna", "poveljnik ekspedicije je imel slab dan i", "tvoja ekspedicijska flota je zašla v nev", "zaradi neznanih razlogov je naša ekspedi", "solarni veter od zvezde velikanke je pov", "novi navigacijski sistem ima še vedno na", "veliteľská loď sa dostala do kolízie s c", "expedícia sa dostala do oblasti postihnu", "slnečný vietor červeného obra kompletne ", "nový navigačný modul má stále vážne nedo", "一艘外來艦船突然跳躍到遠征探險艦隊中心與我們遠征探險隊旗艦相撞了外來艦船繼而爆炸", "您的電腦導航系統發生一個嚴重錯誤導致遠征探險隊空間跳躍失敗不但造成艦隊完全失去目", "您的遠征探險艦隊誤闖入了一個粒子風暴區域這使得能源供給出現超負荷現象並且大部分的", "由於不明原因遠征探險艦隊的空間跳躍總是頻頻出錯這次更離譜竟然跳到一顆恒星的心臟地", "一顆紅巨星的太陽風破壞了遠征探索艦隊的空間跳躍並令到艦隊不得不花費更多的時間來重", "新導航系統組件仍然有問題遠征探索艦隊的空間跳躍錯誤不僅使得他們去錯目的地更使得艦"],
      alien: ["exoticky vypadající lodě neznámého původ", "kilka egzotycznie wyglądających statków ", "ekspeditionens moderskib havde et sammen", "niste nave aparent exotice au atacat flo", "onbekende exotisch ogende schepen vallen", "egzotikus megjelenésű hajók támadták meg", "alcune navi straniere hanno attaccato la", "some exotic looking ships attacked the e", "des vaisseaux inconnus ont attaqué la fl", "¡algunas naves apariencia exótica atacar", "einige fremdartig anmutende schiffe habe", "algumas naves exóticas atacaram a frota ", "μερικά σκάφη με εντυπωσιακή εμφάνιση επι", "kücük bir grup bilinmeyen gemi tarafinda", "на вашу экспедицию напал вражеский флот ", "何隻かの見慣れない宇宙船が警告無しに攻撃してきました。", "tvá expedice provedla ne-úplně-přátelské", "twoja ekspedycja napotkała niezbyt przyj", "din ekspeditionsflåde havde ikke en venl", "je expeditievloot heeft een onvriendelij", "a felderítő expedíciód elsőre nem túl ba", "la tua flotta in esplorazione non ha avu", "your expedition fleet had an unfriendly ", "la flotte d`expédition a eu une rencontr", "tu expedición no hizo un primer contacto", "deine expeditionsflotte hatte einen nich", "a tua frota exploração teve um primeiro ", "ο εξερευνητικός στόλος σας ήρθε σε όχι κ", "kesif ekibimiz bilinmeyen bir tür ile hi", "огромная армада хрустальных кораблей неи", "naše expedice byla přepadena malou skupi", "vores ekspedition blev angrebet af en mi", "expeditia noastra a fost atacata un grup", "onze expeditie is aangevallen door een k", "неизвестная раса атакует наш экспедицион", "nasza ekspedycja została zaatakowana prz", "unsere expedition wurde von einer kleine", "az expedíciónkat egy kisebb csapat ismer", "la nostra spedizione è stata attaccata d", "our expedition was attacked by a small g", "notre expédition a été attaquée par un p", "¡nuestra expedición fue atacada por un p", "a nossa missão foi atacada por um pequen", "η αποστολή δέχτηκε επίθεση από ένα μικρό", "ваш экспедиционный флот по всей видимост", "neznámí vetřelci zaútočili na naši exped", "nieznani obcy atakują twoją ekspedycję!", "expeditia noastra a fost atacata un grup", "een onbekende levensvorm valt onze exped", "egy ismeretlen faj megtámadta az expedíc", "una specie sconosciuta sta attaccando la", "an unknown species is attacking our expe", "une espèce inconnue attaque notre expédi", "¡una especie desconocida ataca nuestra e", "eine unbekannte spezies greift unsere ex", "uma espécie desconhecida atacou a nossa ", "связь с нашим экспедиционным флотом прер", "spojení s expediční letkou bylo přerušen", "kontakt z naszą ekspedycją został przerw", "de verbinding met onze expeditievloot we", "a kapcsolat az expedíciós flottával nemr", "il collegamento con la nostra spedizione", "the connection to our expedition fleet w", "nous avons perdu temporairement le conta", "el contacto con nuestra expedición fue i", "die verbindung zu unserer expeditionsflo", "a ligação com nossa frota exploratória f", "ваш экспедиционный флот испытал не особо", "tvá expedice narazila na území ovládané ", "úgy néz ki hogy a felfedező flottád elle", "la tua flotta in spedizione sembra aver ", "your expedition fleet seems to have flow", "votre flotte d`expédition a manifestemen", "tu expedición parece haber entrado en un", "deine expeditionsflotte hat anscheinend ", "tudo indica que a tua frota entrou em te", "ο στόλος της αποστολής εισχώρησε σε μια ", "какие-то корабли неизвестного происхожде", "mieliśmy trudności z wymówieniem dialekt", "je expeditie is het territorium van onbe", "volt egy kis nehézségünk az idegen faj n", "abbiamo avuto difficoltà a pronunciare c", "we had a bit of difficulty pronouncing t", "nous avons rencontré quelques difficulté", "tuvimos dificultades para pronunciar cor", "wir hatten mühe den korrekten dialekt ei", "encontrámos algumas dificuldades em pron", "на нашу экспедицию напала небольшая груп", "een grote onbekende vloot van kristallij", "una grande formazione di navi cristallin", "a large armada of crystalline ships of u", "une flotte vaisseaux cristallins va entr", "una gran formación naves cristalinas ori", "ein großer verband kristalliner schiffe ", "uma grande frota naves cristalinas orige", "язык этой расы труден в произношении сов", "tvá expedice narazila na mimozemskou inv", "twoja flota natrafiła na silną flotę obc", "az expedíciód egy idegen invázióba flott", "your expedition ran into an alien invasi", "votre mission d`expédition a rencontré u", "tu expedición encontró una flota alien i", "deine expedition ist in eine alien-invas", "a tua frota exploração foi atacada por u", "tu flota expedición no tuvo un primer co", "a sua frota expedição teve um primeiro c", "retkikuntalaivueesi loi vihamielisen ens", "¡unas naves exótico aspecto atacaron la ", "et fremmedartet skib angriber din eksped", "eksoottisen näköisiä aluksia hyökkäsi re", "neki brodovi egzotičnog izgleda su napal", "tvoja ekspedicijska flota nije napravila", "あなたの艦隊は友好的ではない正体不明の種族と接触しました。\n\n通信主任の報告書：", "flota ta expeditie a avut un prim contac", "några skepp med exotiskt utseende attack", "din expeditionsflotta har för första gån", "ladje eksotičnega izgleda so napadle naš", "tvoja ekspedicijska flota je imela nepri", "exoticky vyzerajúce lode bez výstrahy za", "naša expedícia má za sebou nie príliš pr", "egzotik görünüslü tarafimizca bilinmeyen", "一批奇形怪狀的外星艦船在事先毫無警告之下襲擊了我們的遠征探險艦隊!\n\n通訊官日誌", "您的遠征探險艦隊與一未知種族的外星人發生了首場衝突接觸\n\n通訊官日誌記錄作為第一", "your expedition fleet made some unfriend"],
      pirate: ["interceptamos comunicaciones unos pirata", "museli jsme bojovat s vesmírnými piráty ", "musieliśmy walczyć z piratami na szczęśc", "am fost nevoiti sa ne luptam cu niste pi", "we moesten ons verdedigen tegen enkele p", "szükségünk van harcra néhány kalózzal sz", "abbiamo dovuto combattere alcuni pirati ", "we needed to fight some pirates which we", "nous avons dû nous défendre contre des p", "tuvimos que luchar contra algunos pirata", "wir mussten uns gegen einige piraten weh", "tivemos combater com uns piratas que por", "έπρεπε να αντιμετωπίσουμε μερικούς πειρα", "bazi ilkel barbarlar bize uzaygemisi ola", "пойманные сигналы исходили не от иноплан", "zachytili jsme radiovou zprávu od nějaký", "odebraliśmy sygnał radiowy od jakichś pi", "zachytili a dekódovali sme správu ožraté", "vi har sporet nogle berusede pirater der", "am prins un mesaj radio la niste pirati ", "we vingen een radiobericht op van enkele", "elfogtunk egy rádió üzenetet ami ittas k", "abbiamo intercettato messaggi di alcuni ", "we caught some radio transmissions from ", "nous avons capté des messages provenant ", "capturamos algunos mensajes radio alguno", "wir haben ein paar funksprüche sehr betr", "apanhamos umas mensagens via rádio e est", "υποκλέψαμε κάποια ραδιοσήματα από κάποιο", "karsimiza cikan uzay korsanlari neyseki ", "экспедиционный флот сообщает о жестоких ", "nějací primitivní barbaři na nás útočí z", "jacyś prymitywni barbarzyńcy atakują nas", "nogle primitive barbarer angriber os med", "niste pirati ne ataca cu nave inferior t", "enkele primitieve barbaren vallen ons aa", "néhány primitív barbár támadt ránk olyan", "alcuni barbari primitivi ci stanno attac", "some primitive barbarians are attacking ", "des barbares primitifs nous attaquent av", "algunos bárbaros primitivos están atacán", "einige primitive barbaren greifen uns mi", "uns bárbaros primitivos estão nos a atac", "μία πρωτόγονη φυλή πειρατών μας επιτίθετ", "kücük bir grup bilinmeyen gemi tarafinda", "ваш экспедиционный флот пережил неприятн", "nějací naprosto zoufalí vesmírní piráti ", "jacyś bardzo zdesperowani piraci próbowa", "niekoľko zúfalých vesmírnych pirátov sa ", "cativa pirati ai spatiului foarte disper", "een paar wanhopige piraten hebben geprob", "néhány űr-kalóz megpróbálta elfoglalni a", "alcuni pirati dello spazio decisamente d", "some really desperate space pirates trie", "quelques pirates apparemment complètemen", "algunos piratas realmente desesperados i", "ein paar anscheinend sehr verzweifelte w", "alguns piratas desesperados tentaram cap", "μερικοί πραγματικά απελπισμένοι πειρατές", "bazı umutsuz uzay korsanları keşif filom", "мы попались в лапы звёздным пиратам! бой", "vletěli jsme přímo do pasti připravé hvě", "sygnał alarmowy wykryty przez ekspedycję", "we liepen in een hinderlaag van een stel", "belefutottunk egy csillag-kalóz támadásb", "siamo incappati in un`imboscata tesa da ", "we ran straight into an ambush set by so", "nous sommes tombés dans un piège tendu p", "¡caimos en una emboscada organizada por ", "wir sind in den hinterhalt einiger stern", "nós fomos directos para uma emboscada ef", "yildiz korsanlarinin kurdugu tuzagin tam", "сигнал о помощи на который последовала э", "nouzový signál který expedice následoval", "wpadliśmy prosto w pułapkę zastawioną pr", "semnalul urgenta pe care l-a urmat exped", "het noodsignaal dat expeditie volgde ble", "a segélykérő jelet amit követett az expe", "la richiesta di aiuto a cui la spedizion", "that emergency signal that the expeditio", "le message secours était en fait un guet", "la señal emergencia que la expedición si", "der hilferuf dem die expedition folgte s", "o sinal emergência que a expedição receb", "το σήμα κινδύνου που ακολουθήσαμε ήταν δ", "sarhos uzay korsanlarindan bazi telsiz m", "пара отчаянных космических пиратов попыт", "zware gevechten tegen piratenschepen wor", "la spedizione riporta feroci scontri con", "the expedition reports tough battles aga", "votre flotte d`expédition nous signale l", "¡tu expedición informa duras batallas co", "die expeditionsflotte meldet schwere käm", "o relatório expedição relata batalhas ép", "нам пришлось обороняться от пиратов кото", "expedice měla nepříjemné setkání s vesmí", "din ekspeditionsflåde havde et ufint sam", "expeditia ta a avut o intalnire neplacut", "az expedíciódnak elégedetlen találkozása", "la tua spedizione ha avuto uno spiacevol", "your expedition had an unpleasant rendez", "votre flotte d`expédition a fait une ren", "tu expedición tuvo un desagradable encue", "eine expeditionsflotte hatte ein unschön", "a tua expedição deparou-se com uma não m", "мы перехватили переговоры пьяных пиратов", "zarejestrowane sygnały nie pochodziły od", "het noodsignaal dat expeditie volgde ble", "i segnali registrati non provenivano da ", "the recorded signals didn`t come from a ", "les signaux que nous ne pouvions identif", "¡las señales no provenían un extranjero ", "die aufgefangenen signale stammten nicht", "os sinais gravados não foram emitidos po", "нас атакуют какие-то варвары и хотя их п", "votre expédition est tombée sur des pira", "unos piratas realmente desesperados inte", "tuvimos que luchar contra unos piratas q", "unos bárbaros primitivos están atacándon", "necesitamos luchar con algunos piratas q", "apanhamos algumas mensagens rádio alguns", "alguns piratas espaciais desesperados te", "nós tivemos combater com alguns piratas ", "alguns bárbaros primitivos estão nos ata", "nogle øjensynligt fortvivlede pirater ha", "under ekspeditionen blev vi nødt til at ", "nappasimme joitakin radiolähetyksiä juop", "todella epätoivoiset avaruuspiraatit yri", "meidän täytyi taistella piraatteja onnek", "jotkin alkukantaiset barbaarit hyökkäävä", "neki opaki pirati su pokušali zarobiti v", "primili smo radio poruku od nekog pijano", "flota se morala boriti protiv nekoliko p", "neki primitivni svemirski barbari nas na", "いくつかの海賊は捨て身であなたの艦隊を乗っ取ろうとします。\n\n通信主任の報告書：", "あなたの艦隊は泥酔した海賊から通信を受けました。それによるとあなたの艦隊はまもな", "あなたの艦隊はいくつかの海賊と戦う必要がありますが、幸いにもそれはほんの少しだけ", "あなたの艦隊を旧式の宇宙船で攻撃してきた野蛮人の中には海賊とは言えない者もいまし", "algunos piratas espaciales que al parece", "нас атакуют какие-то варвары их примитив", "några riktigt desperata rymdpirater förs", "vi hörde ett radiomeddelande från några ", "vi behövde slåss emot några pirater som ", "några primitiva vildar anfaller oss med ", "obupani pirati so se trudili da bi zajel", "zasegli smo sporočilo od piratov zgleda ", "boriti smo se morali proti piratom kater", "primitivni vesoljski barbari nas napadaj", "musíme sa vysporiadať s pirátskou zberbo", "akási primitívna skupina barbarov sa nás", "一些亡命的宇宙海盜嘗試洗劫我們的遠征探險艦隊\n\n通訊官日誌記錄作為第一批到此未被", "我們從一幫張狂的海盜處收到一些挑釁的無線電訊號看來我們即將遭受攻擊\n\n通訊官日誌", "我們不得不與那裡的海盜進行戰鬥慶幸的是對方艦船數不多\n\n通訊官日誌記錄作為第一批", "一群原始野蠻人正利用太空船向我們的遠征探險艦隊發起攻擊我們甚至連他們叫什麼名都全"],
      trader: ["tvá expedice se setkala s přátelskou ras", "flota ekspedycyjna nawiązała kontakt z p", "din ekspeditionsflåde har opnået kontakt", "onze expeditievloot heeft contact gemaak", "az expedíciós flottád kapcsolatba lépett", "la tua spedizione ha avuto contatto con ", "your expedition fleet made contact with ", "votre expédition a eu un bref contact av", "tu flota en expedición tuvo un corto con", "deine expeditionsflotte hatte kurzen kon", "a tua frota contactou com uma raça alien", "ο στόλος της αποστολής σας ήρθε σε επαφή", "kesif filon biraz utangac bir alien irki", "ваш экспедиционный флот вышел на контакт", "tvá expedice zachytila nouzový signál ve", "ekspedycja odebrała sygnał alarmowy ogro", "din ekspeditionsflåde opsnappede et nøds", "een noodoproep bereikte je expeditie een", "az expedíciód vészjelzést fogott egy meg", "la tua spedizione ha ricevuto un segnale", "your expedition picked up an emergency s", "votre flotte d`expédition a recueilli un", "tu expedición captura un grito ayuda era", "deine expeditionsflotte hatte ein notsig", "a tua expedição recebeu um sinal emergên", "η αποστολή σας έλαβε σήμα κινδύνου ένα μ", "ваш экспедиционный флот поймал сигнал по", "a sua frota expedição fez contato com um", "retkikuntasi oli yhteydessä ystävällisee", "a sua expedição recebeu um sinal emergên", "tu expedición captó un grito ayuda era u", "retkikuntasi poimi hätäsignaalin kesken ", "vaša ekspedicija je primila signal za hi", "vaša ekspedicijska flota je uspostavila ", "あなたの艦隊は任務中に救難信号を受信しました。救難信号は巨大な輸送艦から出されて", "あなたの艦隊は友好的な種族の異星人と接触しました。彼らはあなたにとって有益な資源", "expeditia ta a primit un semnal urgenta ", "flota ta expeditia a facut contactul cu ", "din expedition fick en alarmsignal en en", "din expeditionsflotta fick kontakt med e", "ekspedicija je zaznala klice na pomoč og", "ekspedicija je vzpostavila kontakt s sra", "naša expedícia zachytila núdzový signál ", "naša expedícia nadviazala kontakt s mier", "您的遠征探險艦隊在任務中發出一則緊急的訊號一艘巨型貨運船被一顆小行星的萬有引力力", "您的遠征探險艦隊與一友善的外星人種族進行了聯絡他們宣布他們將派遣一名代表與您的帝"],
      blackhole: ["jediná věc která po expedici zbyla je ná", "po naszej ekspedycji pozostała jedynie t", "singurul lucru ramas la expeditie a fost", "het enige dat is overgebleven van expedi", "az egyetlen dolog ami a küldetésből megm", "l`unica cosa che rimane dalla spedizione", "the only thing left from the expedition ", "voici le dernier signe vie l`expédition ", "lo único que quedó la expedición fue el ", "von der expedition ist nur noch folgende", "o último contacto que tivemos da frota e", "το μόνο που απέμεινε από την αποστολή εξ", "lider geminin ana reaktöründeki bir kayn", "от экспедиции осталось только следующее ", "roztavení jádra v hlavní lodi expedice v", "roztopienie rdzenia głównego statku powo", "o supra alimentare a miezului navei mama", "een ontploffing van hyperruimtemotor ver", "a vezető hajó magjának felmelegedése egy", "una rottura nel nucleo della nave ammira", "a core meltdown of the lead ship leads t", "un incident dans le noyau atomique d`un ", "una fusión del núcleo la nave insignia p", "ein kernbruch des führungsschiffes führt", "uma falha no núcleo do motor da nave-mãe", "ένα πρόβλημα στο σύστημα ψύξης του αντιδ", "раздробление ядра ведущего корабля вызва", "poslední informace od expedice byla velm", "jedina stvar koja je ostala od cijele ek", "ostatnią zdobyczą ekspedycji było napraw", "ultimul lucru pe care il avem la expedit", "het laatste bericht dat we ontvingen was", "az utolsó dolog amit az expedícióról kap", "l`ultima cosa che ci è stata inviata dal", "the last transmission we received from t", "l`expédition nous a envoyé des clichés e", "la última transmisión que obtuvimos la f", "das letzte was von dieser expedition noc", "as últimas imagens que obtivemos da frot", "последнее что удалось получить от экспед", "naše expedice se nevrátila zpět vědci st", "en kernenedsmeltning i moderskibet førte", "de expeditievloot kon niet terugvliegen ", "az expedíciós flotta nem ugrott vissza a", "notre flotte d`expédition a disparu aprè", "экспедиционный флот не вернулся из прыжк", "ekspedycja nie wykonała skoku powrotnego", "die expeditionsflotte ist nicht mehr aus", "la spedizione non è ritornata dal salto ", "contact with the expedition fleet was su", "el contacto con la flota expedición ha s", "a frota em missão não conseguiu voltar d", "ο στόλος εξερεύνησης δεν επέστρεψε ποτέ ", "la flota expedición no ha retornado al e", "la última transmisión que recibimos la f", "la última cosa que obtuvimos la expedici", "la flota en expedición no saltó vuelta a", "as últimas imagens que tivemos da frota ", "a frota em expedição não conseguiu volta", "den sidste radiotransmission vi modtog f", "ekspeditionsflåden kom ikke tilbage vore", "viimeinen lähetys retkikuntalaivueelta o", "retkikuntalaivue ei ikinä palannut lähis", "η τελευταία εικόνα που λήφθηκε από το στ", "ekspedicijska flota se nije vratila na p", "あなたの探索艦隊からの最後の通信はブラックホールが形成されていく壮大な画像でした", "あなたの艦隊は帰還しませんでした。科学者たちは原因を究明していますが、艦隊は永遠", "flota expeditie nu a sarit inapoi in car", "det sista vi fick ifrån expeditionen var", "expeditionsflottan kom aldrig tillbaka t", "zadnje sporočilo ki smo ga dobili je sli", "kontakt z ekspedicijsko floto je bil nen", "poslednou vecou ktorú sme obdržali od ex", "kontakt s expedičnou flotilou bol náhle ", "kesif filosundan alabildigimiz son bilgi", "kesif filosu  ulastigi bölgeden geri don", "我們從遠征探險艦隊收到了最後傳來的影像那是一個大得嚇人的黑洞", "與遠征探險艦隊的聯繫突然間中斷了我們的科學家們還在努力嘗試重新建立聯繫不過似乎艦"]
    }
  }
}
const css = '\n/*css*/\n\n:root\n{\n    --ogl:#FFB800;\n    --primary:linear-gradient(to bottom, #171d23, #101419);\n    --secondary:linear-gradient(192deg, #252e3a, #171c24 70%);\n    --secondaryReversed:linear-gradient(176deg, #252e3a, #171c24 70%);\n    --tertiary:linear-gradient(to bottom, #293746, #212a36 max(5%, 8px), #171c24 max(14%, 20px));\n\n    --date:#9c9cd7;\n    --time:#85c1d3;\n    --texthighlight:#6dbbb3;\n\n    --metal:hsl(229.85deg 48.01% 62.14%);\n    --crystal:hsl(201.27deg 73.83% 75.93%);\n    --deut:hsl(166.15deg 41.73% 62.16%);\n    --metal:hsl(240deg 24% 68%);\n    --crystal:hsl(199deg 72% 74%);\n    --deut:hsl(172deg 45% 46%);\n    --energy:#f5bbb4;\n    --dm:#b58cdb;\n    --food:hsl(316deg 21% 70%);\n    --artefact:#cda126;\n    --population:#ccc;\n    --lifeform:#d569b8;\n    --msu:#c7c7c7;\n\n    --nothing:#ddd;\n    --resource:#86edfd;\n    --ship:#1dd1a1;\n    --pirate:#ffd60b;\n    --alien:#5ce724;\n    --item:#bf6c4d;\n    --blackhole:#818181;\n    --early:#79a2ff;\n    --late:#df5252;\n    --trader:#ff7d30;\n    \n    --red:#f9392b;\n    --pink:#ff7ba8;\n    --purple:#ba68c8;\n    --indigo:#7e57c2;\n    --blue:#3f51b5;\n    --cyan:#29b6f6;\n    --teal:#06a98b;\n    --green:#4caf50;\n    --lime:#97b327;\n    --yellow:#fbea20;\n    --amber:#ffa000;\n    --orange:#ff5723;\n    --brown:#5d4037;\n    --grey:#607d8b;\n\n    --mission1:#ef5f5f;\n    --mission2:#ef5f5f;\n    --mission3:#66cd3d;\n    --mission4:#00c5b2;\n    --mission5:#d97235;\n    --mission6:#e9c74b;\n    --mission7:#5ae8ea;\n    --mission8:#0cc14a;\n    --mission15:#527dcb;\n    --mission18:#7eacb5;\n}\n\n.material-icons\n{\n    direction:ltr;\n    display:inline-block;\n    font-family:\'Material Icons\' !important;\n    font-weight:normal !important;\n    font-style:normal !important;\n    font-size:inherit !important;\n    image-rendering:pixelated;\n    line-height:inherit !important;\n    letter-spacing:normal;\n    user-select:none;\n    text-transform:none;\n    transform:rotate(0.03deg);\n    white-space:nowrap;\n    word-wrap:normal;\n    -webkit-font-feature-settings:\'liga\';\n    font-feature-settings:\'liga\';\n    -webkit-font-smoothing:antialiased;\n}\n\n/*body\n{\n    background-attachment:fixed;\n}*/\n\n/*body\n{\n    background-size:cover !important;\n}\n\n@-moz-document url-prefix()\n{\n    body\n    {\n        background-size:unset !important;\n    }\n}*/\n\nbody.ogl_destinationPicker #planetList:before\n{\n    /*animation:border-dance 1s infinite linear;\n    background-image:linear-gradient(90deg, var(--ogl) 50%, transparent 50%), linear-gradient(90deg, var(--ogl) 50%, transparent 50%), linear-gradient(0deg, var(--ogl) 50%, transparent 50%), linear-gradient(0deg, var(--ogl) 50%, transparent 50%);\n    background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;\n    background-size: 15px 2px, 15px 2px, 2px 15px, 2px 15px;\n    background-position: left top, right bottom, left bottom, right top;*/\n    border:2px solid #fff;\n    bottom:-2px;\n    content:\'\';\n    left:-2px;\n    pointer-events:none;\n    position:absolute;\n    right:-2px;\n    top:-2px;\n    z-index:2;\n}\n\n/*@keyframes border-dance\n{\n    0% { background-position:left top, right bottom, left bottom, right top; }\n    100% { background-position:left 15px top, right 15px bottom, left bottom 15px, right top 15px; }\n}*/\n\nline.ogl_line\n{\n    filter:drop-shadow(0 0 6px #000);\n    marker-end:url(#arrow);\n    marker-start:url(#circle);\n    stroke:#ffffff;\n    stroke-width:2px;\n}\n\n.ui-front:not([aria-describedby="fleetTemplatesEdit"]):not(.errorBox)\n{\n    z-index:9999 !important;\n}\n\n.ui-widget-overlay\n{\n    z-index:9998 !important;\n}\n\n.ogl_unit\n{\n    white-space:nowrap;\n}\n\n.ogl_suffix\n{\n    display:inline-block;\n    font-size:smaller;\n    margin-left:2px;\n}\n\n.ogl_text { color:var(--ogl) !important; }\n\n.ogl_metal, #resources_metal, .resource.metal, resource-icon.metal .amount { color:var(--metal) !important; }\n.ogl_crystal, #resources_crystal, .resource.crystal, resource-icon.crystal .amount  { color:var(--crystal) !important; }\n.ogl_deut, #resources_deuterium, .resource.deuterium, resource-icon.deuterium .amount  { color:var(--deut) !important; }\n.ogl_food, #resources_food, .resource.food, resource-icon.food .amount  { color:var(--food) !important; }\n.ogl_dm, #resources_darkmatter, .resource.darkmatter  { color:var(--dm) !important; }\n.ogl_energy, #resources_energy, .resource.energy, resource-icon.energy .amount  { color:var(--energy) !important; }\n.ogl_population, #resources_population, .resource.population, resource-icon.population .amount  { color:var(--population) !important; }\n.ogl_artefact { color:var(--artefact) !important; }\n[class*="ogl_lifeform"] { color:var(--lifeform) !important; }\n.ogl_msu { color:var(--msu) !important; }\n\n.ogl_mission1, [data-mission-type="1"]:not(.fleetDetails) .detailsFleet { color:var(--mission1) !important; }\n.ogl_mission2, [data-mission-type="2"]:not(.fleetDetails) .detailsFleet { color:var(--mission2) !important; }\n.ogl_mission3, [data-mission-type="3"]:not(.fleetDetails) .detailsFleet { color:var(--mission3) !important; }\n.ogl_mission4, [data-mission-type="4"]:not(.fleetDetails) .detailsFleet { color:var(--mission4) !important; }\n.ogl_mission5, [data-mission-type="5"]:not(.fleetDetails) .detailsFleet { color:var(--mission5) !important; }\n.ogl_mission6, [data-mission-type="6"]:not(.fleetDetails) .detailsFleet { color:var(--mission6) !important; }\n.ogl_mission7, [data-mission-type="7"]:not(.fleetDetails) .detailsFleet { color:var(--mission7) !important; }\n.ogl_mission8, [data-mission-type="8"]:not(.fleetDetails) .detailsFleet { color:var(--mission8) !important; }\n.ogl_mission9, [data-mission-type="9"]:not(.fleetDetails) .detailsFleet { color:var(--mission9) !important; }\n.ogl_mission10, [data-mission-type="10"]:not(.fleetDetails) .detailsFleet { color:var(--mission10) !important; }\n.ogl_mission11, [data-mission-type="11"]:not(.fleetDetails) .detailsFleet { color:var(--mission11) !important; }\n.ogl_mission12, [data-mission-type="12"]:not(.fleetDetails) .detailsFleet { color:var(--mission12) !important; }\n.ogl_mission13, [data-mission-type="13"]:not(.fleetDetails) .detailsFleet { color:var(--mission13) !important; }\n.ogl_mission14, [data-mission-type="14"]:not(.fleetDetails) .detailsFleet { color:var(--mission14) !important; }\n.ogl_mission15, [data-mission-type="15"]:not(.fleetDetails) .detailsFleet { color:var(--mission15) !important; }\n.ogl_mission18, [data-mission-type="18"]:not(.fleetDetails) .detailsFleet { color:var(--mission18) !important; }\n\n[data-mission-type] { background: #121b22 !important; }\n\n[data-mission-type="1"] { background:linear-gradient(to right, #121b22, #482018, #121b22) !important; }\n[data-mission-type="2"] { background:linear-gradient(to right, #121b22, #54271f, #121b22) !important; }\n[data-mission-type="3"] { background:linear-gradient(to right, #121b22, #2c4a14, #121b22) !important; }\n[data-mission-type="4"] { background:linear-gradient(to right, #121b22, #104841, #121b22) !important; }\n[data-mission-type="5"] { background:linear-gradient(to right, #121b22, #643d25, #121b22) !important; }\n[data-mission-type="6"] { background:linear-gradient(to right, #121b22, #4c401f, #121b22) !important; }\n[data-mission-type="7"] { background:linear-gradient(to right, #121b22, #214350, #121b22) !important; }\n[data-mission-type="8"] { background:linear-gradient(to right, #121b22, #004011, #121b22) !important; }\n[data-mission-type="9"] { background:linear-gradient(to right, #121b22, #4a1b14, #121b22) !important; }\n[data-mission-type="15"] { background:linear-gradient(to right, #121b22, #182542, #121b22) !important; }\n[data-mission-type="18"] { background:linear-gradient(to right, #121b22, #203642, #121b22) !important; }\n\n.ogl_icon, .ogl_metal.ogl_icon, .ogl_crystal.ogl_icon, .ogl_deut.ogl_icon, .ogl_food.ogl_icon,\n.ogl_dm.ogl_icon, .ogl_energy.ogl_icon, .ogl_artefact.ogl_icon, .ogl_population.ogl_icon,\n.ogl_icon[class*="ogl_2"], .ogl_icon[class*="ogl_mission"], .ogl_icon[class*="ogl_lifeform"],\n.ogl_icon.ogl_msu\n{\n    align-items:center;\n    border-radius:3px;\n    display:flex;\n    padding:3px;\n    white-space:nowrap;\n}\n\n.ogl_metal.ogl_icon:before, .ogl_crystal.ogl_icon:before, .ogl_deut.ogl_icon:before, .ogl_food.ogl_icon:before,\n.ogl_dm.ogl_icon:before, .ogl_energy.ogl_icon:before, .ogl_artefact.ogl_icon:before, .ogl_icon.ogl_population:before,\n.ogl_icon.ogl_msu:before\n{\n    background-image:url(https://gf3.geo.gfsrv.net/cdned/7f14c18b15064d2604c5476f5d10b3.png);\n    background-size:302px;\n    border-radius:3px;\n    content:\'\';\n    display:inline-block;\n    height:18px;\n    image-rendering:pixelated;\n    margin-right:10px;\n    vertical-align:middle;\n    width:28px;\n}\n\n.ogl_icon.ogl_metal:before { background-position:1% 11%; }\n.ogl_icon.ogl_crystal:before { background-position:16% 11%; }\n.ogl_icon.ogl_deut:before { background-position:30% 11%; }\n.ogl_icon.ogl_dm:before { background-position:57% 11%; }\n.ogl_icon.ogl_energy:before { background-position:43% 11%; }\n.ogl_icon.ogl_food:before { background-position:85% 11%; }\n.ogl_icon.ogl_population:before { background-position:98% 11%; }\n\n.ogl_icon.ogl_artefact:before\n{\n    background-image:url(https://image.board.gameforge.com/uploads/ogame/fr/announcement_ogame_fr_59cb6f773531d4ad73e508c140cd2d3c.png);\n    background-size:28px;\n}\n\n.ogl_miniStats, .ogl_recap, .ogl_stats, .ogl_todoList\n{\n    .ogl_icon.ogl_metal:before\n    {\n        background-image:url(https://gf2.geo.gfsrv.net/cdn1c/4230ff01e100a38a72dadfa7de0661.png);\n        background-size:28px;\n        image-rendering:auto;\n    }\n\n    .ogl_icon.ogl_crystal:before\n    {\n        background-image:url(https://gf1.geo.gfsrv.net/cdn65/596ba85baa74145390e04f7428d93e.png);\n        background-size:28px;\n        image-rendering:auto;\n    }\n\n    .ogl_icon.ogl_deut:before\n    {\n        background-image:url(https://gf1.geo.gfsrv.net/cdnc0/7a7bf2b8edcd74ebafe31dfbae14aa.png);\n        background-size:28px;\n        image-rendering:auto;\n    }\n\n    .ogl_icon.ogl_dm:before\n    {\n        background-image:url(https://gf2.geo.gfsrv.net/cdna3/4de426cb95e11af9cdabb901dfe802.png);\n        background-size:28px;\n        filter:hue-rotate(40deg) saturate(1);\n        image-rendering:auto;\n    }\n\n    .ogl_icon.ogl_artefact:before\n    {\n        background-image:url(https://gf1.geo.gfsrv.net/cdn65/596ba85baa74145390e04f7428d93e.png);\n        background-size:28px;\n        filter:hue-rotate(200deg) saturate(4);\n        image-rendering:auto;\n        transform:scaleX(-1);\n    }\n}\n\n.ogl_icon[class*="ogl_2"]:before\n{\n    background-position:center;\n    border-radius:3px;\n    content:\'\';\n    display:inline-block;\n    height:18px;\n    image-rendering:pixelated;\n    margin-right:5px;\n    vertical-align:text-bottom;\n    width:28px;\n}\n\n.ogl_icon.ogl_200:before\n{\n    background:linear-gradient(45deg, #784242, #dd4242);\n    content:\'close\';\n    font-family:\'Material Icons\';\n    line-height:18px;\n    text-align:center;\n}\n\n.ogl_icon.ogl_202:before { background-image:url(https://gf2.geo.gfsrv.net/cdnd9/60555c3c87b9eb3b5ddf76780b5712.jpg); }\n.ogl_icon.ogl_203:before { background-image:url(https://gf1.geo.gfsrv.net/cdn34/fdbcc505474e3e108d10a3ed4a19f4.jpg); }\n.ogl_icon.ogl_204:before { background-image:url(https://gf2.geo.gfsrv.net/cdnd2/9ed5c1b6aea28fa51f84cdb8cb1e7e.jpg); }\n.ogl_icon.ogl_205:before { background-image:url(https://gf1.geo.gfsrv.net/cdnf1/8266a2cbae5ad630c5fedbdf270f3e.jpg); }\n.ogl_icon.ogl_206:before { background-image:url(https://gf2.geo.gfsrv.net/cdn45/b7ee4f9d556a0f39dae8d2133e05b7.jpg); }\n.ogl_icon.ogl_207:before { background-image:url(https://gf1.geo.gfsrv.net/cdn32/3f4a081f4d15662bed33473db53d5b.jpg); }\n.ogl_icon.ogl_208:before { background-image:url(https://gf1.geo.gfsrv.net/cdn6f/41a21e4253d2231f8937ddef1ba43e.jpg); }\n.ogl_icon.ogl_209:before { background-image:url(https://gf1.geo.gfsrv.net/cdn07/6246eb3d7fa67414f6b818fa79dd9b.jpg); }\n.ogl_icon.ogl_210:before { background-image:url(https://gf3.geo.gfsrv.net/cdnb5/347821e80cafc52aec04f27c3a2a4d.jpg); }\n.ogl_icon.ogl_211:before { background-image:url(https://gf1.geo.gfsrv.net/cdnca/4d55a520aed09d0c43e7b962f33e27.jpg); }\n.ogl_icon.ogl_213:before { background-image:url(https://gf3.geo.gfsrv.net/cdn2a/c2b9fedc9c93ef22f2739c49fbac52.jpg); }\n.ogl_icon.ogl_214:before { background-image:url(https://gf3.geo.gfsrv.net/cdn84/155e9e24fc1d34ed4660de8d428f45.jpg); }\n.ogl_icon.ogl_215:before { background-image:url(https://gf3.geo.gfsrv.net/cdn5a/24f511ec14a71e2d83fd750aa0dee2.jpg); }\n.ogl_icon.ogl_218:before { background-image:url(https://gf1.geo.gfsrv.net/cdn39/12d016c8bb0d71e053b901560c17cc.jpg); }\n.ogl_icon.ogl_219:before { background-image:url(https://gf3.geo.gfsrv.net/cdne2/b8d8d18f2baf674acedb7504c7cc83.jpg); }\n\n.ogl_icon[class*="ogl_mission"]:before\n{\n    background-image:url(https://gf2.geo.gfsrv.net/cdn14/f45a18b5e55d2d38e7bdc3151b1fee.jpg);\n    background-position:0 0;\n    background-size:344px !important;\n    border-radius:3px;\n    content:\'\';\n    display:inline-block;\n    height:18px;\n    margin-right:10px;\n    vertical-align:middle;\n    width:28px;\n}\n\n.ogl_icon.ogl_mission1:before { background-position:80.2% 0 !important; }\n.ogl_icon.ogl_mission2:before { background-position:99.7% 0 !important; }\n.ogl_icon.ogl_mission3:before { background-position:50% 0 !important; }\n.ogl_icon.ogl_mission4:before { background-position:30% 0 !important; }\n.ogl_icon.ogl_mission5:before { background-position:69.5% 0 !important; }\n.ogl_icon.ogl_mission6:before { background-position:59.75% 0 !important; }\n.ogl_icon.ogl_mission7:before { background-position:20.75% 0 !important; }\n.ogl_icon.ogl_mission8:before { background-position:40.1% 0 !important; }\n.ogl_icon.ogl_mission9:before { background-position:89% 0 !important; }\n.ogl_icon.ogl_mission15:before { background-position:0.2% 0 !important; }\n.ogl_icon.ogl_mission18:before { background:url(https://gf2.geo.gfsrv.net/cdna8/1fc8d15445e97c10c7b6881bccabb2.gif); background-size:18px !important; }\n\n.ogl_lifeform0.ogl_icon:before\n{\n    content:\'-\';\n}\n\n.ogl_lifeform1.ogl_icon:before, .ogl_lifeform2.ogl_icon:before,\n.ogl_lifeform3.ogl_icon:before, .ogl_lifeform4.ogl_icon:before\n{\n    background-image:url(https://gf2.geo.gfsrv.net/cdna5/5681003b4f1fcb30edc5d0e62382a2.png);\n    background-size:245px;\n    content:\'\';\n    display:inline-block;\n    height:24px;\n    image-rendering:pixelated;\n    vertical-align:middle;\n    width:24px;\n}\n\n.ogl_icon.ogl_lifeform0:before { background-position:1% 11%; }\n.ogl_icon.ogl_lifeform1:before { background-position:0% 86%; }\n.ogl_icon.ogl_lifeform2:before { background-position:11% 86%; }\n.ogl_icon.ogl_lifeform3:before { background-position:22% 86%; }\n.ogl_icon.ogl_lifeform4:before { background-position:33% 86%; }\n\n.ogl_icon.ogl_msu:before\n{\n    align-items:center;\n    background:none;\n    color:#fff;\n    content:\'MSU\';\n    display:flex;\n    font-size:11px;\n    justify-content:center;\n}\n\n.ogl_gridIcon .ogl_icon\n{\n    display:grid;\n    grid-gap:7px;\n    justify-content:center;\n    padding-top:6px;\n    text-align:center;\n}\n\n.ogl_gridIcon .ogl_icon:before\n{\n    margin:auto;\n}\n\n.ogl_header\n{\n    color:#6F9FC8;\n    font-size:11px;\n    font-weight:700;\n    height:27px;\n    line-height:27px;\n    position:relative;\n    text-align:center;\n}\n\n.ogl_header .material-icons\n{\n    font-size:17px !important;\n    line-height:28px !important;\n}\n\n.ogl_button, a.ogl_button\n{\n    background:linear-gradient(to bottom, #405064, #2D3743 2px, #181E25);\n    border:1px solid #17191c;\n    border-radius:3px;\n    color:#b7c1c9 !important;\n    cursor:pointer;\n    display:inline-block;\n    line-height:26px !important;\n    padding:0 4px;\n    text-align:center;\n    text-decoration:none;\n    text-shadow:1px 1px #000;\n    user-select:none;\n}\n\n.ogl_button:hover\n{\n    color:var(--ogl) !important;\n}\n\n.ogl_invisible\n{\n    visibility:hidden;\n}\n\n.ogl_hidden\n{\n    display:none !important;\n}\n\n.ogl_reversed\n{\n    transform:scaleX(-1);\n}\n\n.ogl_textCenter\n{\n    justify-content:center;\n    text-align:center;\n}\n\n.ogl_textRight\n{\n    justify-content:end;\n    text-align:right;\n}\n\n.ogl_disabled\n{\n    color:rgba(255,255,255,.2);\n    opacity:.5;\n    pointer-events:none;\n    user-select:none;\n}\n\n.ogl_interactive\n{\n    cursor:pointer;\n}\n\n.ogl_slidingText\n{\n    display:inline-flex !important;\n    grid-gap:20px;\n    overflow:hidden;\n    position:relative;\n    width:100%;\n    white-space:nowrap;\n}\n\n.ogl_slidingText:before, .ogl_slidingText:after\n{\n    animation:textSlideLeft 6s infinite linear;\n    content:attr(data-text);\n}\n\n@keyframes textSlideLeft\n{\n    0% { transform:translateX(20px); }\n    100% { transform:translateX(-100%); }\n}\n\n[data-status="pending"]\n{\n    pointer-events:none;\n    color:orange !important;\n}\n\n[data-status="done"]\n{\n    color:green !important;\n}\n\ntime\n{\n    color:var(--time);\n}\n\ntime span\n{\n    color:var(--date);\n}\n\n.menubutton.ogl_active .textlabel\n{\n    color:#75ffcc !important;\n}\n\n#productionboxBottom time\n{\n    font-size:11px;\n    margin-top:10px;\n    text-align:center;\n}\n\n[data-output-time], [data-output-date]\n{\n    color:transparent !important;\n    display:inline-grid !important;\n    grid-template-columns:auto 6px auto;\n    overflow:hidden;\n    position:relative;\n    user-select:none;\n    white-space:nowrap;\n}\n\n[data-output-time]:not([data-output-date])\n{\n    grid-template-columns:0 auto;\n}\n\n[data-output-time] span, [data-output-date] span\n{\n    display:none;\n}\n\n[data-output-date]:before\n{\n    color:var(--date);\n    content:attr(data-output-date);\n}\n\n[data-output-time]:after\n{\n    color:var(--time);\n    content:attr(data-output-time);\n}\n\n[data-output-time="Invalid Date"]\n{\n    display:none !important;\n}\n\n.honorRank.rank_0, .honorRank.rank_undefined\n{\n    display:none;\n}\n\n[data-galaxy]\n{\n    color:#c3c3c3;\n    cursor:pointer;\n}\n\n[data-galaxy]:hover\n{\n    color:#fff;\n    text-decoration:underline;\n}\n\n[data-galaxy].ogl_active\n{\n    color:#c3c3c3;\n    box-shadow:inset 0 0 0 2px rgba(255, 165, 0, .2);\n}\n\n.galaxyCell.cellPlayerName.ogl_active\n{\n    box-shadow:inset 0 0 0 2px rgba(255, 165, 0, .2);\n}\n\n[data-color]\n{\n    color:#4f6d87;\n    line-height:21px;\n    text-align:center;\n}\n\n[data-color]:before\n{\n    content:\'my_location\';\n    font-family:\'Material Icons\';\n    font-size:18px;\n}\n\n.ogl_target [data-color]\n{\n    line-height:8px;\n    text-align:center;\n}\n\n.ogl_target [data-color]:before\n{\n    background:currentColor;\n    border-radius:50%;\n    content:\'\';\n    display:block;\n    height:8px;\n    width:8px;\n}\n\n.ogl_tooltip [data-color]:before\n{\n    background:currentColor;\n    border-radius:50%;\n    content:\'\';\n    display:block;\n    height:22px;\n    width:22px;\n}\n\n[data-color="red"] { color:var(--red) !important; }\n[data-color="pink"] { color:var(--pink) !important; }\n[data-color="purple"] { color:var(--purple) !important; }\n[data-color="indigo"] { color:var(--indigo) !important; }\n[data-color="blue"] { color:var(--blue) !important; }\n[data-color="cyan"] { color:var(--cyan) !important; }\n[data-color="teal"] { color:var(--teal) !important; }\n[data-color="green"] { color:var(--green) !important; }\n[data-color="lime"] { color:var(--lime) !important; }\n[data-color="yellow"] { color:var(--yellow) !important; }\n[data-color="amber"] { color:var(--amber) !important; }\n[data-color="orange"] { color:var(--orange) !important; }\n[data-color="brown"] { color:var(--brown) !important; }\n[data-color="grey"] { color:var(--grey) !important; }\n[data-color="none"] { color:rgba(255,255,255,.05); }\n[data-color="none"]:before\n{\n    color:rgba(255,255,255,.5);\n    content:\'format_color_reset\';\n    font-family:\'Material Icons\';\n    font-size:24px;\n}\n\n.tpd-tooltip\n{\n    display:none !important;\n    opacity:0 !important;\n}\n\n.ogl_tooltip\n{\n    border-radius:4px;\n    box-sizing:border-box;\n    font-size:11px;\n    left:0;\n    opacity:0;\n    padding:10px;\n    pointer-events:none;\n    position:absolute;\n    top:0;\n    z-index:1000002;\n}\n\n.ogl_tooltip:not(:has(.ogl_close))\n{\n    pointer-events:none !important;\n}\n\n.ogl_tooltip:before\n{\n    border-radius:inherit;\n    bottom:10px;\n    box-shadow:0 0 15px 5px rgb(0,0,0,.6), 0 0 4px 1px rgba(0,0,0,.7);\n    content:\'\';\n    left:10px;\n    position:absolute;\n    right:10px;\n    top:10px;\n}\n\n.ogl_tooltip .ogl_tooltipTriangle\n{\n    background:#171c24;\n    box-shadow:0 0 15px 5px rgb(0,0,0,.6), 0 0 4px 1px rgba(0,0,0,.7);\n    height:15px;\n    pointer-events:none;\n    position:absolute;\n    width:15px;\n}\n\n.ogl_tooltip[data-direction="top"] .ogl_tooltipTriangle\n{\n    transform:translate(50%, -50%) rotate(45deg);\n}\n\n.ogl_tooltip[data-direction="bottom"] .ogl_tooltipTriangle\n{\n    background:#293746;\n    transform:translate(50%, 50%) rotate(45deg);\n}\n\n.ogl_tooltip[data-direction="left"] .ogl_tooltipTriangle\n{\n    transform:translate(-50%, 50%) rotate(45deg);\n}\n\n.ogl_tooltip[data-direction="right"] .ogl_tooltipTriangle\n{\n    transform:translate(50%, 50%) rotate(45deg);\n}\n\n.ogl_tooltip .ogl_close\n{\n    align-items:center;\n    background:#7c3434;\n    border-radius:4px;\n    box-shadow:0 0 8px rgb(0,0,0,.6);\n    color:#fff;\n    cursor:pointer;\n    display:flex !important;\n    font-size:16px !important;\n    justify-content:center;\n    height:22px;\n    position:absolute;\n    right:0;\n    top:0;\n    width:22px;\n    z-index:1000004;\n}\n\n.ogl_tooltip .ogl_close:hover\n{\n    background:#9f3d3d;\n}\n\n.ogl_tooltip.ogl_active\n{\n    animation-fill-mode:forwards !important;\n}\n\n.ogl_tooltip[data-direction="top"].ogl_active\n{\n    animation:appearTop .1s;\n}\n\n@keyframes appearTop\n{\n    from { opacity:0; margin-top:20px; }\n    to { opacity:1; margin-top:0; }\n    99% { pointer-events:none; }\n    100% { pointer-events:all; }\n}\n\n.ogl_tooltip[data-direction="bottom"].ogl_active\n{\n    animation:appearBottom .1s;\n}\n\n@keyframes appearBottom\n{\n    from { opacity:0; margin-top:-20px; }\n    to { opacity:1; margin-top:0; }\n    99% { pointer-events:none; }\n    100% { pointer-events:all; }\n}\n\n.ogl_tooltip[data-direction="left"].ogl_active\n{\n    animation:appearLeft .1s;\n}\n\n@keyframes appearLeft\n{\n    from { opacity:0; margin-left:20px; }\n    to { opacity:1; margin-left:0; }\n    99% { pointer-events:none; }\n    100% { pointer-events:all; }\n}\n\n.ogl_tooltip[data-direction="right"].ogl_active\n{\n    animation:appearRight .1s;\n}\n\n@keyframes appearRight\n{\n    from { opacity:0; margin-left:-20px; }\n    to { opacity:1; margin-left:0; }\n    99% { pointer-events:none; }\n    100% { pointer-events:all; }\n}\n\n.ogl_tooltip hr, .ogl_notification hr\n{\n    background:#1e252e;\n    border:none;\n    grid-column:1 / -1;\n    height:2px;\n    width:100%;\n}\n\n.ogl_tooltip > div:not(.ogl_tooltipTriangle):not(.ogl_close)\n{\n    background:var(--tertiary);\n    border-radius:inherit;\n    display:block !important;\n    line-height:1.25;\n    max-height:90vh;\n    max-width:400px;\n    overflow-x:hidden;\n    overflow-y:auto;\n    padding:16px 20px;\n    position:relative;\n    z-index:1000003;\n}\n\n.ogl_tooltip .ogl_colorpicker\n{\n    display:grid !important;\n    grid-auto-flow:column;\n    grid-gap:3px;\n    grid-template-rows:repeat(5, 1fr);\n}\n\n[class*="tooltip"]\n{\n    user-select:none !important;\n}\n\n[class*="tooltip"] input\n{\n    box-sizing:border-box;\n    max-width:100%;\n}\n\n.ogl_colorpicker > div\n{\n    border-radius:50%;\n    box-sizing:border-box;\n    cursor:pointer;\n    height:24px;\n    width:24px;\n}\n\n.ogl_planetIcon, .ogl_moonIcon, .ogl_flagIcon, .ogl_searchIcon, .ogl_pinIcon, .ogl_fleetIcon\n{\n    display:inline-block !important;\n    font-style:normal !important;\n    text-align:center !important;\n    vertical-align:text-top !important;\n}\n\n.ogl_planetIcon:before, .ogl_moonIcon:before, .ogl_flagIcon:before, .ogl_searchIcon:before, .ogl_pinIcon:before, .ogl_fleetIcon:before\n{\n    font-family:\'Material Icons\';\n    font-size:20px !important;\n}\n\n.ogl_planetIcon:before\n{\n    content:\'language\';\n}\n\n.ogl_moonIcon:before\n{\n    content:\'brightness_2\';\n}\n\n.ogl_flagIcon:before\n{\n    content:\'flag\';\n}\n\n.ogl_pinIcon:before\n{\n    content:\'push_pin\';\n}\n\n.ogl_searchIcon:before\n{\n    content:\'search\';\n}\n\n.ogl_fleetIcon:before\n{\n    content:\'send\';\n}\n\n#bar\n{\n    line-height:17px !important;\n}\n\n#fleet1 .content\n{\n    padding-top:16px !important;\n}\n\n#fleet1 .ogl_shipFlag\n{\n    color:var(--yellow);\n    display:grid;\n    grid-gap:4px;\n    grid-template-columns:repeat(2, 1fr);\n    left:5px;\n    position:absolute;\n    text-shadow:1px 2px #000;\n    top:-5px;\n}\n\n#fleet1 .ogl_fav\n{\n    font-size:14px !important;\n}\n\n#fleet1 .ogl_shipLock\n{\n    color:var(--red);\n    font-size:14px !important;\n}\n\n#fleet1 progress\n{\n    appearance:none;\n\tborder:0;\n    bottom:-5px;\n    display:block;\n    height:5px;\n    left:5px;\n    position:absolute;\n    width:655px;\n    z-index:10;\n}\n\n#fleet1 progress, #fleet1 progress::-webkit-progress-bar\n{\n    background:var(--capacity);\n}\n\n#fleet1 .capacityProgress\n{\n    position:relative;\n}\n\n#fleet1 .capacityProgress::before\n{\n    background:#0c1014;\n    border-radius:18px;\n    content:attr(data-rawCargo);\n    display:inline-block;\n    font-size:11px;\n    left:50%;\n    padding:5px 10px;\n    position:absolute;\n    text-align:center;\n    top:8px;\n    transform:translateX(-50%);\n}\n\n#fleet1 .capacityProgress::after\n{\n    content:attr(data-percentResources)\'%\';\n    display:block;\n    font-size:10px;\n    left:var(--currentCapacityPercent);\n    position:absolute;\n    text-shadow:2px 2px 1px #000;\n    top:-14px;\n    transform:translateX(5px);\n    transition:left 0.5s;\n}\n\n#fleet1 progress::-webkit-progress-value\n{\n    background:rgba(255,255,255,.1);\n    backdrop-filter:brightness(1.8);\n    box-shadow:5px 0 10px #000;\n    transition:width 0.5s;\n}\n\n#fleet1 progress::-moz-progress-bar\n{\n    background:rgba(255,255,255,.1);\n    backdrop-filter:brightness(1.8);\n    box-shadow:5px 0 10px #000;\n    transition:width 0.5s;\n}\n\n.ogl_requiredShips\n{\n    align-items:center;\n    display:grid;\n    justify-content:center;\n    user-select:none;\n    width:80px;\n}\n\n#warning .ogl_requiredShips\n{\n    display:flex;\n    grid-gap:28px;\n    width: 100%;\n}\n\n.ogl_requiredShips .ogl_notEnough\n{\n    color:var(--red);\n    filter:none;\n}\n\n.ogl_required\n{\n    background:linear-gradient(145deg, black, transparent);\n    border-radius:3px;\n    font-size:10px;\n    overflow:hidden;\n    padding:0 !important;\n    white-space:nowrap;\n}\n\n.ogl_required:before\n{\n    vertical-align:middle !important;\n}\n\n.ogl_required:hover\n{\n    box-shadow:0 0 0 2px var(--ogl);\n}\n\n.ogl_maxShip\n{\n    background:#3c1a1a;\n    border-radius:0;\n    bottom:19px;\n    box-sizing:border-box;\n    color:var(--red);\n    cursor:pointer;\n    font-size:10px;\n    height:14px;\n    left:2px;\n    line-height:14px;\n    padding:0 5px;\n    position:absolute;\n    right:2px;\n    text-align:right;\n    user-select:none;\n}\n\n.ogl_maxShip:hover\n{\n    box-shadow:0 0 0 2px var(--ogl);\n}\n\n.resourceIcon .ogl_maxShip\n{\n    bottom:0;\n}\n\n.ogl_limiterLabel\n{\n    align-items:center;\n    background:var(--secondary);\n    border-radius:3px;\n    cursor:pointer;\n    display:inline-flex;\n    grid-gap:5px;\n    height:28px;\n    padding:0 9px;\n    user-select:none;\n}\n\n.ogl_limiterGroup\n{\n    align-items:center;\n    background:var(--secondary);\n    border-radius:3px;\n    display:inline-flex;\n    height:28px;\n    margin-left:auto;\n    padding:0 9px;\n    user-select:none;\n}\n\n.ogl_limiterGroup .ogl_icon:first-child\n{\n    margin-left:5px;\n}\n\n.ogl_limiterGroup .ogl_icon:before\n{\n    margin-right:0;\n}\n\n.ogl_limiterGroup .ogl_icon:hover\n{\n    cursor:pointer;\n}\n\n.ogl_limiterGroup .ogl_icon:hover:before\n{\n    box-shadow:0 0 0 2px var(--ogl);\n}\n\n.ogl_limiterGroup .ogl_icon.ogl_active:before\n{\n    box-shadow:0 0 0 2px #fff;\n}\n\n.ogl_limiterGroup:has(.ogl_active:not(.ogl_200))\n{\n    box-shadow:0 0 0 2px var(--red);\n}\n\n#fleet2 #buttonz ul li span\n{\n    height:12px;\n    min-width:122px;\n}\n\n#fleet2 div#mission .percentageBarWrapper\n{\n    margin-top:10px;\n}\n\n#speedPercentage\n{\n    float:none !important;\n    margin:auto !important;\n}\n\n.percentageBar .steps .step:not(.selected)\n{\n    line-height:20px !important;\n}\n\n#speedPercentage .bar\n{\n    pointer-events:none;\n}\n\n.technology input[type="number"], .technology input[type="text"]\n{\n    background:#98b2bf !important;\n    border:none !important;\n    border-radius:2px !important;\n    bottom:-20px !important;\n    box-shadow:none !important;\n    height:20px !important;\n}\n\n.ogl_notEnough\n{\n    filter:sepia(1) hue-rotate(300deg);\n}\n\n.technology.ogl_notEnough\n{\n    filter:none;\n}\n\n.technology.ogl_notEnough .icon\n{\n    filter:grayscale(1) brightness(0.5);\n}\n\n.technology.ogl_notEnough input\n{\n    background:#525556 !important;\n    cursor:not-allowed !important;\n}\n\n.technology input.ogl_flashNotEnough\n{\n    background:#cf7e7e !important;\n}\n\n.technology:hover\n{\n    z-index:2;\n}\n\n.technology .icon\n{\n    border-radius:0 !important;\n    box-shadow:0 0 0 1px #000 !important;\n    position:relative;\n}\n\n.technology[data-status="active"] .icon\n{\n    box-shadow:0 0 5px 2px var(--ogl);\n}\n\n.technology .icon:hover, .technology.showsDetails .icon\n{\n    border:2px solid var(--ogl) !important;\n}\n\n.technology .icon .upgrade\n{\n    border-radius:0 !important;\n    box-shadow:0 0 6px 0px rgba(0,0,0,.8) !important;\n}\n\n.technology .icon .upgrade:after\n{\n    border-color:transparent transparent currentColor transparent !important;\n}\n\n.technology .icon .level, .technology .icon .amount\n{\n    background:var(--primary) !important;\n    border-radius:0 !important;\n}\n\n#technologydetails h3,\n#technologydetails .level, #technologydetails .amount\n{\n    color:var(--ogl) !important;\n}\n\n#fleetdispatchcomponent .allornonewrap\n{\n    align-items:center;\n    background:none !important;\n    border:none !important;\n    display:flex;\n}\n\n#fleet1 .allornonewrap .firstcol\n{\n    display:grid;\n    grid-gap:5px !important;\n    justify-content:space-between !important;\n    width:auto !important;\n}\n\n#fleetdispatchcomponent #continueToFleet2\n{\n    margin-left:auto;\n}\n\n#fleetdispatchcomponent #allornone .info\n{\n    display:none;\n}\n\n#fleetdispatchcomponent #buttonz #battleships\n{\n    width:408px !important;\n}\n\n#fleetdispatchcomponent #buttonz #civilships\n{\n    width:254px !important;\n}\n\n#fleetdispatchcomponent #buttonz #battleships ul,\n#fleetdispatchcomponent #buttonz #civilships ul\n{\n    padding:0 !important;\n}\n\n#fleetdispatchcomponent #buttonz #battleships ul\n{\n    margin-left:8px !important;\n}\n\n#fleetdispatchcomponent #buttonz #battleships .header\n{\n    border-radius:0 3px 3px 0;\n    border-right:1px solid #000;\n}\n\n#fleetdispatchcomponent #buttonz #civilships .header\n{\n    border-radius:3px 0 0 3px;\n    border-left:1px solid #000;\n}\n\n#fleetdispatchcomponent .resourceIcon\n{\n    cursor:default;\n    position:relative;\n}\n\n#fleetdispatchcomponent .ogl_keepRecap\n{\n    background:#4c1b1b;\n    box-sizing:border-box;\n    bottom:0;\n    color:#f45757;\n    font-size:10px;\n    padding-right:5px;\n    position:absolute;\n    text-align:right;\n    width:100%;\n}\n\n#fleetdispatchcomponent fieldset,\n#jumpgate fieldset\n{\n    background:#0c1014;\n    border-radius:3px;\n    box-sizing:border-box;\n    display:flex;\n    grid-gap:10px;\n    margin:30px 5px 5px 5px;\n    padding:12px;\n    width:656px;\n}\n\n#fleetdispatchcomponent fieldset,\n#jumpgate fieldset\n{\n    color:#fff;\n}\n\n#fleetdispatchcomponent fieldset legend,\n#jumpgate fieldset legend\n{\n    color:#6f9fc8;\n}\n\n#fleetdispatchcomponent .resourceIcon\n{\n    box-shadow:inset -8px 7px 10px rgba(0,0,0,.5);\n}\n\n#allornone .secondcol\n{\n    align-items:center;\n    background:none !important;\n    border:none !important;\n    display:inline-flex !important;\n    grid-gap:6px;\n    padding:5px !important;\n    width:auto !important;\n}\n\n#allornone .secondcol .ogl_icon:hover, #allornone .secondcol .material-icons:hover\n{\n    color:#ccc !important;\n    filter:brightness(1.2);\n}\n\n#allornone .secondcol .clearfloat\n{\n    display:none !important;\n}\n\n#allornone .secondcol .ogl_icon:not(.ogl_icon .ogl_icon):before\n{\n    box-shadow:inset 0 0 1px 1px #000;\n    height:31px;\n    width:31px;\n}\n\n#allornone .secondcol .ogl_icon:before\n{\n    margin:0;\n}\n\n#allornone .secondcol .ogl_icon .ogl_icon:before\n{\n    border-radius:10px 10px 10px 0;\n    box-shadow:0 0 0 2px #345eb4, 0 0 2px 4px rgba(0,0,0,.7);\n    width:18px;\n}\n\n#allornone .secondcol .ogl_icon\n{\n    cursor:pointer;\n    padding:0;\n    position:relative;\n}\n\n#allornone .secondcol .ogl_icon .ogl_icon\n{\n    position:absolute;\n    right:-4px;\n    top:-5px;\n    transform:scale(.8);\n}\n\n#resetall, #sendall\n{\n    border-radius:3px;\n    overflow:hidden;\n    transform:scale(.97);\n}\n\n#galaxyLoading:after\n{\n    background:rgba(0,0,0,.7);\n    border-radius:8px;\n    content:attr(data-currentposition);\n    font-size:13px;\n    font-weight:bold;\n    left:50%;\n    padding:5px;\n    position:absolute;\n    top:50%;\n    transform:translate(-50%, -50%);\n}\n\n/*#pageContent, #mainContent\n{\n    width:1045px !important;\n    width:990px !important;\n}*/\n\n#commandercomponent\n{\n    transform:translateX(55px);\n}\n\n#bar ul li.OGameClock\n{\n    transform:translateX(57px);\n}\n\n#box, #standalonepage #mainContent\n{\n    width:100% !important;\n}\n\n#top\n{\n    background-repeat:no-repeat;\n}\n\n#middle\n{\n    padding-bottom:80px;\n}\n\n#right\n{\n    float:left !important;\n    position:relative !important;\n    z-index:2 !important;\n}\n\n#right .ogl_ogameDiv, #planetbarcomponent .ogl_ogameDiv\n{\n    margin-bottom:20px;\n}\n\n#myPlanets .ogl_header .material-icons, #myWorlds .ogl_header .material-icons\n{\n    color:#fff;\n    cursor:pointer;\n    position:absolute;\n    right:5px;\n    transform-origin:center;\n    top:2px;\n    z-index:1;\n}\n\n#countColonies\n{\n    display:none;\n}\n\n#bannerSkyscrapercomponent\n{\n    margin-left:290px !important;\n}\n\n#planetbarcomponent #rechts\n{\n    margin-bottom:20px !important;\n    margin-left:5px !important;\n    margin-top:-50px !important;\n    width:176px !important;\n}\n\n#rechts .ogl_ogameDiv:first-child\n{\n    z-index:100001;\n}\n\n#myPlanets\n{\n    width:auto !important;\n}\n\n#planetList\n{\n    background:#15191e !important;\n    padding:0 !important;\n    position:relative;\n    transform:translateX(-8px);\n    user-select:none;\n    width:206px;\n    z-index:2;\n}\n\n#planetList.ogl_notReady .smallplanet:after\n{\n    background:rgba(0,0,0,.5);\n    border-radius:7px;\n    bottom:0px;\n    content:\'\';\n    left:0px;\n    pointer-events:none;\n    position:absolute;\n    right:0px;\n    top:0px;\n    z-index:100;\n}\n\n#planetList.ogl_notReady .smallplanet\n{\n    pointer-events:none !important;\n}\n\n#myPlanets\n{\n    background:none !important;\n    box-shadow:none !important;\n}\n\n.ogl_available\n{\n    display:grid;\n    font-size:9px;\n    font-weight:bold;\n    line-height:11px;\n    opacity:1;\n    position:absolute;\n    right:3px;\n    text-align:right;\n    top:4px;\n    width:auto;\n}\n\n.smallplanet .planetlink:hover .ogl_available, .smallplanet .moonlink:hover .ogl_available\n{\n    opacity:1;\n}\n\n.smallplanet\n{\n    background:linear-gradient(341deg, transparent 29%, #283748);\n    background:#0e1116;\n    border-radius:0 !important;\n    display:grid;\n    font-size:10px;\n    grid-gap:2px;\n    grid-template-columns:139px 64px;\n    height:41px !important;\n    margin:0 !important;\n    padding:1px;\n    position:relative !important;\n    width:100% !important;\n}\n\n.smallplanet:last-child\n{\n    border-radius:0 0 4px 4px !important;\n    margin-bottom:0 !important;\n}\n\n@property --round\n{\n    syntax:\'<integer>\';\n    inherits:false;\n    initial-value:-50%;\n}\n\n[data-group]:before\n{\n    --round:-50%;\n    border:2px solid #fff;\n    border-right:none;\n    content:\'\';\n    height:calc(100% - 1px);\n    position:absolute;\n    top:0;\n    transform:translate(-100%, round(down, -50%, 1px));\n    transform:translate(-100%, var(--round));\n    left:0;\n    width:3px;\n}\n\n[data-group="1"]:before { border-color:#3F51B5; }\n[data-group="2"]:before { border-color:#2196F3; }\n[data-group="3"]:before { border-color:#009688; }\n[data-group="4"]:before { border-color:#43A047; }\n[data-group="5"]:before { border-color:#7CB342; }\n[data-group="6"]:before { border-color:#FDD835; }\n[data-group="7"]:before { border-color:#FB8C00; }\n[data-group="8"]:before { border-color:#E53935; }\n[data-group="9"]:before { border-color:#EC407A; }\n[data-group="10"]:before { border-color:#5E35B1; }\n[data-group="11"]:before { border-color:#795548; }\n[data-group="12"]:before { border-color:#607D8B; }\n\n.smallplanet .planetlink, .smallplanet .moonlink\n{\n    border-radius:4px !important;\n    background-position:initial !important;\n    height:43px !important;\n    overflow:hidden !important;\n    position:relative !important;\n    padding:0 !important;\n    position:relative !important;\n    top:0 !important;\n}\n\n.smallplanet .planetlink:hover\n{\n    background:linear-gradient(207deg, #0d1014, #4869c7);\n}\n\n.smallplanet:last-child .planetlink:hover\n{\n    border-radius:0 0 0 4px !important;\n}\n\n.smallplanet .moonlink:hover\n{\n    background:linear-gradient(-207deg, #0d1014, #4869c7);\n}\n\n.smallplanet:last-child .moonlink:hover\n{\n    border-radius:0 0 4px 0 !important;\n}\n\n.ogl_destinationPicker .smallplanet .planetlink.ogl_currentDestination\n{\n    background:linear-gradient(207deg, #0d1014, #bb8c22) !important;\n}\n\n.ogl_destinationPicker .smallplanet .moonlink.ogl_currentDestination\n{\n    background:linear-gradient(-207deg, #0d1014, #bb8c22) !important;\n}\n\n.ogl_destinationPicker .smallplanet .ogl_currentDestination .planetPic,\n.ogl_destinationPicker .smallplanet .ogl_currentDestination .icon-moon,\n.ogl_destinationPicker .smallplanet .ogl_currentDestination .ogl_refreshTimer\n{\n    display:none;\n}\n\n.ogl_destinationPicker .smallplanet .ogl_currentDestination:after\n{\n    color:var(--ogl);\n    content:\'sports_score\';\n    font-family:\'Material Icons\';\n    font-size:20px;\n    left:6px;\n    position:absolute;\n    top:12px;\n}\n\n.ogl_destinationPicker .smallplanet .moonlink.ogl_currentDestination:after\n{\n    left:2px;\n}\n\n.smallplanet .ogl_disabled\n{\n    opacity:1;\n    pointer-events:all;\n}\n\n.ogl_destinationPicker .smallplanet .ogl_disabled\n{\n    opacity:.5;\n    pointer-events:none;\n}\n\n.smallplanet .planetlink\n{\n    background:linear-gradient(207deg, #0d1014, #212b34);\n}\n\n.smallplanet .moonlink\n{\n    background:linear-gradient(-207deg, #0d1014, #212b34);\n}\n\n.smallplanet.hightlightPlanet .planetlink\n{\n    background:linear-gradient(207deg, #0d1014, #4869c7);\n}\n\n.smallplanet.hightlightMoon .moonlink\n{\n    background:linear-gradient(-207deg, #0d1014, #4869c7);\n}\n\n.ogl_destinationPicker .smallplanet .planetlink.ogl_disabled\n{\n    background:linear-gradient(207deg, #0d1014, #c74848) !important;\n}\n\n.ogl_destinationPicker .smallplanet .moonlink.ogl_disabled\n{\n    background:linear-gradient(-207deg, #0d1014, #c74848) !important;\n}\n\n.smallplanet .planetlink.ogl_attacked,\n.smallplanet .moonlink.ogl_attacked\n{\n    box-shadow:inset 0 0 0 2px #c93838 !important;\n}\n\n.smallplanet .moonlink\n{\n    left:auto !important;\n}\n\n.smallplanet .planet-name, .smallplanet .planet-koords\n{\n    font-weight:normal !important;\n    left:32px !important;\n    position:absolute !important;\n    max-width:67px !important;\n    overflow:hidden !important;\n    text-overflow:ellipsis !important;\n}\n\n.smallplanet .planet-name\n{\n    color:hsl(208deg 32% 63%) !important;\n    font-size:10px !important;\n    font-weight:bold !important;\n    top:9px !important;\n}\n\n.smallplanet .planet-koords\n{\n    bottom:10px !important;\n    color:hsl(208deg 3% 57%) !important;\n    letter-spacing:-0.05em;\n    font-size:11px !important;\n    top:auto !important;\n}\n\n.smallplanet .planetPic\n{\n    background:#1a2534;\n    box-shadow:0 0 8px #000000 !important;\n    height:22px !important;\n    left:-1px !important;\n    margin:0 !important;\n    position:absolute !important;\n    top:23px !important;\n    transform:scale(1.4);\n    width:22px !important;\n}\n\n.smallplanet .icon-moon\n{\n    background:#1a2534;\n    box-shadow:0 0 8px #000000 !important;\n    height:16px !important;\n    left:0px !important;\n    margin:0 !important;\n    position:absolute !important;\n    top:27px !important;\n    transform: scale(1.5);\n    width:16px !important;\n}\n\n.ogl_refreshTimer\n{\n    background:rgba(0,0,0,.8);\n    border-radius:14px;\n    bottom:2px;\n    left:3px;\n    padding:1px;\n    position:absolute;\n    text-align:center;\n    transition:opacity .3s;\n    width:15px;\n}\n\n.moonlink .ogl_refreshTimer\n{\n    left:1px;\n}\n\n.ogl_alt .ogl_refreshTimer\n{\n    opacity:0;\n}\n\n.smallplanet .constructionIcon\n{\n    display:none !important;\n    left:3px !important;\n    top:3px !important;\n}\n\n.smallplanet .constructionIcon.moon\n{\n    left:143px !important;\n}\n\n.smallplanet .alert\n{\n    display:none;\n}\n\n.smallplanet .ogl_sideIconBottom,\n.smallplanet .ogl_sideIconTop,\n.smallplanet .ogl_sideIconInfo\n{\n    align-items:center;\n    display:flex;\n    grid-gap:5px;\n    position:absolute;\n    right:-5px;\n    text-shadow:0 0 5px #000;\n    top:2px;\n    transform:translateX(100%);\n}\n\n.smallplanet .ogl_sideIconBottom\n{\n    bottom:11px;\n    top:auto;\n}\n\n.smallplanet .ogl_sideIconInfo\n{\n    bottom:2px;\n    top:auto;\n}\n\n.smallplanet .ogl_sideIconBottom > *,\n.smallplanet .ogl_sideIconTop > *,\n.smallplanet .ogl_sideIconInfo > *,\n.ogl_fleetIcon:before\n{\n    align-items:center;\n    cursor:pointer;\n    display:flex !important;\n    font-size:14px !important;\n}\n\n.smallplanet .ogl_sideIconInfo > *\n{\n    color:var(--yellow);\n    font-size:10px !important;\n}\n\n.smallplanet .ogl_sideIconBottom .ogl_fleetIcon:before\n{\n    transform:scaleX(-1);\n}\n\n.smallplanet .ogl_todoIcon\n{\n    color:#cfcfcf;\n}\n\n.smallplanet .ogl_todoIcon:hover,\n.smallplanet .ogl_fleetIcon:hover\n{\n    color:var(--ogl) !important;\n}\n\n.smallplanet .ogl_todoIcon:after,\n.smallplanet .ogl_fleetIcon:after\n{\n    content:attr(data-list);\n    font-family:Verdana, Arial, SunSans-Regular, sans-serif;\n    font-size:12px;\n    font-weight:bold;\n}\n\n.msg\n{\n    background:var(--tertiary) !important;\n    outline:1px solid #000;\n    overflow:hidden;\n    position:relative;\n}\n\n.msg[data-msgType] .msg_status:before { background:none !important; }\n.msg[data-msgType="expe"] .msg_status { background:var(--mission15) !important; }\n.msg[data-msgType="discovery"] .msg_status { background:var(--lifeform) !important; }\n\n.msg_new\n{\n    background:linear-gradient(to bottom, #2e525e, #223644 6%, #172834 20%) !important;\n}\n\n.msg_title\n{\n    display:inline-flex !important;\n    grid-gap:5px;\n}\n\n.msg_title .ogl_checked\n{\n    display:inline-flex;\n    font-size:16px !important;\n}\n\n.msg_title .ogl_mainIcon\n{\n    color:var(--ogl) !important;\n}\n\n.msg_title .ogl_ptre\n{\n    color:#ff942c !important;\n}\n\n.ogl_battle\n{\n    align-items:center;\n    background:rgba(0, 0, 0, .15);\n    border:2px solid #323d4e;\n    border-radius:5px;\n    color:#48566c !important;\n    display:flex;\n    flex-wrap:wrap;\n    font-weight:bold;\n    justify-content:center;\n    margin:8px auto;\n    padding:3px 8px;\n    text-align:center;\n    text-transform:capitalize;\n    width:fit-content;\n    width:-moz-fit-content;\n}\n\n[data-resultType]:before\n{\n    content:\'\';\n    display:block;\n    font-family:\'Material Icons\';\n    font-size:18px;\n    font-weight:normal !important;\n    margin-right:10px;\n}\n\n[data-resultType="raid"]:before, [data-resultType="battle"]:before { content:\'\\ea15\'; }\n[data-resultType="resource"]:before, [data-resultType="darkmatter"]:before { content:\'\\e972\'; }\n[data-resultType="artefact"]:before { content:\'\\ea23\'; }\n[data-resultType="ship"]:before { content:\'\\e961\'; }\n[data-resultType="other"]:before { content:\'\\e9d0\'; }\n[data-resultType="nothing"]:before { content:\'\\e92b\'; }\n[data-resultType*="lifeform"]:before { content:\'\\e96e\'; }\n[data-resultType*="item"]:before { content:\'\\e996\'; }\n[data-resultType*="debris"]:before { content:\'\\e900\'; }\n[data-resultType*="early"]:before { content:\'\\ea54\'; }\n[data-resultType*="late"]:before, [data-resultType="duration"]:before { content:\'\\ea27\'; }\n[data-resultType*="blackhole"]:before { content:\'\\e960\'; }\n[data-resultType*="trader"]:before { content:\'\\ea03\'; }\n[data-resultType="alien"]:before { content:\'\\ea6b\'; }\n[data-resultType="pirate"]:before { content:\'\\ea61\'; }\n\n[data-resultType="alien"] { color:var(--alien) !important; }\n[data-resultType="pirate"], [data-resultType="battle"]  { color:var(--pirate) !important; }\n[data-resultType="blackhole"] { color:var(--blackhole) !important; }\n[data-resultType="trader"] { color:var(--trader) !important; }\n[data-resultType="item"] { color:var(--item) !important; }\n[data-resultType="early"] { color:var(--early) !important; }\n[data-resultType="late"], [data-resultType="duration"] { color:var(--late) !important; }\n[data-resultType="resource"] { color:var(--resource) !important; }\n[data-resultType="ship"] { color:var(--ship) !important; }\n[data-resultType="dm"], [data-resultType="darkmatter"] { color:var(--dm) !important; }\n\n.ogl_battle[data-resultType]:before\n{\n    color:#48566c !important;\n}\n\n.ogl_battle.ogl_clickable:hover\n{\n    border:2px solid var(--ogl);\n    cursor:pointer;\n}\n\n.ogl_battle .ogl_icon\n{\n    align-items:center;\n    background:none;\n    display:flex;\n    line-height:16px;\n    padding:0;\n}\n\n.ogl_battle .ogl_icon:not(:last-child)\n{\n    margin-right:20px;\n}\n\n.ogl_battle[data-resultType="ship"] .ogl_icon,\n.ogl_battle[data-resultType="global"] .ogl_icon\n{\n    color:#98b1cb;\n    display:grid;\n    grid-gap:3px;\n}\n\n.ogl_battle[data-resultType="ship"] .ogl_icon:not(:last-child)\n{\n    margin-right:7px;\n}\n\n.ogl_battle[data-resultType="global"] .ogl_icon:not(:last-child)\n{\n    margin-right:0;\n}\n\n.ogl_battle .ogl_icon:before\n{\n    background-size:400px;\n    border-radius:0;\n    display:block;\n    height:20px;\n    image-rendering:auto;\n    margin:0 5px 0 0;\n    vertical-align:bottom;\n    width:32px;\n}\n\n.ogl_battle[data-resultType="raid"] .ogl_icon\n{\n    display:grid;\n}\n\n.ogl_battle[data-resultType="raid"] .ogl_icon:before\n{\n    grid-row:1 / 3;\n}\n\n.ogl_battle[data-resultType="raid"] .ogl_icon > span:last-child\n{\n    grid-column:2;\n    grid-row:2;\n}\n\n.ogl_battle[data-resultType="ship"] .ogl_icon:before,\n.ogl_battle[data-resultType="global"] .ogl_icon:before\n{\n    margin:auto;\n}\n\n.ogl_battle .ogl_icon[class*="ogl_2"]:before\n{\n    background-size:40px;\n}\n\n.ogl_battle .ogl_icon.ogl_artefact:before\n{\n    background-position:59% 28%;\n    background-size:50px;\n}\n\n.ogl_battle .ogl_icon.ogl_lifeform1:before { background-position:1px 76%; }\n.ogl_battle .ogl_icon.ogl_lifeform2:before { background-position:11% 76%; }\n.ogl_battle .ogl_icon.ogl_lifeform3:before { background-position:22% 76%; }\n.ogl_battle .ogl_icon.ogl_lifeform4:before { background-position:32% 76%; }\n\n.ogl_expeRecap\n{\n    background:#14181f;\n    font-size:11px;\n    grid-gap:8px;\n    padding:10px 0 6px 0;\n    position:relative;\n    width:auto;\n}\n\n.ogl_expeRecap:before\n{\n    margin-left:0 !important;\n}\n\n.ogl_expeRecap:after\n{\n    background:var(--blue);\n    border-radius:50px;\n    box-shadow:0 0 6px -2px #000;\n    color:#fff;\n    content:attr(data-count);\n    font-size:10px;\n    padding:4px 5px;\n    position:absolute;\n    right:-3px;\n    text-transform:lowercase;\n    top:-3px;\n}\n\n#messages .tab_favorites, #messages .tab_inner\n{\n    background:#030406 !important;\n    background-size:410px;\n}\n\n.ogl_deleted\n{\n    color:var(--red);\n    opacity:.5;\n}\n\n.ogl_spytable\n{\n    background:#12161a;\n    border-radius:5px;\n    color:#93b3c9;\n    counter-reset:spy;\n    font-size:11px;\n    padding:5px;\n    user-select:none;\n}\n\n.ogl_spytable:after\n{\n    content:attr(data-total);\n    display:flex;\n    justify-content:end;\n    padding:5px 0;\n    position:relative;\n    right:224px;\n}\n\n#fleetsTab .ogl_spytable\n{\n    margin-bottom:-25px;\n    margin-top:55px;\n}\n\n.ogl_spytable a.ogl_important span\n{\n    color:#fff !important;\n}\n\n.ogl_spytable hr\n{\n    background:#1e252e;\n    border:none;\n    grid-column:1 / -1;\n    height:2px;\n    width:100%;\n}\n\n.ogl_spytable .ogl_spyIcon\n{\n    font-size:16px !important;\n}\n\n.ogl_spytable a:not(.ogl_button):not([class*="status_abbr"]), .ogl_spytable [data-galaxy]:not(.ogl_button)\n{\n    color:inherit !important;\n}\n\n.ogl_spytable a:hover, .ogl_spytable [data-galaxy]:hover\n{\n    text-decoration:underline !important;\n}\n\n.ogl_spytable .ogl_spyLine > div:not(.ogl_more), .ogl_spyHeader\n{\n    align-items:center;\n    border-radius:3px;\n    display:grid;\n    grid-gap:3px;\n    grid-template-columns:22px 34px 30px 24px 96px auto 70px 40px 40px 130px;\n    margin-bottom:2px;\n}\n\n.ogl_spytable .ogl_spyLine:not(:first-child)\n{\n    counter-increment:spy;\n}\n\n.ogl_spytable .ogl_spyLine > div > span,\n.ogl_spytable .ogl_spyLine > div > a\n{\n    align-items:center;\n    background:var(--secondary);\n    border-radius:3px;\n    display:flex;\n    height:24px;\n    overflow:hidden;\n    padding:0 4px;\n    position:relative;\n    text-overflow:ellipsis;\n    white-space:nowrap;\n}\n\n.ogl_spytable .ogl_spyLine > div > a\n{\n    text-decoration:none;\n}\n\n.ogl_spytable .ogl_spyLine > div > span:nth-child(5), .ogl_spytable > div > span:nth-child(6), .ogl_spytable > div > span:nth-child(7) { justify-content:right; }\n\n.ogl_spytable .ogl_spyLine > div > span:first-child:before\n{\n    content:counter(spy);\n}\n\n.ogl_spytable .msg_action_link\n{\n    overflow:hidden;\n    padding:0 !important;\n    text-overflow:ellipsis;\n}\n\n.ogl_spytable .ogl_fleetIcon\n{\n    bottom:-2px;\n    left:1px;\n    pointer-events:none;\n    position:absolute;\n    text-shadow:1px 1px 3px #000;\n}\n\n.ogl_spytable .ogl_spyLine > div > span a\n{\n    text-decoration:none;\n}\n\n.ogl_spytable .ogl_spyLine a:not(.ogl_button):hover,\n.ogl_spytable .ogl_spyLine [data-galaxy]:hover\n{\n    color:#fff !important;\n    cursor:pointer !important;\n    text-decoration:underline !important;\n}\n\n.ogl_spytable .ogl_spyHeader b\n{\n    background:#12161a;\n    border-radius:3px;\n    color:#3c4f5a;\n    font-size:11px !important;\n    line-height:27px !important;\n    padding-left:4px;\n}\n\n.ogl_spytable .ogl_spyHeader b.material-icons\n{\n    font-size:14px !important;\n}\n\n.ogl_spytable .ogl_spyHeader b:first-child,\n.ogl_spytable .ogl_spyHeader b:nth-child(3)\n{\n    padding-left:0;\n}\n\n.ogl_spytable .ogl_spyHeader b:last-child,\n.ogl_spytable .ogl_spyHeader span:last-child\n{\n    background:none;\n    padding:0;\n}\n\n.ogl_spytable .ogl_spyHeader [data-filter].ogl_active\n{\n    color:var(--amber);\n}\n\n.ogl_spytable [data-title]:not(.ogl_spyIcon):not([class*="status_abbr"])\n{\n    color:inherit !important;\n}\n\n.ogl_spytable [data-filter]:after\n{\n    color:#3c4f5a;\n    content:\'\\ea28\';\n    font-family:\'Material Icons\';\n    font-size:16px;\n    float:right;\n}\n\n.ogl_spytable .ogl_spyHeader [data-filter]:hover\n{\n    color:#fff;\n    cursor:pointer;\n}\n\n.ogl_spytable .ogl_actions\n{\n    background:none !important;\n    border-radius:0 !important;\n    font-size:16px;\n    grid-gap:2px;\n    justify-content:space-between;\n    padding:0 !important;\n}\n\n.ogl_spytable .ogl_type > *\n{\n    color:#b7c1c9;\n    font-size:16px !important;\n}\n\n.ogl_spytable .ogl_type > *:hover\n{\n    color:#fff;\n}\n\n.ogl_spytable .ogl_actions .ogl_button\n{\n    border:none;\n    height:24px !important;\n    line-height:24px !important;\n    padding:0;\n    text-decoration:none !important;\n    width:100%;\n}\n\n.ogl_spytable .ogl_actions > *:not(.material-icons)\n{\n    font-weight:bold;\n    font-size:12px;\n}\n\n.ogl_spytable .ogl_reportTotal,\n.ogl_spytable .ogl_actions a:hover\n{\n    text-decoration:none;\n}\n\n.ogl_spyLine .ogl_more\n{\n    background:var(--primary);\n    border-radius:3px;\n    margin-bottom:3px;\n    padding:7px;\n}\n\n.ogl_spyLine .ogl_more .ogl_icon\n{\n    align-items:center;\n    display:flex;\n}\n\n.ogl_spyLine .ogl_more > div\n{\n    align-items:center;\n    display:grid;\n    grid-gap:5px;\n    grid-template-columns:repeat(auto-fit, minmax(0, 1fr));\n    margin-bottom:5px;\n}\n\n.ogl_spyLine .ogl_more > div > *\n{\n    background:var(--secondary);\n    border-radius:3px;\n    line-height:20px;\n    padding:2px;\n    text-decoration:none;\n}\n\n.ogl_spyLine .ogl_more a:hover\n{\n    color:#fff;\n}\n\n.ogl_trashCounterSpy\n{\n    display:block !important;\n    font-size:16px !important;\n    line-height:26px !important;\n    min-width:0 !important;\n    padding:0 !important;\n    position:absolute;\n    right:104px;\n    top:48px;\n    width:28px;\n}\n\n.galaxyTable\n{\n    background:#10151a !important;\n}\n\n#galaxycomponent .systembuttons img\n{\n    pointer-events:none;\n}\n\n#galaxyContent .ctContentRow .galaxyCell\n{\n    background:var(--secondary) !important;\n    border-radius:2px !important;\n}\n\n#galaxyContent .cellPlanetName, #galaxyContent .cellPlayerName\n{\n    justify-content:left !important;\n    padding:0 5px;\n}\n\n#galaxyContent .cellPlanetName span\n{\n    max-width:72px;\n    overflow:hidden;\n    text-overflow:ellipsis;\n    white-space:nowrap;\n}\n\n#galaxyContent .cellPlayerName\n{\n    flex-basis:78px !important;\n}\n\n#galaxyContent .cellPlayerName .tooltipRel:hover\n{\n    text-decoration:underline;\n}\n\n#galaxyContent .cellPlayerName [rel]\n{\n    line-height:18px;\n    max-width:90px;\n    overflow:hidden;\n    text-overflow:ellipsis;\n    white-space:nowrap;\n}\n\n#galaxyContent .cellPlayerName pre\n{\n    display:none;\n}\n\n.ogl_ranking\n{\n    text-decoration:none !important;\n}\n\n#galaxyContent .ogl_ranking\n{\n    color:#7e95a9;\n    cursor:pointer;\n}\n\n#galaxyContent .ogl_ranking:hover\n{\n    color:#fff;\n}\n\n#galaxyContent .ogl_ranking a\n{\n    color:inherit;\n    text-decoration:none;\n}\n\n#galaxyHeader .btn_system_action\n{\n    max-width:100px;\n    overflow:hidden\n}\n\n#galaxyContent .cellPlayerName [class*="status_abbr"]\n{\n    margin-right:auto;\n}\n\n#galaxyContent .ownPlayerRow\n{\n    cursor:pointer;\n}\n\n#galaxyContent .ctContentRow .cellDebris a\n{\n    line-height:30px;\n    text-decoration:none;\n    text-align:center;\n    white-space:nowrap;\n}\n\n#galaxyContent .ctContentRow .cellDebris.ogl_important a\n{\n    color:#fff !important;\n}\n\n[class*="filtered_filter_"]\n{\n    opacity:1 !important;\n}\n\n#galaxyContent .ctContentRow[class*="filtered_filter_"] .galaxyCell:not(.ogl_important)\n{\n    background:#12181e !important;\n}\n\n#galaxyContent .expeditionDebrisSlotBox\n{\n    background:var(--primary) !important;\n}\n\n#galaxyContent .expeditionDebrisSlotBox .material-icons\n{\n    color:#48566c;\n    font-size:20px !important;\n}\n\n#galaxyContent .ctContentRow .galaxyCell.cellDebris.ogl_important,\n#galaxyContent .ogl_expeditionRow.ogl_important,\n.ogl_spytable .ogl_important\n{\n    background:linear-gradient(192deg, #a96510, #6c2c0d 70%) !important;\n}\n\n#galaxyContent .ogl_expeditionRow.ogl_important .material-icons\n{\n    color:#bb6848;\n}\n\n[class*="filtered_filter_"] > .cellPlanet:not(.ogl_important) .microplanet,\n[class*="filtered_filter_"] > .cellPlanetName:not(.ogl_important) span:not(.icon),\n[class*="filtered_filter_"] > .cellMoon:not(.ogl_important) .micromoon,\n[class*="filtered_filter_"] > .cellPlayerName:not(.ogl_important) span,\n[class*="filtered_filter_"] > .cellPlayerName:not(.ogl_important) .ogl_ranking,\n[class*="filtered_filter_"] > .cellAlliance:not(.ogl_important) span,\n[class*="filtered_filter_"] > .cellAction:not(.ogl_important) a:not(.planetDiscover):not(.planetMoveIcons)\n{\n    opacity:.2 !important;\n}\n\n.ogl_popup\n{\n    align-items:center;\n    background:rgba(0,0,0,.85);\n    display:flex;\n    flex-direction:column;\n    height:100%;\n    justify-content:center;\n    left:0;\n    opacity:0;\n    pointer-events:none;\n    position:fixed;\n    top:0;\n    width:100%;\n    z-index:1000001;\n}\n\n.ogl_popup.ogl_active\n{\n    pointer-events:all;\n    opacity:1;\n}\n\n.ogl_popup .ogl_close, .ogl_popup .ogl_share\n{\n    color:#556672;\n    cursor:pointer;\n    font-size:18px !important;\n    line-height:30px!important;\n    position:absolute;\n    text-align:center;\n    top:2px;\n    right:0;\n    width:30px;\n}\n\n.ogl_popup .ogl_close:hover, .ogl_popup .ogl_share:hover\n{\n    color:#fff;\n}\n\n.ogl_popup .ogl_share\n{\n    font-size:16px !important;\n    top:30px;\n}\n\n.ogl_popup > *:not(.ogl_close):not(.ogl_share)\n{\n    animation:pop .15s;\n    background:var(--primary);\n    background:#0f1218;\n    border-radius:3px;\n    /* box-shadow:0 0 10px 1px #000; cause html2canvas to bug */\n    max-height:80%;\n    max-width:980px;\n    overflow-y:auto;\n    overflow-x:hidden;\n    padding:30px;\n    position:relative;\n}\n\n.ogl_popup h2\n{\n    border-bottom:2px solid #161b24;\n    color:#9dbddd;\n    font-size:14px;\n    margin-bottom:16px;\n    padding-bottom:7px;\n    text-align:center;\n}\n\n@keyframes pop\n{\n    from { opacity:0; transform:translateY(-30px) };\n    to { opacity:1; transform:translateY(0px) };\n}\n\n.ogl_keeper\n{\n    max-width:700px !important;\n}\n\n.ogl_keeper .ogl_limiterLabel\n{\n    float:left;\n    margin-right:20px;\n    width:100px;\n}\n\n.ogl_keeper .ogl_limiterLabel input\n{\n    margin-left:auto;\n}\n\n.ogl_keeper hr\n{\n    background:#1e252e;\n    border:none;\n    grid-column:1 / -1;\n    height:2px;\n    width:100%;\n}\n\n.ogl_resourceLimiter, .ogl_shipLimiter, .ogl_jumpgateLimiter\n{\n    background:#1b202a;\n    border-radius:3px;\n    display:grid;\n    grid-gap:5px 18px;\n    grid-template-columns:repeat(12, 1fr);\n    padding:12px;\n}\n\n.ogl_shipLimiter, .ogl_jumpgateLimiter\n{\n    grid-template-columns:repeat(20, 1fr);\n}\n\n.ogl_keeper .ogl_icon\n{\n    grid-column:span 4;\n    padding:0;\n}\n\n.ogl_keeper .ogl_metal, .ogl_keeper .ogl_crystal, .ogl_keeper .ogl_deut, .ogl_keeper .ogl_food\n{\n    grid-column:span 3;\n}\n\n.ogl_keeper .ogl_icon:before\n{\n    margin-right:5px !important;\n    vertical-align:text-bottom;\n}\n\n.ogl_keeper input\n{\n    background:#121518;\n    border:none;\n    border-bottom:1px solid #242a32;\n    border-radius:3px;\n    border-top:1px solid #080b10;\n    box-sizing:border-box;\n    color:inherit;\n    padding:4px 6px;\n    width:calc(100% - 34px);\n}\n\n.ogl_keeper .ogl_button\n{\n    background:var(--secondary);\n    border-radius:3px;\n    color:#fff;\n    cursor:pointer;\n    line-height:24px !important;\n}\n\n.ogl_keeper .ogl_button.ogl_active\n{\n    background:var(--highlight);\n}\n\n.ogl_keeper .ogl_button:last-child\n{\n    grid-column:-2;\n}\n\n.ogl_keeper .ogl_profileTabs\n{\n    display:grid;\n    grid-gap:0 5px;\n    grid-template-columns:repeat(5, 1fr);\n    grid-column:1 / -1;\n}\n\n.ogl_keeper input.ogl_title\n{\n    grid-column:1 / -1;\n    padding:8px;\n    text-align:center;\n    width:100%;\n}\n\n.ogl_keeper h2\n{\n    grid-column:1 / -1;\n}\n\n.ogl_keeper h2:not(:nth-child(2))\n{\n    margin:20px 0 10px 0;\n}\n\n.ogl_keeper .ogl_missionPicker\n{\n    display:grid;\n    grid-column:1 / -1;\n    grid-gap:4px;\n    grid-template-columns:repeat(11, auto);\n    justify-content:end;\n    margin-top:10px;\n}\n\n.ogl_keeper .ogl_missionPicker [data-mission]\n{\n    filter:grayscale(1);\n}\n\n.ogl_keeper .ogl_missionPicker [data-mission]:hover\n{\n    cursor:pointer;\n    filter:grayscale(.5);\n}\n\n.ogl_keeper .ogl_missionPicker .ogl_active\n{\n    box-shadow:none !important;\n    filter:grayscale(0) !important;\n}\n\n.ogl_empire\n{\n    color:#6a7d95;\n    display:grid;\n    font-size:11px;\n    font-weight:bold;\n    grid-gap:3px 8px;\n    grid-template-columns:90px 24px 24px 100px 100px 60px 24px 130px 130px 130px;\n}\n\n.ogl_empire .ogl_icon\n{\n    background:none !important;\n    justify-content:center;\n    padding:0;\n}\n\n.ogl_empire .material-icons\n{\n    font-size:18px !important;\n    line-height:30px !important;\n}\n\n.ogl_empire img\n{\n    box-sizing:border-box;\n    height:24px;\n    padding:3px;\n}\n\n.ogl_empire > *:not(.ogl_close):not(.ogl_share):not(a)\n{\n    background:var(--secondary);\n    border-radius:3px;\n    line-height:24px;\n    position:relative;\n    text-align:center;\n}\n\n.ogl_empire > [class*="ogl_lifeform"]:before\n{\n    border-radius:3px;\n    image-rendering:pixelated;\n}\n\n.ogl_empire strong\n{\n    float:left;\n    font-size:14px;\n    padding-left:10px;\n}\n\n.ogl_empire strong span\n{\n    color:#ff982d !important;\n    font-size:10px;\n    margin-left:2px;\n}\n\n.ogl_empire small\n{\n    color:#ccc;\n    float:right;\n    font-size:10px;\n    opacity:.6;\n    padding-right:10px;\n}\n\n.ogl_empire .ogl_icon:before\n{\n    margin:0;\n}\n\n.ogl_empire img:hover\n{\n    filter:brightness(1.5);\n}\n\n.ogl_side\n{\n    background:var(--primary);\n    box-shadow:0 0 50px #000;\n    box-sizing:border-box;\n    height:100%;\n    overflow:auto;\n    padding:40px 18px 18px 18px;\n    position:fixed;\n    right:0;\n    top:0;\n    transform:translateX(100%);\n    transition:transform .3s;\n    width:385px;\n    z-index:1000000;\n}\n\n.ogl_side.ogl_active\n{\n    box-shadow:0 0 50px #000;\n    transform:translateX(0%);\n}\n\n.ogl_side .ogl_close,\n.ogl_side .ogl_back\n{\n    color:#556672;\n    cursor:pointer;\n    font-size:28px !important;\n    position:absolute;\n    top:10px;\n    right:20px;\n}\n\n.ogl_side .ogl_close:hover,\n.ogl_side .ogl_back:hover\n{\n    color:#fff;\n}\n\n.ogl_side .ogl_back\n{\n    left:20px;\n    right:auto;\n}\n\n.ogl_side hr\n{\n    background:#151e28;\n    border:none;\n    grid-column:1 / -1;\n    height:2px;\n    width:100%;\n}\n\n.ogl_side h2\n{\n    align-items:center;\n    color:#7e8dab;\n    display:flex;\n    font-size:14px;\n    justify-content:center;\n    margin-bottom:20px;\n}\n\n.ogl_side h2 .ogl_flagPicker\n{\n    height:17px;\n    margin-left:5px;\n}\n\n.ogl_side h2 i\n{\n    margin-left:10px;\n}\n\n.ogl_topbar\n{\n    border-bottom:2px solid #0e1116;\n    color:#546a89;\n    display:grid;\n    font-size:16px;\n    grid-template-columns:repeat(7, 1fr);\n    text-align:center;\n    user-select:none;\n    width:205px;\n}\n\n.ogl_topbar > *:nth-child(1):hover { color:#dbc453 !important; }\n.ogl_topbar > *:nth-child(2):hover { color:#4bbbd5 !important; }\n/*.ogl_topbar > *:nth-child(3):hover { color:#a978e9 !important; }*/\n.ogl_topbar > *:nth-child(3):hover { color:#e17171 !important; }\n.ogl_topbar > *:nth-child(4):hover { color:#76d19a !important; }\n.ogl_topbar > *:nth-child(5):hover { color:#a1aac9 !important; }\n.ogl_topbar > *:nth-child(6):hover { color:#fd7db8 !important; }\n.ogl_topbar > *:nth-child(7):hover { color:#ffffff !important; }\n\n.ogl_topbar > *:not(.ogl_button)\n{\n    cursor:pointer;\n    color:inherit !important;\n    display:block;\n    line-height:30px !important;\n    text-decoration:none;\n}\n\n.ogl_topbar > *:hover\n{\n    text-shadow:1px 1px 2px #000;\n}\n\n.ogl_topbar .ogl_disabled\n{\n    color:#898989 !important;\n    opacity:.8 !important;\n}\n\n.ogl_topbar .ogl_active\n{\n    animation:spinAlt infinite 1s;\n}\n\n@keyframes spin\n{\n    0% { transform:rotate(0); }\n    100% { transform:rotate(-360deg); }\n}\n\n.ogl_topbar button\n{\n    border:none;\n    grid-column:1 / -1;\n    line-height:26px !important;\n    margin:0;\n    max-height:0;\n    opacity:0;\n    pointer-events:none;\n    transition:max-height .3s cubic-bezier(0, 1, 0, 1);\n}\n\n.ogl_initHarvest .ogl_topbar button\n{\n    boder:1px solid #17191c;\n    display:block;\n    margin:5px;\n    max-height:30px;\n    opacity:1;\n    pointer-events:all;\n    transition:max-height .1s ease-in-out;\n}\n\n.ogl_config\n{\n    display:grid;\n    grid-gap:8px;\n    line-height:26px;\n}\n\n.ogl_config label\n{\n    align-items:center;\n    background:linear-gradient(-207deg, #0d1014, #212b34);\n    border-radius:3px;\n    color:#c7c7c7;\n    display:flex;\n    margin:2px 0px;\n    padding:0;\n}\n\n.ogl_config label:before\n{\n    content:attr(data-label);\n    display:block;\n}\n\n.ogl_config label.tooltipLeft:before\n{\n    text-decoration:underline dotted;\n}\n\n.ogl_config label > *:nth-child(1)\n{\n    margin-left:auto;\n}\n\n.ogl_config label > input[type="text"],\n.ogl_config label > input[type="password"],\n.ogl_config label > select\n{\n    background:#121518;\n    border:none;\n    border-bottom:1px solid #242a32;\n    border-radius:3px;\n    border-top:1px solid #080b10;\n    box-shadow:none;\n    box-sizing:border-box;\n    color:#5d738d;\n    font-size:12px;\n    height:22px;\n    visibility:visible !important;\n    width:105px;\n}\n\n.ogl_config label > input[type="checkbox"],\n.ogl_todoList input[type="checkbox"],\n.ogl_limiterLabel input[type="checkbox"]\n{\n    align-items:center;\n    appearance:none;\n    background:#121518;\n    border:none;\n    border-bottom:1px solid #242a32;\n    border-radius:2px;\n    border-top:1px solid #080b10;\n    color:var(--ogl);\n    cursor:pointer;\n    display:flex;\n    height:16px;\n    justify-content:center;\n    width:16px;\n}\n\n.ogl_config label > input[type="checkbox"]:hover,\n.ogl_todoList input[type="checkbox"]:hover,\n.ogl_limiterLabel input[type="checkbox"]:hover\n{\n    box-shadow:0 0 0 2px var(--ogl);\n}\n\n.ogl_config label > input[type="checkbox"]:checked:before,\n.ogl_todoList input[type="checkbox"]:checked:before,\n.ogl_limiterLabel input[type="checkbox"]:checked:before\n{\n    content:\'\\e936\';\n    font-family:\'Material Icons\';\n    font-size:18px !important;\n    pointer-events:none;\n}\n\n.ogl_config .ogl_icon[class*="ogl_2"],\n.ogl_config .ogl_icon[class*="ogl_mission"]\n{\n    cursor:pointer;\n    padding:0;\n}\n\n.ogl_config .ogl_icon[class*="ogl_2"]:not(:first-child),\n.ogl_config .ogl_icon[class*="ogl_mission"]:not(:first-child)\n{\n    margin-left:5px;\n}\n\n.ogl_config .ogl_icon[class*="ogl_2"]:hover:before,\n.ogl_config .ogl_icon[class*="ogl_mission"]:hover:before\n{\n    box-shadow:0 0 0 2px var(--ogl);\n}\n\n.ogl_config .ogl_icon[class*="ogl_2"].ogl_active:before,\n.ogl_config .ogl_icon[class*="ogl_mission"].ogl_active:before\n{\n    box-shadow:0 0 0 2px #fff;\n}\n\n.ogl_config .ogl_icon[class*="ogl_2"]:before,\n.ogl_config .ogl_icon[class*="ogl_mission"]:before\n{\n    margin:0;\n    vertical-align:middle;\n}\n\n.ogl_config .ogl_icon[class*="ogl_mission"]:before\n{\n    background-size:318px !important;\n    background-position-y:-6px !important;\n}\n\n.ogl_config [data-container]\n{\n    background:#0e1116;\n    border-radius:3px;\n    max-height:24px;\n    overflow:hidden;\n    padding:5px;\n    transition:max-height .3s cubic-bezier(0, 1, 0, 1);\n}\n\n.ogl_config [data-container].ogl_active\n{\n    max-height:400px;\n    transition:max-height .3s ease-in-out;\n}\n\n.ogl_config [data-container] > *\n{\n    padding:0 7px;\n}\n\n.ogl_config h3\n{\n    align-items:center;\n    border-radius:3px;\n    color:#90aed5;\n    cursor:pointer;\n    display:flex;\n    font-size:12px;\n    margin-bottom:5px;\n    overflow:hidden;\n    position:relative;\n    text-align:left;\n    text-transform:capitalize;\n    user-select:none;\n}\n\n.ogl_config [data-container] h3:hover\n{\n    box-shadow:inset 0 0 0 2px var(--ogl);\n    color:var(--ogl);\n}\n\n.ogl_config > div h3:before, .ogl_config svg\n{\n    color:inherit;\n    fill:currentColor;\n    font-family:\'Material Icons\';\n    font-size:16px;\n    height:26px;\n    margin-right:5px;\n}\n\n.ogl_config [data-container="fleet"] h3:before { content:\'\\e961\'; }\n.ogl_config [data-container="general"] h3:before { content:\'\\e9e8\'; }\n.ogl_config [data-container="interface"] h3:before { content:\'\\e95d\'; }\n.ogl_config [data-container="expeditions"] h3:before { content:\'\\ea41\'; }\n.ogl_config [data-container="stats"] h3:before { content:\'\\ea3e\'; }\n.ogl_config [data-container="messages"] h3:before { content:\'\\e9be\'; }\n.ogl_config [data-container="PTRE"] h3:before { content:\'\\ea1e\'; }\n.ogl_config [data-container="data"] h3:before { content:\'\\ea3f\'; }\n\n.ogl_config h3:after\n{\n    content:\'\\e9b5\';\n    font-family:\'Material Icons\';\n    margin-left:auto;\n}\n\n.ogl_config label button\n{\n    background:linear-gradient(to bottom, #405064, #2D3743 2px, #181E25);\n    border:1px solid #17191c;\n    border-radius:3px;\n    color:#b7c1c9;\n    cursor:pointer;\n    font-size:16px !important;\n    height:22px !important;\n    line-height:18px !important;\n    position:relative;\n    text-shadow:1px 1px #000;\n    width:30px;\n}\n\n.ogl_config label button:hover\n{\n    color:var(--ogl);\n}\n\n.ogl_config label .ogl_choice\n{\n    background:linear-gradient(to bottom, #405064, #2D3743 2px, #181E25);\n    border-bottom:1px solid #17191c;\n    border-top:1px solid #17191c;\n    color:#b7c1c9;\n    cursor:pointer;\n    font-size:11px !important;\n    font-weight:bold;\n    height:20px !important;\n    line-height:20px !important;\n    position:relative;\n    text-align:center;\n    width:30px;\n}\n\n.ogl_config label .ogl_choice:first-child\n{\n    border-radius:3px 0 0 3px;\n}\n\n.ogl_config label .ogl_choice:last-child\n{\n    border-radius:0 3px 3px 0;\n}\n\n.ogl_config label .ogl_choice.ogl_active\n{\n    border-radius:3px;\n    box-shadow:0 0 0 2px #fff;\n    z-index:2;\n}\n\n.ogl_config label .ogl_choice:hover\n{\n    color:var(--ogl);\n}\n\n.ogl_keyboardActions\n{\n    display:grid;\n    grid-gap:5px 12px;\n    grid-template-columns:repeat(3, 1fr);\n}\n\n.ogl_keyboardActions h2\n{\n    grid-column:1 / -1;\n}\n\n.ogl_keyboardActions label\n{\n    background:var(--secondary);\n    align-items:center;\n    border-radius:3px;\n    display:grid;\n    grid-gap:15px;\n    grid-template-columns:auto 21px;\n    line-height:1.2px;\n    padding:10px;\n}\n\n.ogl_keyboardActions label:hover\n{\n    color:var(--amber);\n    cursor:pointer;\n}\n\n.ogl_keyboardActions label hr\n{\n    appearance:none;\n    border:none;\n}\n\n.ogl_keyboardActions input\n{\n    background:#fff !important;\n    border:none !important;\n    border-radius:3px !important;\n    box-shadow:none !important;\n    color:#000 !important;\n    font-size:15px !important;\n    font-weight:bold !important;\n    height:21px !important;\n    line-height:21px !important;\n    padding:0 !important;\n    text-align:center !important;\n    text-transform:uppercase !important;\n}\n\n.ogl_keyboardActions input:focus\n{\n    outline:2px solid var(--amber);\n}\n\n.ogl_keyboardActions button\n{\n    cursor:pointer;\n    grid-column:1 / -1;\n    line-height:30px !important;\n    margin-top:10px;\n}\n\n.ogl_planetList\n{\n    color:#566c7c;\n    font-size:11px;\n    margin-top:10px;\n}\n\n.ogl_planetList > div\n{\n    align-items:center;\n    display:grid;\n    grid-gap:3px;\n    grid-template-columns:24px 70px 44px 44px auto;\n    margin-bottom:3px;\n}\n\n.ogl_planetList > div > *:nth-child(2)\n{\n    text-align:left;\n    text-indent:5px;\n}\n\n.ogl_planetList > div > *:last-child\n{\n    color:var(--date);\n    font-size:10px;\n}\n\n.ogl_planetList [class*="Icon"]\n{\n    font-size:10px;\n}\n\n.ogl_planetList [class*="Icon"]:before\n{\n    font-size:16px;\n    margin-right:5px;\n    vertical-align:bottom;\n}\n\n.ogl_filterColor\n{\n    display:grid;\n    grid-auto-flow:column;\n    grid-gap:3px;\n    grid-template-rows:repeat(1, 1fr);\n    margin:10px 0;\n}\n\n.ogl_filterColor > *\n{\n    cursor:pointer;\n    height:18px;\n    border-radius:50%;\n}\n\n.ogl_filterColor > *.ogl_off,\nlabel.ogl_off\n{\n    opacity:.2;\n}\n\n.ogl_filterColor > *:hover,\nlabel.ogl_off:hover\n{\n    opacity:.7;\n}\n\n.ogl_filterStatus\n{\n    display:grid;\n    grid-auto-flow:column;\n    grid-gap:3px;\n    grid-template-rows:repeat(1, 1fr);\n    justify-content:end;\n    margin:10px 0;\n}\n\n.ogl_filterStatus > *\n{\n    background:#182b3b;\n    border-radius:4px;\n    cursor:pointer;\n    line-height:24px;\n    text-align:center;\n    width:24px;\n}\n\n.ogl_filterStatus > *.ogl_off\n{\n    opacity:.2;\n}\n\n.ogl_filterStatus > *:hover\n{\n    opacity:.7;\n}\n\n.ogl_filterGalaxy, .ogl_filterSystem\n{\n    color:#a0bacd;\n    display:grid;\n    font-size:11px;\n    grid-gap:3px;\n    grid-template-columns:repeat(10, 1fr);\n    line-height:24px;\n    text-align:center;\n}\n\n.ogl_filterGalaxy > *, .ogl_filterSystem > *\n{\n    background:#182b3b;\n    border-radius:4px;\n    cursor:pointer;\n}\n\n.ogl_filterGalaxy > *:hover, .ogl_filterSystem > *:hover\n{\n    color:#fff;\n    text-decoration:underline;\n}\n\n.ogl_filterGalaxy > .ogl_active:not(.ogl_disabled), .ogl_filterSystem > .ogl_active:not(.ogl_disabled)\n{\n    color:#ccc;\n    filter:brightness(1.4);\n}\n\n.ogl_filterGalaxy\n{\n    margin-top:30px;\n}\n\n.ogl_filterSystem\n{\n    margin-top:10px;\n}\n\n.ogl_watchList\n{\n    display:grid;\n    font-size:11px;\n    grid-gap:3px;\n    padding-top:40px;\n}\n\n.ogl_watchList > div\n{\n    display:grid;\n    grid-gap:3px;\n    grid-template-columns:24px auto 100px 50px;\n}\n\n.ogl_watchList > div > *\n{\n    background:#182b3b;\n    border-radius:3px;\n    height:24px;\n    line-height:24px;\n    padding:0 5px;\n}\n\n.ogl_watchList > div > *:nth-child(2):hover\n{\n    cursor:pointer;\n    text-decoration:underline;\n}\n\n.ogl_targetList\n{\n    display:grid;\n    font-size:11px;\n    grid-gap:3px;\n    padding-top:30px;\n}\n\n.ogl_targetList .honorRank\n{\n    margin-right:1px;\n    transform:scale(75%);\n    vertical-align:sub;\n}\n\n.ogl_targetList .ogl_target\n{\n    color:#566c7c;\n    display:grid;\n    grid-gap:3px;\n    grid-template-columns:76px auto 24px 24px 24px 24px 24px;\n    line-height:24px;\n    position:relative;\n}\n\n.ogl_targetList .ogl_target > *\n{\n    background:#182b3b;\n    border-radius:3px;\n    height:24px;\n    overflow:hidden;\n    text-overflow:ellipsis;\n    white-space:nowrap;\n}\n\n.ogl_targetList .ogl_target [data-galaxy]\n{\n    text-indent:17px;\n}\n\n.ogl_targetList .ogl_target [class*="status_abbr_"]\n{\n    text-indent:3px;\n}\n\n.ogl_targetList .ogl_target > *:first-child\n{\n    align-self:center;\n    border-radius:50%;\n    display:block;\n    height:7px;\n    left:6px;\n    position:absolute;\n    width:7px;\n    z-index:2;\n}\n\n.ogl_targetList .ogl_target > *\n{\n    grid-row:1;\n}\n\n.ogl_targetList .ogl_target > [class*="Icon"]:hover\n{\n    color:#fff;\n    cursor:pointer;\n}\n\n.ogl_ogameDiv\n{\n    background:linear-gradient(0deg, #0d1014, #1b222a);\n    box-shadow:0 0 20px -5px #000, 0 0 0 1px #17191c;\n    border-radius:0;\n    padding:2px;\n    position:relative;\n}\n\n.ogl_miniStats\n{\n    border-radius:3px;\n    cursor:pointer;\n    margin-top:10px;\n    width:130px;\n}\n\n.ogl_miniStats:hover:not(:has(.ogl_button:hover))\n{\n    box-shadow:0 0 0 2px var(--ogl);\n}\n\n.ogl_miniStats > div\n{\n    background:var(--secondaryReversed);\n    display:grid;\n    font-size:11px;\n    grid-gap:8px 0;\n    grid-template-columns:repeat(3, 1fr);\n    justify-content:center;\n    padding:10px 0px;\n}\n\n.ogl_miniStats .ogl_header\n{\n    border-bottom:1px solid #2a3540;\n    height:18px;\n    line-height:18px;\n    padding:5px;\n    user-select:none;\n}\n\n.ogl_miniStats .ogl_header span\n{\n    display:inline-block;\n    line-height:15px;\n    text-transform:capitalize;\n}\n\n.ogl_miniStats .ogl_header div\n{\n    color:#fff;\n    cursor:pointer;\n    z-index:1;\n}\n\n.ogl_miniStats .ogl_header div:first-child\n{\n    left:6px;\n    position:absolute;\n}\n\n.ogl_miniStats .ogl_header div:last-child\n{\n    right:2px;\n    position:absolute;\n}\n\n.ogl_miniStats .ogl_icon\n{\n    align-items:center;\n    background:none;\n    display:grid;\n    font-weight:bold;\n    grid-gap:3px;\n    justify-content:center;\n    padding:0;\n    text-align:center;\n}\n\n.ogl_miniStats .ogl_icon > span\n{\n    /*margin-left:auto;\n    margin-right:30px;*/\n}\n\n.ogl_miniStats .ogl_icon:before\n{\n    margin:auto;\n    height:20px;\n}\n\n.ogl_miniStats .ogl_artefact:before\n{\n    background-size:23px;\n}\n\n.ogl_stats\n{\n    display:grid;\n}\n\n.ogl_stats h3\n{\n    color:#97a7c5;\n    font-size:11px;\n    font-weight:bold;\n    grid-column:1 / -1;\n    margin-top:20px;\n    text-align:center;\n}\n\n.ogl_statsMonth\n{\n    align-items:center;\n    display:flex;\n    grid-gap:5px;\n}\n\n.ogl_statsMonth > *\n{\n    padding:0 10px;\n}\n\n.ogl_statsMonth .ogl_button:not(.material-icons)\n{\n    text-transform:uppercase;\n}\n\n.ogl_dateBar\n{\n    background:#181d26;\n    border-radius:5px;\n    display:flex;\n    margin:20px 0;\n    padding:4px;\n    user-select:none;\n}\n\n.ogl_dateBar .ogl_item\n{\n    align-items:end;\n    box-sizing:border-box;\n    cursor:ew-resize;\n    display:grid;\n    grid-template-rows:50px 16px;\n    flex:1;\n    justify-content:center;\n    padding:12px 2px 5px 2px;\n    position:relative;\n}\n\n.ogl_dateBar .ogl_item:after\n{\n    content:attr(data-day);\n    display:block;\n    opacity:.3;\n    pointer-events:none;\n    text-align:center;\n}\n\n.ogl_dateBar .ogl_item.ogl_active:after\n{\n    opacity:1;\n}\n\n.ogl_dateBar .ogl_item > div\n{\n    border-radius:4px;\n    cursor:pointer;\n    font-size:10px;\n    font-weight:bold;\n    height:100%;\n    pointer-events:none;\n    width:20px;\n}\n\n.ogl_dateBar .ogl_selected\n{\n    background:#524728;\n    border-bottom:2px solid var(--ogl);\n    border-top:2px solid var(--ogl);\n    padding-bottom:3px;\n    padding-top:10px;\n}\n\n.ogl_dateBar .ogl_selected:not(.ogl_selected + .ogl_selected)\n{\n    border-left:2px solid var(--ogl);\n    border-bottom-left-radius:5px;\n    border-top-left-radius:5px;\n    padding-left:0;\n}\n\n.ogl_dateBar .ogl_selected:has(+ :not(.ogl_selected)),\n.ogl_dateBar .ogl_item.ogl_selected:last-child\n{\n    border-right:2px solid var(--ogl);\n    border-bottom-right-radius:5px;\n    border-top-right-radius:5px;\n    padding-right:0;\n}\n\n.ogl_dateBar > .ogl_item:hover\n{\n    background:#524728;\n}\n\n.ogl_popup.ogl_active .ogl_dateBar .ogl_active\n{\n    color:#fff !important;\n    pointer-events:all;\n}\n\n.ogl_statsDetails\n{\n    align-items:end;\n    display:grid;\n    grid-gap:20px;\n    grid-template-columns:430px 430px;\n}\n\n.ogl_statsDetails h3\n{\n    color:var(--ogl);\n}\n\n.ogl_pie\n{\n    align-items:center;\n    background:var(--secondary);\n    border-radius:5px;\n    display:flex;\n    grid-gap:20px;\n    height:182px;\n    justify-content:center;\n    padding:0 20px;\n    position:relative;\n}\n\n.ogl_pie:before\n{\n    align-items:center;\n    content:attr(data-pie);\n    color:#fff;\n    display:grid;\n    font-size:12px;\n    height:100%;\n    justify-content:center;\n    left:0;\n    line-height:18px;\n    pointer-events:none;\n    position:absolute;\n    text-align:center;\n    text-shadow:1px 1px 5px #000;\n    top:0;\n    width:200px;\n    white-space:pre;\n    z-index:3;\n}\n\n.ogl_noExpe\n{\n    display:grid;\n    grid-gap:10px;\n}\n\n.ogl_pie span.material-icons\n{\n    color:#313e4e;\n    font-size:100px !important;\n    margin:auto;\n}\n\n.ogl_pie canvas\n{\n    height:160px;\n    width:160px;\n}\n\n.ogl_pie .ogl_pieLegendContainer\n{\n    align-items:center;\n    border-radius:5px;\n    display:grid;\n    min-height:120px;\n    width:210px;\n}\n\n.ogl_pie .ogl_pieLegend\n{\n    align-items:center;\n    border-radius:3px;\n    cursor:pointer;\n    display:grid;\n    grid-gap:5px;\n    grid-template-columns:18px auto 54px 41px;\n    white-space:nowrap;\n}\n\n.ogl_pie .ogl_pieLegend:hover,\n.ogl_pie .ogl_pieLegend.ogl_active\n{\n    box-shadow:0 0 0 2px #fff;\n}\n\n.ogl_pie .ogl_pieLegend > *\n{\n    color:#fff;\n    overflow:hidden;\n    text-overflow:ellipsis;\n}\n\n.ogl_pie .ogl_pieLegend > span\n{\n    justify-self:right;\n}\n\n.ogl_pie .ogl_pieLegend i\n{\n    font-size:smaller;\n    font-weight:normal;\n    opacity:.6;\n    text-align:right;\n}\n\n.ogl_pie .ogl_pieLegend .ogl_suffix\n{\n    display:inline;\n}\n\n.ogl_shipTable\n{\n    display:grid;\n    grid-gap:5px;\n    grid-template-columns:repeat(3, 1fr);\n    height:100%;\n}\n\n.ogl_shipTable > .ogl_icon\n{\n    background:var(--secondary);\n    box-sizing:border-box;\n    padding-right:10px;\n}\n\n.ogl_shipTable > .ogl_icon:before\n{\n    height:26px;\n    margin-right:auto;\n    width:38px;\n}\n\n.ogl_sumTable\n{\n    display:grid;\n    grid-column:1 / -1;\n    grid-gap:3px;\n    margin-top:20px;\n}\n\n.ogl_sumTable > *\n{\n    align-items:center;\n    display:grid;\n    grid-gap:3px;\n    grid-template-columns:repeat(8, 1fr);\n    line-height:26px;\n    text-align:center;\n}\n\n.ogl_sumTable > *:first-child\n{\n    font-size:20px !important;\n}\n\n.ogl_sumTable > * > *:not(.ogl_icon)\n{\n    background:var(--secondary);\n    border-radius:3px;\n}\n\n.ogl_sumTable > * > *:not(.ogl_icon):first-child\n{\n    text-transform:capitalize;\n}\n\n.ogl_sumTable .ogl_icon:before\n{\n    margin:auto;\n}\n\n.ogl_recap\n{\n    border-top:2px solid #0e1116;\n    cursor:pointer;\n    padding:10px 6px;\n    position:relative;\n    user-select:none;\n}\n\n.ogl_recap:hover\n{\n    box-shadow:0 0 0 2px var(--ogl);\n}\n\n.ogl_recap > div\n{\n    font-size:11px;\n    font-weight:bold;\n}\n\n.ogl_recap .ogl_icon\n{\n    background:none;\n    display:grid;\n    grid-template-columns:35px auto 70px;\n    text-align:right;\n}\n\n.ogl_recap .ogl_icon > *:last-child\n{\n    font-size:10px;\n    letter-spacing:-0.03em;\n    opacity:.5;\n}\n\n.ogl_recap .ogl_icon:before\n{\n    height:14px;\n    vertical-align:bottom;\n}\n\n.ogl_shortCutWrapper\n{\n    box-sizing:border-box;\n    display:flex;\n    flex-direction:column;\n    justify-content:center;\n    pointer-events:none;\n    position:fixed;\n    text-transform:uppercase;\n    z-index:10;\n\n    top:0;\n    height:calc(100vh - 25px);\n    left:0;\n    width:100vw;\n}\n\n.ogl_shortCutWrapper > div:nth-child(1)\n{\n    flex:1;\n}\n\n.ogl_shortcuts\n{\n    display:flex;\n    grid-gap:7px;\n    flex-wrap:wrap;\n    justify-content:center;\n}\n\n#planetbarcomponent #rechts .ogl_shortcuts\n{\n    justify-content:left;\n    transform:translateX(-8px);\n    width:206px;\n}\n\n#planetbarcomponent #rechts .ogl_shortcuts .ogl_separator\n{\n    display:none;\n}\n\n/*.ogl_shortcuts:before\n{\n    background:rgba(0,0,0,.6);\n    bottom:-5px;\n    content:\'\';\n    filter:blur(10px);\n    left:-5px;\n    position:absolute;\n    right:-5px;\n    top:-5px;\n}*/\n\n.ogl_shortcuts *\n{\n    z-index:1;\n}\n\n.ogl_shortcuts [data-key]\n{\n    align-items:center;\n    box-shadow:0 0 5px rgba(0,0,0,.6);\n    display:inline-flex;\n    font-size:11px;\n    grid-gap:5px;\n    justify-content:center;\n    line-height:26px;\n    min-width:40px;\n    pointer-events:all;\n    position:relative;\n    text-transform:capitalize;\n}\n\n#planetbarcomponent #rechts .ogl_shortcuts [data-key]\n{\n    min-width:36px;\n}\n\n.ogl_shortcuts [data-key-id]:after\n{\n    font-family:\'Material Icons\';\n    font-size:16px !important;\n    order:-1;\n}\n\n.ogl_shortcuts [data-key-id="menu"]:after { content:\'\\e91d\'; }\n.ogl_shortcuts [data-key-id="showMenuResources"]:after { content:\'\\e95d\'; }\n.ogl_shortcuts [data-key-id="previousPlanet"]:after { content:\'\\ea39\'; }\n.ogl_shortcuts [data-key-id="nextPlanet"]:after { content:\'\\ea2a\'; }\n.ogl_shortcuts [data-key-id="expeditionSC"]:after { color:var(--mission15);content:\'\\ea41\'; }\n.ogl_shortcuts [data-key-id="expeditionLC"]:after { color:var(--mission15);content:\'\\ea41\'; }\n.ogl_shortcuts [data-key-id="expeditionPF"]:after { color:var(--mission15);content:\'\\ea41\'; }\n.ogl_shortcuts [data-key-id="fleetRepeat"]:after { content:\'\\e91a\'; }\n.ogl_shortcuts [data-key-id="fleetSelectAll"]:after { color:#ffab43;content:\'\\ea31\'; }\n.ogl_shortcuts [data-key-id="fleetReverseAll"]:after { content:\'\\ea0c\'; }\n.ogl_shortcuts [data-key-id="backFirstFleet"]:after { content:\'\\e94f\'; }\n.ogl_shortcuts [data-key-id="backLastFleet"]:after { content:\'\\e94f\'; }\n.ogl_shortcuts [data-key-id="galaxyUp"]:after { color:#30ba44;content:\'\\e946\'; }\n.ogl_shortcuts [data-key-id="galaxyDown"]:after { color:#30ba44;content:\'\\e947\'; }\n.ogl_shortcuts [data-key-id="galaxyLeft"]:after { color:#30ba44;content:\'\\e942\'; }\n.ogl_shortcuts [data-key-id="galaxyRight"]:after { color:#30ba44;content:\'\\e940\'; }\n.ogl_shortcuts [data-key-id="discovery"]:after { color:var(--lifeform);content:\'\\ea46\'; }\n.ogl_shortcuts [data-key-id="galaxySpySystem"]:after { color:var(--mission6);content:\'\\e9ca\'; }\n.ogl_shortcuts [data-key-id="nextPinnedPosition"]:after { content:\'\\e9d1\'; }\n\n.ogl_shortcuts .ogl_separator, fieldset .ogl_separator,\n.ogl_statsMonth .ogl_separator, .ogl_expeRecap .ogl_separator\n{\n    align-self:center;\n    background:#2e3840;\n    border-radius:50%;\n    height:1px;\n    padding:2px;\n    width:1px;\n}\n\n.ogl_shorcuts .ogl_button\n{\n    box-shadow:0 1px 3px 0 #000, 0 1px 1px 0 #405064;\n}\n\n#technologydetails .build-it_wrap\n{\n    transform:scale(.75);\n    transform-origin:bottom right;\n}\n\n#technologydetails .premium_info\n{\n    font-size:14px;\n}\n\n#technologydetails .information > ul\n{\n    bottom:8px !important;\n    display:flex !important;\n    flex-flow:row !important;\n    grid-gap:3px !important;\n    left:1px !important;\n    position:absolute !important;\n    top:auto !important;\n    width:auto !important;\n}\n\n#technologydetails .information > ul li\n{\n    background:var(--secondary);\n    border-radius:3px;\n    margin-bottom:0 !important;\n    padding:5px;\n}\n\n#technologydetails .build_duration,\n#technologydetails .additional_energy_consumption,\n#technologydetails .energy_production,\n#technologydetails .possible_build_start,\n#technologydetails .required_population,\n#technologydetails .research_laboratory_levels_sum\n{\n    align-items:center;\n    display:flex;\n}\n\n#technologydetails .build_duration strong,\n#technologydetails .additional_energy_consumption strong,\n#technologydetails .energy_production strong,\n#technologydetails .possible_build_start strong,\n#technologydetails .required_population strong,\n#technologydetails .research_laboratory_levels_sum strong\n{\n    display:inline-flex;\n    font-size:0;\n}\n\n#technologydetails .build_duration strong:before,\n#technologydetails .additional_energy_consumption strong:before,\n#technologydetails .energy_production strong:before,\n#technologydetails .possible_build_start strong:before,\n#technologydetails .required_population strong:before,\n#technologydetails .research_laboratory_levels_sum strong:before\n{\n    display:block;\n    font-family:\'Material Icons\';\n    font-size:16px;\n    margin-right:3px;\n}\n\n#technologydetails .build_duration strong:before { color:var(--time);content:\'\\ea27\'; }\n#technologydetails .possible_build_start strong:before { color:#ccc;content:\'\\ea03\'; }\n#technologydetails .additional_energy_consumption strong:before, #technologydetails .energy_production strong:before { color:var(--energy);content:\'\\ea51\'; }\n#technologydetails .required_population strong:before { color:var(--lifeform);content:\'\\ea46\'; }\n#technologydetails .research_laboratory_levels_sum strong:before { color:#21d19f;content:\'\\ea17\'; }\n\n#technologydetails .required_population span { display:inline-flex;font-size:0; }\n#technologydetails .required_population span:before { content:attr(data-formatted);font-size:11px; }\n\n#technologydetails .energy_production .bonus\n{\n    color:#fff;\n}\n\n#technologydetails .build_amount\n{\n    top:35px;\n}\n\n#technologydetails .build_amount label\n{\n    display:none;\n}\n\n#technologydetails .build_amount .maximum\n{\n    background:none !important;\n    margin:0 0 0 5px !important;\n    min-width:0 !important;\n    padding:0 !important;\n}\n\n#technologydetails .build_amount .maximum:before\n{\n    display:none !important;\n}\n\n#technologydetails_wrapper.ogl_active\n{\n    display:block !important;\n}\n\n#technologydetails_wrapper.ogl_active #technologydetails_content\n{\n    display:block !important;\n    position:initial !important;\n}\n\n#technologydetails_content\n{\n    background:#0d1014 !important;\n}\n\n#technologydetails > .description\n{\n    background:var(--primary);\n}\n\n#technologydetails .costs\n{\n    left:5px !important;\n    top:33px !important;\n}\n\n#technologydetails .costs .ipiHintable\n{\n    display:none !important;\n}\n\n#technologydetails .costs .ogl_costsWrapper\n{\n    display:grid;\n    font-weight:bold;\n    grid-gap:3px;\n}\n\n#technologydetails .costs .ogl_costsWrapper div:first-child .material-icons\n{\n    color:inherit !important;\n}\n\n#technologydetails .costs .ogl_costsWrapper .ogl_icon\n{\n    align-items:center;\n    display:grid !important;\n    grid-gap:8px;\n    grid-template-columns:28px 70px 70px 70px;\n    padding:0;\n    text-align:center;\n}\n\n#technologydetails .costs .ogl_costsWrapper .ogl_icon:before\n{\n    margin:0;\n}\n\n#technologydetails .costs .ogl_costsWrapper .ogl_icon > div\n{\n    background:var(--secondary);\n    border-radius:3px;\n    color:inherit;\n    line-height:18px !important;\n}\n\n#technologydetails .resource.icon\n{\n    border-radius:5px !important;\n    flex:1 1 0;\n    font-size:12px !important;\n    height:auto !important;\n    padding:2px !important;\n    margin:0 !important;\n    white-space:nowrap !important;\n    width:auto !important;\n}\n\n#technologydetails .resource.icon .ogl_text,\n#technologydetails .resource.icon .ogl_danger\n{\n    font-size:10px;\n}\n\n#technologydetails .ogl_actions\n{\n    display:grid;\n    grid-gap:5px;\n    grid-template-columns:repeat(4, 1fr);\n    line-height:28px;\n    padding:5px;\n}\n\n#technologydetails .ogl_actions .ogl_button\n{\n    font-size:18px !important;\n}\n\n#technologydetails .ogl_actions .ogl_button.ogl_active\n{\n    box-shadow:0 0 0 2px var(--amber);\n    color:var(--amber) !important;\n}\n\n#technologydetails .information .material-icons\n{\n    color:#fff;\n    font-size:16px !important;\n    vertical-align:bottom;\n}\n\n#technologydetails .information .costs > p\n{\n    display:none;\n}\n\n#technologydetails .information b\n{\n    font-size:16px;\n}\n\n.ogl_tooltip > .ogl_fleetDetail:not(.ogl_tooltipTriangle):not(.ogl_close),\n.ogl_ptreContent .ogl_fleetDetail\n{\n    display:grid !important;\n    grid-gap:4px 10px;\n    grid-template-columns:repeat(2, 1fr);\n}\n\n.ogl_ptreContent .ogl_fleetDetail\n{\n    grid-template-columns:repeat(3, 1fr);\n    padding:15px 0;\n}\n\n.ogl_fleetDetail > div\n{\n    background:var(--secondary);\n    border-radius:3px;\n    line-height:20px;\n    min-width:70px;\n    padding:0px 5px 0px 0px !important;\n    text-align:right;\n    white-space:nowrap;\n}\n\n.ogl_fleetDetail .ogl_metal, .ogl_fleetDetail .ogl_crystal,\n.ogl_fleetDetail .ogl_deut, .ogl_fleetDetail .ogl_food\n{\n    grid-column:1 / -1;\n}\n\n.ogl_fleetDetail .ogl_icon\n{\n    color:#7c95ab;\n    font-weight:bold;\n}\n\n.ogl_fleetDetail .ogl_icon:before\n{\n    float:left;\n    margin-right:auto;\n}\n\n.ogl_fleetDetail .ogl_button\n{\n    color:#fff;\n    line-height:22px;\n    text-align:center;\n    user-select:none;\n}\n\n.ogl_fullgrid\n{\n    grid-column:1 / -1;\n}\n\n.ogl_tooltip > .ogl_fleetDetail .ogl_fullgrid\n{\n    display:grid;\n    grid-gap:7px;\n    grid-template-columns:repeat(2, 1fr);\n}\n\n.ogl_tooltip > .ogl_fleetDetail .ogl_button span\n{\n    pointer-events:none;\n}\n\n.ogl_tooltip > .ogl_fleetDetail .ogl_button\n{\n    border:1px solid #17191c;\n    display:flex;\n    font-size:12px !important;\n    grid-gap:5px;\n    grid-template-columns:16px auto;\n    padding:2px 12px;\n    text-align:left;\n}\n\n.ogl_tooltip > .ogl_fleetDetail .ogl_button .material-icons\n{\n    font-size:16px !important;\n}\n\n#fleetboxmission .content\n{\n    min-height:0 !important;\n}\n\n#fleet2 #missionNameWrapper, #fleet2 ul#missions span.textlabel\n{\n    display:none !important;\n}\n\n.ogl_todoList\n{\n    align-items:center;\n    display:grid;\n    grid-gap:30px;\n    grid-template-columns:auto auto;\n}\n\n.ogl_todoList .ogl_tech\n{\n    background:#0b0f12;\n    border-bottom:1px solid #1c2630;\n    border-radius:3px;\n    display:grid;\n    margin-bottom:10px;\n    padding:7px;\n}\n\n.ogl_todoList h2\n{\n    grid-column:1 / -1;\n}\n\n.ogl_todoList h3\n{\n    align-items:center;\n    border-radius:3px;\n    color:#5d6f81;\n    cursor:pointer;\n    display:flex;\n    font-size:12px;\n    line-height:18px;\n    overflow:hidden;\n    position:relative;\n    text-align:left;\n    text-transform:capitalize;\n}\n\n.ogl_todoList h3:after\n{\n    content:\'\\e933\';\n    font-family:\'Material Icons\';\n    margin-left:auto;\n}\n\n.ogl_todoList h3:hover\n{\n    color:#fff;\n}\n\n.ogl_todoList h3:not(:first-child)\n{\n    margin-top:20px;\n}\n\n.ogl_todoList h3 b\n{\n    color:var(--ogl);\n}\n\n.ogl_todoList hr\n{\n    background:#1e252e;\n    border:none;\n    grid-column:1 / -1;\n    height:2px;\n    width:100%;\n}\n\n.ogl_todoList .ogl_line\n{\n    display:grid;\n    grid-gap:8px;\n    grid-template-columns:70px 114px 114px 114px 50px auto auto;\n    transition:max-height .3s cubic-bezier(0, 1, 0, 1);\n}\n\n.ogl_todoList div > .ogl_line:not(:first-child)\n{\n    max-height:0;\n    overflow:hidden;\n}\n\n.ogl_todoList .ogl_tech.ogl_active .ogl_line\n{\n    max-height:28px;\n    transition:max-height .1s ease-in-out;\n}\n\n.ogl_todoList footer\n{\n    border-top:2px solid #181f24;\n    margin-top:3px;\n}\n\n.ogl_todoList .ogl_line > *\n{\n    align-items:center;\n    background:var(--secondary);\n    border-radius:3px;\n    color:#849ab9;\n    display:flex;\n    margin-top:3px;\n    padding-right:7px;\n    text-align:right;\n}\n\n.ogl_todoList .ogl_line > *:first-child\n{\n    justify-content:center;\n    line-height:24px;\n    padding-right:0;\n}\n\n.ogl_todoList .ogl_line .material-icons,\n.ogl_todoList .ogl_actions .material-icons\n{\n    font-size:20px !important;\n}\n\n.ogl_todoList .ogl_line .material-icons:hover\n{\n    color:var(--ogl) !important;\n}\n\n.ogl_todoList .ogl_line label\n{\n    text-align:left;\n}\n\n.ogl_todoList .ogl_line label:after\n{\n    content:attr(data-order);\n}\n\n.ogl_todoList .ogl_line .ogl_icon:before\n{\n    float:left;\n}\n\n.ogl_todoList .ogl_line .ogl_textCenter\n{\n    padding:0;\n}\n\n.ogl_todoList .ogl_actions\n{\n    align-self:baseline;\n    display:grid;\n    grid-gap:7px;\n    position:sticky;\n    top:0;\n}\n\n.ogl_todoList .ogl_button\n{\n    align-items:center;\n    display:flex;\n    grid-gap:5px;\n    padding:0 10px;\n}\n\n.ogl_todoList .ogl_button .material-icons\n{\n    margin-left:auto;\n}\n\n.ogl_removeTodo, .ogl_blockRecap > *:last-child\n{\n    color:#ff4f4f !important;\n}\n\n.ogl_todoList .ogl_line button:hover\n{\n    box-shadow:inset 0 0 0 2px var(--ogl);\n    cursor:pointer;\n}\n\n.originFleet *\n{\n    color:inherit !important;\n}\n\n.ogl_playerData .ogl_actions\n{\n    display:flex;\n    grid-gap:2px;\n    margin-bottom:10px;\n}\n\n.ogl_playerData .ogl_actions .ogl_button\n{\n    border:1px solid #17191c;\n    border-radius:5px;\n    font-size:16px !important;\n    width:100%;\n}\n\n.ogl_playerData .ogl_grid\n{\n    display:grid;\n    grid-gap:12px;\n    grid-template-columns:repeat(2, 1fr);\n}\n\n.ogl_playerData .ogl_tagSelector\n{\n    grid-column:1 / -1;\n}\n\n.ogl_playerData .ogl_leftSide\n{\n    background:#101418;\n    border-radius:5px;\n    font-size:12px;\n    padding:7px;\n}\n\n.ogl_playerData h1\n{\n    background:var(--primary);\n    border:2px solid #202834;\n    border-radius:50px;\n    font-size:14px;\n    margin:0 auto 14px auto;\n    padding:3px 12px;\n    text-align:center;\n    width:fit-content;\n    width:-moz-fit-content;\n}\n\n.ogl_playerData h1:before\n{\n    background:red;\n    content:\'\';\n    height:2px;\n}\n\n.ogl_playerData h1 a\n{\n    font-size:12px;\n    text-decoration:none;\n}\n\n.ogl_playerData h1 a:hover\n{\n    color:var(--ogl);\n}\n\n.ogl_score\n{\n    display:grid;\n    grid-gap:3px;\n}\n\n.ogl_score .material-icons\n{\n    font-size:16px !important;\n    line-height:20px !important;\n}\n\n.ogl_score .ogl_line\n{\n    background:var(--secondary);\n    border-radius:5px;\n    display:grid;\n    grid-gap:3px;\n    grid-template-columns:20px auto;\n    padding:1px 5px;\n}\n\n.ogl_score .ogl_line div\n{\n    line-height:20px;\n    text-align:right;\n}\n\n.ogl_score .ogl_line:nth-child(1) { color:#f9c846; }\n.ogl_score .ogl_line:nth-child(2) { color:#6dd0ff; }\n.ogl_score .ogl_line:nth-child(3) { color:#21d19f; }\n.ogl_score .ogl_line:nth-child(4) { color:var(--lifeform); }\n.ogl_score .ogl_line:nth-child(5) { color:#ff4646; }\n.ogl_score .ogl_line:nth-child(6) { color:#f96e46; }\n.ogl_score .ogl_line:nth-child(7) { color:#bfbfbf; }\n\n.ogl_playerData .ogl_planetStalk\n{\n    background:#101418;\n    border-radius:5px;\n    display:flex;\n    flex-direction:column;\n    grid-gap:3px;\n    padding:7px;\n}\n\n.ogl_playerData .ogl_planetStalk > div\n{\n    display:grid;\n    font-size:12px;\n    grid-gap:3px;\n    grid-template-columns:24px auto 22px 22px 22px;\n    position:relative;\n}\n\n.ogl_playerData .ogl_planetStalk > div:last-child\n{\n    border:none;\n}\n\n.ogl_playerData .ogl_planetStalk > div > *\n{\n    align-items:center;\n    background:var(--secondary);\n    border-radius:3px;\n    display:flex;\n    justify-content:center;\n    line-height:22px;\n    padding:0 5px;\n}\n\n.ogl_playerData .ogl_tagPicker\n{\n    background:none !important;\n    pointer-events:none !important;\n}\n\n.ogl_playerData .ogl_tagPicker:before\n{\n    content:\'fiber_manual_record\' !important;\n}\n\n.ogl_playerData .ogl_planetStalk [data-galaxy]\n{\n    justify-content:left;\n}\n\n.ogl_home [data-galaxy]:before\n{\n    color:#fff;\n    content:\'\\e99d\';\n    display:inline-block;\n    font-family:\'Material Icons\';\n    margin-right:5px;\n    text-decoration:none;\n}\n\n.ogl_playerData .ogl_planetStalk .ogl_spyIcon\n{\n    color:#687a89;\n    font-size:15px !important;\n}\n\n.ogl_playerData .ogl_planetStalk .ogl_spyIcon:hover\n{\n    color:#fff;\n}\n\n#jumpgate .ship_input_row\n{\n    position:relative;\n}\n\n#jumpgate .ogl_keepRecap\n{\n    background:#4c1b1b;\n    border-radius:4px;\n    bottom:0;\n    color:#f45757;\n    font-size:10px;\n    padding:2px 4px;\n    position:absolute;\n    right:0px;\n}\n\n#jumpgate .ship_input_row input\n{\n    text-align:left;\n}\n\n.eventFleet .tooltip\n{\n    color:inherit;\n}\n\n.galaxyTable .ogl_flagPicker\n{\n    margin-left:3px;\n}\n\n.ogl_flagPicker, .ogl_flagSelector\n{\n    cursor:pointer;\n    font-size:19px !important;\n    min-height:19px;\n}\n\n.ogl_flagSelector > *\n{\n    align-items:center;\n    display:grid;\n    justify-content:center;\n}\n\n.ogl_tooltip .ogl_flagSelector > *\n{\n    height:100%;\n    min-height:19px;\n}\n\n.ogl_flagPicker:before, .ogl_flagSelector [data-flag="none"]:before { color:#4e5c68; content:\'push_pin\'; }\n.ogl_flagPicker[data-flag="friend"]:before, .ogl_flagSelector [data-flag="friend"]:before { color:#ff78cf; content:\'handshake\'; }\n.ogl_flagPicker[data-flag="danger"]:before, .ogl_flagSelector [data-flag="danger"]:before { color:#ff4343; content:\'alert\'; }\n.ogl_flagPicker[data-flag="skull"]:before, .ogl_flagSelector [data-flag="skull"]:before { color:#e9e9e9; content:\'skull\'; }\n.ogl_flagPicker[data-flag="rush"]:before, .ogl_flagSelector [data-flag="rush"]:before { color:#6cddff; content:\'electric_bolt\'; }\n.ogl_flagPicker[data-flag="fridge"]:before, .ogl_flagSelector [data-flag="fridge"]:before { color:#667eff; content:\'fridge\'; }\n.ogl_flagPicker[data-flag="star"]:before, .ogl_flagSelector [data-flag="star"]:before { color:#ffd745; content:\'star\'; }\n.ogl_flagPicker[data-flag="trade"]:before, .ogl_flagSelector [data-flag="trade"]:before { color:#32db9d; content:\'local_gas_station\'; }\n.ogl_flagPicker[data-flag="money"]:before, .ogl_flagSelector [data-flag="money"]:before { color:#ab7b65; content:\'euro\'; }\n.ogl_flagPicker[data-flag="ptre"]:before, .ogl_flagSelector [data-flag="ptre"]:before { color:#ff942c; content:\'ptre\'; }\n.ogl_flagPicker[data-flag="recent"]:before, .ogl_flagSelector [data-flag="recent"]:before { color:#41576c; content:\'schedule\'; }\n\n.ogl_flagPicker:hover, .ogl_flagSelector [data-flag]:hover,\n.ogl_tagPicker:hover, .ogl_tagSelector [data-tag]:hover\n{\n    filter:brightness(1.3);\n}\n\n.ogl_flagSelector [data-flag]:hover:after,\n.ogl_tagSelector [data-tag]:hover:after\n{\n    border-left:5px solid transparent;\n    border-right:5px solid transparent;\n    border-top:6px solid #fff;\n    top:-8px;\n    content:\'\';\n    left:50%;\n    position:absolute;\n    transform:translateX(-50%);\n}\n\n.ogl_tooltip > div.ogl_flagSelector:not(.ogl_tooltipTriangle):not(.ogl_close),\n.ogl_tooltip > div.ogl_tagSelector:not(.ogl_tooltipTriangle):not(.ogl_close),\n.tippy-content .ogl_flagSelector, .tippy-content .ogl_tagSelector\n{\n    align-items:center;\n    display:flex !important;\n    grid-auto-flow:column;\n    grid-gap:4px 10px;\n    justify-content:center;\n}\n\n.ogl_tagPicker, .ogl_tagSelector\n{\n    cursor:pointer;\n    font-size:19px !important;\n    user-select:none;\n}\n\n.ogl_tagPicker:before, .ogl_tagSelector [data-tag]:before { content:\'stroke_full\'; }\n.ogl_tagPicker:before, .ogl_tagSelector [data-tag="none"]:before { color:#4e5c68; }\n.ogl_tagPicker[data-tag="red"]:before, .ogl_tagSelector [data-tag="red"]:before { color:#eb3b5a; }\n.ogl_tagPicker[data-tag="orange"]:before, .ogl_tagSelector [data-tag="orange"]:before { color:#fa8231; }\n.ogl_tagPicker[data-tag="yellow"]:before, .ogl_tagSelector [data-tag="yellow"]:before { color:#f7b731; }\n.ogl_tagPicker[data-tag="lime"]:before, .ogl_tagSelector [data-tag="lime"]:before { color:#7bbf20; }\n.ogl_tagPicker[data-tag="green"]:before, .ogl_tagSelector [data-tag="green"]:before { color:#20bf6b; }\n.ogl_tagPicker[data-tag="blue"]:before, .ogl_tagSelector [data-tag="blue"]:before { color:#5bbde3; }\n.ogl_tagPicker[data-tag="dblue"]:before, .ogl_tagSelector [data-tag="dblue"]:before { color:#3867d6; }\n.ogl_tagPicker[data-tag="violet"]:before, .ogl_tagSelector [data-tag="violet"]:before { color:#8854d0; }\n.ogl_tagPicker[data-tag="magenta"]:before, .ogl_tagSelector [data-tag="magenta"]:before { color:#f95692; }\n.ogl_tagPicker[data-tag="pink"]:before, .ogl_tagSelector [data-tag="pink"]:before { color:#fda7df; }\n.ogl_tagPicker[data-tag="brown"]:before, .ogl_tagSelector [data-tag="brown"]:before { color:#996c5c; }\n.ogl_tagPicker[data-tag="gray"]:before, .ogl_tagSelector [data-tag="gray"]:before { color:#75a1b7; }\n[data-tag].ogl_off { opacity:.2; }\n\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="red"]) { box-shadow:inset 0 0 100px rgba(255, 0, 0, .2); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="orange"]) { box-shadow:inset 0 0 100px rgba(235, 108, 59, .3); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="yellow"]) { box-shadow:inset 0 0 100px rgba(235, 181, 59, .3); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="lime"]) { box-shadow:inset 0 0 100px rgba(167, 235, 59, .2); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="green"]) { box-shadow:inset 0 0 100px rgba(59, 235, 89, .3); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="blue"]) { box-shadow:inset 0 0 100px rgba(59, 162, 235, .3); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="dblue"]) { box-shadow:inset 0 0 100px rgba(59, 81, 235, .3); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="violet"]) { box-shadow:inset 0 0 100px rgba(110, 59, 235, .3); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="magenta"]) { box-shadow:inset 0 0 100px rgba(235, 59, 165, .3); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="pink"]) { box-shadow:inset 0 0 100px rgba(255, 124, 179, .3); }\n#galaxyContent .ctContentRow .galaxyCell:has([data-tag="brown"]) { box-shadow:inset 0 0 100px rgba(149, 111, 89, .3); }\n\n.galaxyRow:has([data-tag="gray"]) { opacity:.2; }\n\n.galaxyTable .ogl_tagPicker,\n.ogl_spytable .ogl_tagPicker\n{\n    margin-left:auto;\n}\n\n.ogl_list\n{\n    background:#0e1116;\n    display:grid;\n    grid-gap:3px;\n    padding:10px;\n}\n\n.ogl_list .ogl_emptyList\n{\n    padding:10px;\n}\n\n.ogl_list > div\n{\n    align-items:center;\n    border-radius:3px;\n    display:grid;\n    grid-gap:4px;\n    position:relative;\n}\n\n.ogl_list > div > *:not(.ogl_button)\n{\n    align-items:center;\n    background:var(--secondary);\n    border-radius:3px;\n    display:flex;\n    justify-content:center;\n    line-height:24px !important;\n    padding:0 5px;\n}\n\n.ogl_list > div > .ogl_flagPicker\n{\n    padding:0;\n}\n\n.ogl_pinned .ogl_list > div\n{\n    grid-template-columns:auto 70px 30px 30px;\n}\n\n.ogl_pinned .ogl_list > div > *:first-child\n{\n    justify-content:left;\n}\n\n.ogl_pinned .ogl_list .ogl_grid\n{\n    display:grid;\n    grid-template-columns:repeat(2, 1fr);\n}\n\n.ogl_pinned .ogl_list .material-icons\n{\n    cursor:pointer;\n    font-size:17px !important;\n    height:24px !important;\n    user-select:none;\n    text-align:right;\n}\n\n.ogl_pinned .ogl_list .material-icons:hover\n{\n    filter:brightness(1.3);\n}\n\n.ogl_pinned .ogl_list .material-icons:last-child\n{\n    color:#915454;\n}\n\n.ogl_pinned .ogl_detail\n{\n    cursor:pointer;\n}\n\n.ogl_pinned .ogl_detail:hover\n{\n    color:#fff;\n}\n\n.ogl_pinned .ogl_tabs\n{\n    display:flex;\n    grid-template-columns:repeat(9, 1fr);\n    justify-content:space-between;\n    text-align:center;\n}\n\n.ogl_pinned .ogl_tabs > [data-flag]\n{\n    align-items:center;\n    display:grid;\n    justify-content:center;\n    padding:5px 7px 7px 7px;\n}\n\n.ogl_pinned .ogl_tabs .ogl_active\n{\n    background:#0e1116;\n    border-radius:3px 3px 0 0;\n}\n\n.ogl_pinned span:hover\n{\n    cursor:pointer;\n    text-decoration:underline;\n}\n\n.ogl_expeditionFiller\n{\n    display:grid;\n    grid-template-columns:repeat(8, 1fr);\n}\n\n.ogl_expeditionFiller h2\n{\n    grid-column:1 / -1;\n}\n\n.ogl_expeditionFiller .ogl_icon:before\n{\n    height:38px;\n    width:38px;\n}\n\n.ogl_expeditionFiller .ogl_icon:hover:before\n{\n    cursor:pointer;\n    box-shadow:0 0 0 2px var(--ogl);\n}\n\n.ogl_expeditionFiller .ogl_icon.ogl_active:before\n{\n    box-shadow:0 0 0 2px #fff;\n}\n\n.ogl_wrapperloading\n{\n    align-items:center;\n    background:rgba(0,0,0, .7);\n    display:flex;\n    height:100%;\n    justify-content:center;\n    width:100%;\n}\n\n.ogl_loading\n{\n    animation:spinAlt .75s infinite linear;\n    background:conic-gradient(#ffffff00, var(--ogl));\n    mask:radial-gradient(#0000 40%, #fff 43%, #fff 0);\n    border-radius:50%;\n    height:25px;\n    width:25px;\n}\n\n@keyframes spinAlt\n{\n    0% { transform:rotate(0); }\n    100% { transform:rotate(360deg); }\n}\n\n.ogl_pinDetail h2\n{\n    display:flex;\n    grid-gap:5px;\n}\n\n.ogl_pinDetail h2 .ogl_flagPicker\n{\n    margin:0;\n}\n\n.ogl_pinDetail .ogl_actions\n{\n    display:flex;\n    grid-gap:3px;\n    margin-bottom:20px;\n}\n\n.ogl_pinDetail .ogl_actions .ogl_button\n{\n    align-items:center;\n    display:grid;\n    flex:1;\n    font-size:16px !important;\n    justify-content:center;\n}\n\n.ogl_pinDetail .ogl_score\n{\n    grid-template-columns:repeat(2, 1fr);\n    margin-bottom:20px;\n}\n\n.ogl_pinDetail .ogl_score > div\n{\n    padding:4px 5px;\n}\n\n.ogl_pinDetail .ogl_list > div\n{\n    grid-template-columns:20px auto 60px 38px 38px 67px;\n}\n\n.ogl_pinDetail .ogl_list [data-galaxy]\n{\n    justify-content:left;\n}\n\n.ogl_pinDetail .ogl_list .ogl_spyIcon\n{\n    color:#687a89;\n    font-size:16px !important;\n    justify-content:space-between;\n    padding:0 3px;\n}\n\n.ogl_pinDetail .ogl_list .ogl_spyIcon:hover\n{\n    color:#fff;\n}\n\n.ogl_spyIcon\n{\n    align-items:center;\n    cursor:pointer !important;\n    display:flex;\n}\n\n.ogl_spyIcon span\n{\n    font-family:Verdana, Arial, SunSans-Regular, sans-serif;\n    font-size:11px;\n    margin-left:3px;\n}\n\n.ogl_pinDetail date\n{\n    display:grid;\n    font-size:10px;\n    grid-gap:5px;\n}\n\n.ogl_pinDetail date span:nth-child(1) { color:var(--date); }\n.ogl_pinDetail date span:nth-child(2) { color:var(--time); }\n\n.ogl_nextQuickTarget\n{\n    color:#687a89;\n    font-size:16px !important;\n}\n\n.ogl_nextQuickTarget.ogl_active\n{\n    color:var(--red);\n}\n\n.ogl_tagged .ogl_grid\n{\n    align-items:center;\n    display:flex;\n    grid-gap:5px;\n    justify-content:end;\n}\n\n.ogl_tagged .ogl_grid label\n{\n    align-items:center;\n    display:flex;\n}\n\n.ogl_tagged .ogl_list > div\n{\n    grid-template-columns:30px auto 30px 30px 30px 30px;\n}\n\n.ogl_tagged .ogl_list > div > div:first-child\n{\n    text-align:center;\n}\n\n.ogl_tagged .ogl_list .ogl_spyIcon\n{\n    color:#687a89;\n    font-size:16px !important;\n}\n\n.ogl_tagged .ogl_list .ogl_spyIcon:hover\n{\n    color:#fff;\n}\n\n.ogl_tagged .ogl_tabs,\n.ogl_playerData .ogl_tagSelector\n{\n    display:flex;\n    grid-gap:12px 6px;\n    margin-bottom:8px;\n    text-align:center;\n}\n\n.ogl_tagged .ogl_tabs > *,\n.ogl_playerData .ogl_tagSelector > *\n{\n    flex:1;\n}\n\n.ogl_tagged .ogl_actions\n{\n    align-items:center;\n    display:grid;\n    grid-gap:0 4px;\n    grid-template-columns:repeat(15, 1fr);\n}\n\n.ogl_tagged .ogl_actions input\n{\n    background:#121518 !important;\n    border:none !important;\n    border-bottom:1px solid #212830 !important;\n    border-radius:3px !important;\n    border-top:1px solid #080b10 !important;\n    box-shadow:none !important;\n    color:#5d738d !important;\n    font-weight:bold !important;\n}\n\n.ogl_tagged .ogl_actions label\n{\n    align-items:center;\n    background:linear-gradient(to bottom, #405064, #2D3743 2px, #181E25);\n    border-radius:50px;\n    cursor:pointer;\n    display:flex;\n    justify-content:center;\n}\n\n.ogl_tagged .ogl_actions .material-icons\n{\n    color:#7d8caa;\n    cursor:default;\n    font-size:16px !important;\n    text-align:center;\n    user-select:none;\n}\n\n.ogl_tagged .ogl_actions input,\n.ogl_tagged .ogl_actions .ogl_button,\n.ogl_tagged .ogl_actions label\n{\n    align-self:flex-start;\n    grid-column:span 2;\n    line-height:24px !important;\n    text-align:center;\n    user-select:none;\n    width:auto;\n}\n\n.ogl_tagged .ogl_actions .ogl_button,\n.ogl_tagged .ogl_list .ogl_button\n{\n    cursor:pointer;\n    display:inline-block;\n    grid-template-columns:auto;\n    line-height:26px;\n    padding:0 4px;\n    text-align:center;\n    user-select:none;\n}\n\n.ogl_tagged .ogl_actions .ogl_button:hover,\n.ogl_tagged .ogl_list .ogl_button:hover\n{\n    color:#fff;\n}\n\n.ogl_planetTooltip\n{\n    min-width:150px;\n}\n\n.ogl_planetTooltip [class*=\'ogl_lifeform\']\n{\n    background:#000;\n    border:2px solid var(--lifeform);\n    border-radius:50%;\n    box-shadow:0 0 5px 2px #000;\n    position:absolute;\n    right:50%;\n    transform:translate(30px, -10px) scale(.75);\n}\n\n.ogl_planetTooltip [class*=\'ogl_lifeform\']:before\n{\n    border-radius:50%;\n}\n\n.ogl_planetTooltip h3 span\n{\n    display:inline;\n}\n\n.ogl_planetTooltip img\n{\n    border:1px solid #000;\n    border-radius:50%;\n    box-shadow:0 0 10px -3px #000;\n    display:block;\n    margin:0 auto 7px auto;\n}\n\n.ogl_planetTooltip a\n{\n    display:block;\n}\n\n.ogl_planetTooltip a:hover\n{\n    color:#fff !important;\n}\n\n.ogl_planetTooltip h3\n{\n    text-align:center;\n}\n\n.ogl_planetTooltip .ogl_mineRecap\n{\n    font-size:14px;\n    font-weight:bold;\n    text-align:center;\n}\n\n#empire #siteFooter .content, #siteFooter .content\n{\n    width:1045px !important;\n}\n\n.ogl_danger\n{\n    color:#ff665b !important;\n}\n\n.ogl_warning\n{\n    color:var(--amber) !important;\n}\n\n.ogl_caution\n{\n    color:var(--yellow) !important;\n}\n\n.ogl_ok\n{\n    color:#77ddae !important;\n}\n\n.ogl_ping\n{\n    color:#aaa;\n    font-size:10px;\n    font-weight:bold;\n    position:absolute;\n    right:-14px;\n    top:14px;\n}\n\n.secondcol .material-icons\n{\n    background:linear-gradient(to bottom, #2d6778 50%, #254650 50%);\n    border-radius:2px !important;\n    color:#fff;\n    cursor:pointer;\n    font-size:20px !important;\n    height:26px !important;\n    line-height:26px !important;\n    text-align:center !important;\n    text-decoration:none !important;\n    text-shadow: 1px 1px #000 !important;\n    transform:scale(1) !important;\n    width:38px !important;\n}\n\n.secondcol #resetall.material-icons\n{\n    background:linear-gradient(to bottom, #812727 50%, #5c1515 50%);\n}\n\n.secondcol #sendall.material-icons\n{\n    background:linear-gradient(to bottom, #b76908 50%, #9b4a11 50%);\n}\n\n.ogl_tooltip > div.ogl_resourcesPreselection:not(.ogl_tooltipTriangle):not(.ogl_close)\n{\n    display:grid !important;\n    grid-gap:5px;\n}\n\n.ogl_tooltip > div.ogl_resourcesPreselection .ogl_icon\n{\n    padding:0;\n}\n\n.ogl_resourcesPreselection\n{\n    display:grid !important;\n    grid-gap:5px;\n}\n\n.ogl_resourcesPreselection .ogl_icon\n{\n    padding:0;\n}\n\n.ogl_resourcesPreselection .ogl_icon:before\n{\n    color:#ffc800;\n    content:\'chevron-double-right\';\n    font-family:\'Material Icons\';\n    font-size:20px;\n    line-height:18px;\n    text-align:center;\n    text-shadow:1px 1px 2px #000;\n}\n\n.ogl_resourcesPreselection hr\n{\n    border:none;\n    height:2px;\n    width:100%;\n}\n\n.ogl_resourcesPreselection .ogl_button\n{\n    line-height:30px;\n}\n\n[data-spy="prepare"] { color:var(--amber) !important; }\n[data-spy="done"] { color:var(--teal) !important; }\n[data-spy="fail"] { color:var(--red) !important; }\n[data-spy="recent"] { color:var(--purple) !important; }\n[data-spy]:not(.ogl_spyIcon) { box-shadow:0 0 0 2px currentColor !important; border-radius:2px !important; }\n\n#highscoreContent div.content table#ranks tbody tr\n{\n    background:#181b24 !important;\n}\n\n#highscoreContent div.content table#ranks tbody tr.allyrank /* blue */\n{\n    background:linear-gradient(192deg, #2e3066, #1c2534 70%) !important;\n}\n\n#highscoreContent div.content table#ranks tbody tr.buddyrank /* violet */\n{\n    background:linear-gradient(192deg, #652e66, #251c34 70%) !important;\n}\n\n#highscoreContent div.content table#ranks tbody tr.myrank /* green */\n{\n    background:linear-gradient(192deg, #23575c, #1c2a34 70%) !important;\n}\n\n#highscoreContent div.content table#ranks tbody tr td\n{\n    background:none !important;\n    height:22px;\n}\n\n#highscoreContent .honorRank\n{\n    position:absolute;\n}\n\n#highscoreContent .honorScore\n{\n    pointer-events:none;\n}\n\n#highscoreContent .playername\n{\n    color:#eee;\n    display:inline-block;\n    font-weight:bold;\n    max-width:125px;\n    overflow:hidden;\n    position:relative;\n    text-overflow:ellipsis;\n    text-indent:21px;\n    vertical-align:bottom;\n    white-space:nowrap;\n}\n\n#highscoreContent .playername:hover\n{\n    text-decoration:underline;\n}\n\n#highscoreContent a\n{\n    position:relative;\n}\n\n#highscoreContent .ally-tag\n{\n    float:right;\n    font-weight:bold;\n}\n\n#highscoreContent .ally-tag > a\n{\n    color:hsl(213deg 22% 56%) !important;\n}\n\n#highscoreContent .honorScore\n{\n    display:none !important;\n    font-size:0 !important;\n    left:20px;\n    position:absolute;\n    top:6px;\n}\n\n#highscoreContent .honorScore span,\n#highscoreContent .stats_counter\n{\n    font-size:9px !important;\n    font-weight:bold;\n}\n\n#highscoreContent #ranks tbody .score\n{\n    color:hsl(208deg 17% 47%) !important;\n    font-size:11px;\n    padding:2px 4px;\n    position:relative;\n}\n\n#highscoreContent [data-category="1"][data-type="0"] #ranks tbody .score\n{\n    vertical-align:top;\n}\n\n#highscoreContent #ranks tbody .score .ogl_scoreDiff\n{\n    bottom:0;\n    font-size:10px;\n    position:absolute;\n    right:4px;\n}\n\n#highscoreContent #ranks tbody .score .small\n{\n    color:hsl(210deg 11% 57%);\n    font-size:10px;\n    font-weight:bold;\n}\n\n#highscoreContent #ranks .sendmsg_content\n{\n    align-items:center;\n    display:flex;\n    grid-gap:7px;\n    justify-content:center;\n    margin:auto;\n}\n\n#highscoreContent #ranks .sendmsg_content a\n{\n    height:16px !important;\n    margin:0 !important;\n    width:16px !important;\n}\n\n#highscoreContent .ogl_flagPicker\n{\n    float:right;\n}\n\n.ogl_rankSince\n{\n    padding:5px;\n    position:absolute;\n}\n\n.ogl_bigScore .score:before,\n.ogl_lowScore .score:before\n{\n    color:var(--green);\n    content:\'trending_up\';\n    float:left;\n    font-family:\'Material Icons\';\n    font-size:20px !important;\n    margin-top:7px\n}\n\n.ogl_lowScore .score:before\n{\n    color:var(--red);\n    content:\'trending_down\';\n}\n\n.expeditionDebrisSlotBox\n{\n    align-items:center;\n    border:none !important;\n    box-shadow:none !important;\n    box-sizing:border-box !important;\n    display:flex !important;\n    flex-wrap:wrap !important;\n    padding:4px 16px !important;\n    width:642px !important;\n}\n\n.expeditionDebrisSlotBox.ogl_hidden, #expeditionDebrisSlotDebrisContainer\n{\n    display:none !important;\n}\n\n.expeditionDebrisSlotBox li\n{\n    list-style:none;\n}\n\n.expeditionDebrisSlotBox > div\n{\n    display:flex;\n    grid-gap:20px;\n    line-height:1.4;\n    text-align:left;\n}\n\n/*.expeditionDebrisSlotBox > div:last-child\n{\n    display:grid;\n    grid-gap:0;\n    margin-left:auto;\n}*/\n\n.expeditionDebrisSlotBox a\n{\n    color:var(--green1);\n}\n\n.expeditionDebrisSlotBox a:hover\n{\n    text-decoration:underline;\n}\n\n.ogl_expeditionRow\n{\n    border-top:2px solid #1a2129;\n    grid-gap:10px !important;\n    margin-top:5px;\n    padding-top:5px;\n    width:100% !important;\n}\n\n.ogl_expeditionRow.ogl_important\n{\n    border:none;\n    border-radius:5px;\n    padding:0;\n}\n\n.ogl_expeditionRow > div:not(:last-child)\n{\n    display:flex;\n}\n\n.ogl_expeditionRow *\n{\n    white-space:nowrap;\n}\n\n.ogl_expeditionText\n{\n    line-height:24px;\n}\n\n.ogl_expeditionDebris\n{\n    display:flex;\n    grid-gap:10px;\n}\n\n.ogl_sideFleetTooltip:not(.ogl_tooltipTriangle):not(.ogl_close)\n{\n    display:grid !important;\n    font-size:11px;\n    grid-gap:2px;\n    max-width:800px !important;\n}\n\n.ogl_sideFleetIcon\n{\n    align-items:center;\n    display:grid;\n    grid-gap:5px;\n    grid-template-columns:70px 30px 70px 60px 20px 30px 70px 98px 98px 98px;\n    justify-content:center;\n}\n\n.ogl_sideFleetIcon > *:not(img)\n{\n    background:var(--secondary);\n    border-radius:3px;\n}\n\n.ogl_sideFleetIcon > *:not(img):not(.ogl_icon)\n{\n    line-height:24px;\n    padding:0 3px;\n    text-align:center;\n}\n\n.ogl_sideFleetIcon .material-icons\n{\n    color:#fff;\n    font-size:14px !important;\n    line-height:24px !important;\n}\n\n.ogl_sideFleetIcon > span\n{\n    color:#fff;\n}\n\n[data-return-flight="true"]\n{\n    filter:brightness(.7);\n}\n\n#movementcomponent .starStreak .route\n{\n    color:#aaa;\n    text-align:center;\n}\n\n#movementcomponent .starStreak .route b\n{\n    color:#fff;\n    font-weight:normal;\n}\n\n.msg gradient-button .custom_btn\n{\n    border:none !important;\n}\n\ngradient-button img\n{\n    pointer-events:none !important;\n}\n\n.ogl_messageButton\n{\n    /*background:linear-gradient(to top, #151a20, #2e3948) !important;*/\n    background:linear-gradient(160deg, rgba(54,77,99,1) 0%, rgba(40,57,72,1) 33%, rgba(20,30,38,1) 66%, rgba(18,26,33,1) 100%) !important;\n    /*box-shadow:inset 0 2px 2px #374454, 0 0 0 1px #181f26;*/\n    box-shadow:0px 2px 3px 1px rgb(0,0,0,.55);\n    border-radius:5px;\n    color:#9ea5af !important;\n    cursor:pointer;\n    float:left;\n    font-size:20px !important;\n    font-weight:bold;\n    height:26px;\n    line-height:26px !important;\n    text-align:center;\n    width:26px;\n}\n\n.ogl_messageButton:hover\n{\n    /*background:linear-gradient(to bottom, #1a2027, #2e3948) !important;\n    box-shadow:inset 0 -1px 3px #374454;*/\n    background:linear-gradient(160deg, rgba(67, 107, 145, 1) 0%, rgba(52, 76, 97, 1) 33%, rgba(40, 58, 71, 1) 66%, rgba(20, 26, 32, 1) 100%) !important;\n    box-shadow:0px 0px 0px 0px transparent;\n}\n\nmessage-footer-actions gradient-button[sq30]\n{\n    height:26px !important;\n    width:26px !important;\n}\n\n.ogl_messageButton.ogl_ignore.ogl_active\n{\n    color:#c65757 !important;\n}\n\n.ogl_messageButton.ogl_ignore:before\n{\n    content:\'toggle_off\';\n    font-family:\'Material Icons\';\n    font-size:18px !important;\n}\n\n.ogl_messageButton.ogl_ignore.ogl_active:before\n{\n    content:\'toggle_on\';\n}\n\n.ogl_messageButton.ogl_ignore:hover:after\n{\n    display:inline-block;\n}\n\n.ogl_tooltip > .ogl_resourcesDetail:not(.ogl_tooltipTriangle):not(.ogl_close)\n{\n    display:grid !important;\n    grid-gap:12px;\n    grid-template-columns:repeat(2, 1fr);\n    max-width:800px;\n}\n\n.ogl_resourcesDetail > div:last-child\n{\n    grid-column:1 / -1;\n}\n\n.ogl_resourcesDetail > div\n{\n    background:var(--secondary);\n    border-radius:5px;\n    padding:7px;\n    position:relative;\n    text-align:center;\n}\n\n.ogl_resourcesDetail h3\n{\n    color:#9ea4af;\n    display:block;\n    font-size:24px !important;\n    margin-bottom:8px;\n    text-align:center;\n}\n\n.ogl_resourcesDetail .ogl_todoDays span:not(.ogl_suffix)\n{\n    color:#fff;\n}\n\n[data-api-code]\n{\n    cursor:pointer;\n}\n\n.reversal\n{\n    overflow:unset !important;\n}\n\n.ogl_button[data-key-color]:before, .reversal a[data-key-color]:before\n{\n    color:transparent;\n    content:\'\\e98b\';\n    font-family:\'Material Icons\';\n    font-size:11px;\n    line-height:12px;\n    pointer-events:none;\n    position:absolute;\n    right:-4px;\n    text-shadow:-1px 1px 2px rgba(0,0,0,.4);\n    top:-3px;\n}\n\n.reversal a:before\n{\n    right:-6px;\n    top:0;\n}\n\n.ogl_button[data-key-color="orange"]:before { color:#ff7806; }\n.ogl_button[data-key-color="violet"]:before { color:#fa59fd; }\n.ogl_button[data-key-color="blue"]:before { color:var(--mission15); }\n.ogl_button[data-key-color="cyan"]:before { color:#7bffed; }\n\n.reversal a[data-key-color="orange"]:before { color:#ff7806; }\n.reversal a[data-key-color="violet"]:before { color:#fa59fd; }\n\n[data-key-color="undefined"]:before\n{\n    display:none !important;\n}\n\n.ogl_reverse\n{\n    color:#fff;\n    font-size:16px !important;\n    opacity:.6;\n    position:absolute;\n    right:5px;\n    text-shadow:2px 1px 0 #000;\n    top:3px;\n    z-index:10;\n}\n\n.ogl_reverse:hover\n{\n    opacity:1;\n}\n\n.resourceIcon .ogl_reverse\n{\n    right:1px;\n    top:1px;\n}\n\n.ogl_notification\n{\n    background:var(--tertiary);\n    bottom:5px;\n    box-shadow:0 0 20px 10px rgba(0,0,0,.7);\n    font-weight:bold;\n    max-height:500px;\n    min-width:275px;\n    opacity:0;\n    overflow-y:auto;\n    overflow-x:hidden;\n    padding:14px 14px 11px 14px;\n    pointer-events:none;\n    position:fixed;\n    right:5px;\n    transform:scaleX(0);\n    transform-origin:center right;\n    transition:transform .2s;\n    z-index:1000003;\n}\n\n.ogl_notification.ogl_active\n{\n    opacity:1;\n    pointer-events:all;\n    transform:scaleX(1);\n}\n\n.ogl_notificationLine\n{\n    border-bottom:1px solid #2d3644;\n    display:flex;\n    font-size:11px;\n    grid-gap:7px;\n    line-height:15px;\n    padding:8px 0;\n    max-width:380px;\n}\n\n.ogl_notificationLine:last-child\n{\n    border:none;\n}\n\n.ogl_notification > div > *:last-child > hr:last-child\n{\n    display:none;\n}\n\n.ogl_notification progress\n{\n    appearance:none;\n    height:3px;\n    left:0;\n    position:absolute;\n    top:0;\n    width:100%;\n}\n\n.ogl_notification progress::-webkit-progress-value\n{\n    appearance:none;\n    background:var(--ogl);\n    transition:width .2s linear;\n}\n\n.ogl_notification progress::-moz-progress-bar\n{\n    appearance:none;\n    background:var(--amber);\n    transition:width .2s linear;\n}\n\n.ogl_notification .ogl_ok, .ogl_notification .ogl_danger\n{\n    font-size:12px !important;\n    margin-left:4px;\n    vertical-align:middle;\n}\n\n.ogl_notification h2\n{\n    font-size:14px;\n    text-align:center;\n}\n\n.ogl_notification .ogl_grid\n{\n    display:grid;\n    grid-gap:5px;\n    grid-template-columns:repeat(2, 1fr);\n    max-width:275px;\n}\n\n.ogl_notification .ogl_icon\n{\n    align-items:center;\n    background:var(--secondary);\n    border-radius:3px;\n    display:flex;\n}\n\n.ogl_notification .ogl_icon:before\n{\n    margin-right:auto;\n}\n\n.ogl_notification .ogl_icon[class*="lifeform"]:before\n{\n    background-position-y:77%;\n    background-size:335px;\n    height:18px;\n    image-rendering:auto;\n    width:28px;\n}\n\n.ogl_notification .ogl_icon .ogl_suffix\n{\n    text-indent:0;\n}\n\n.ogl_notification .ogl_notificationTimer\n{\n    color:var(--date);\n    display:inline-block;\n    font-size:11px;\n    margin-right:5px;\n    opacity:.5;\n}\n\n.ogl_empireJumpgate\n{\n    font-size:20px !important;\n    margin-top:3px;\n    text-align:center;\n    width:100%;\n}\n\n#eventboxContent .eventFleet, #eventboxContent .allianceAttack\n{\n    align-items:center;\n    display:grid;\n    grid-gap:2px;\n    grid-template-columns:82px 62px 23px 70px 87px auto 19px 87px 70px 20px 21px 20px;\n    white-space:nowrap;\n}\n\n#eventboxContent .eventFleet > td\n{\n    align-items:center;\n    box-shadow:0 0 0 2px rgba(0,0,0,.25);\n    box-sizing:border-box;\n    border-radius:3px;\n    display:flex;\n    height:calc(100% - 2px);\n    justify-content:left;\n    overflow:hidden;\n    padding:2px 4px;\n    text-align:center;\n    width:100%;\n}\n\n#eventboxContent .eventFleet { td.arrivalTime, td.coordsOrigin, td.destCoords { justify-content:center; }}\n#eventboxContent .eventFleet > td:not(.icon_movement):not(.icon_movement_reserve) { padding:2px 2px; }\n#eventboxContent .eventFleet > td:nth-child(3) { background:none !important; }\n#eventboxContent .eventFleet > td:nth-child(5) { grid-column:4;grid-row:1; }\n\n#eventboxContent .eventFleet > td:nth-child(10) span,\n#eventboxContent .eventFleet > td:nth-child(11) span,\n#eventboxContent .eventFleet > td:nth-child(12) span\n{\n    display:flex !important;\n}\n\n#eventboxContent .eventFleet > td a\n{\n    text-decoration:none !important;\n}\n\n#eventboxContent .eventFleet > td a:hover\n{\n    color:var(--ogl) !important;\n}\n\n.eventFleet [data-output-time]\n{\n    justify-self:flex-start;\n}\n\n.icon_movement, .icon_movement_reserve\n{\n    background-position:center !important;\n}\n\n.originFleet, .destFleet\n{\n    align-items:center;\n    display:flex;\n    grid-gap:2px;\n    justify-content:center;\n}\n\n.originFleet .tooltip[data-title]:not(figure),\n.destFleet .tooltip[data-title]:not(figure)\n{\n    align-items:center;\n    display:inline-flex !important;\n    font-size:0;\n    grid-gap:1px;\n}\n\n.originFleet .tooltip[data-title]:not(figure):after,\n.destFleet .tooltip[data-title]:not(figure):after\n{\n    content:attr(data-title);\n    font-size:11px;\n    overflow:hidden;\n    text-overflow:ellipsis;\n}\n\n.originFleet figure, .destFleet figure\n{\n    flex-shrink:0;\n}\n\n#technologydetails .ogl_queueShip\n{\n    display:flex;\n    position:absolute;\n    top:52px;\n}\n\n#technologydetails .ogl_queueShip .ogl_button\n{\n    border-radius:3px 0 0 3px;\n    width:60px;\n}\n\n#technologydetails .ogl_queueShip input\n{\n    background:#121518;\n    border:none;\n    border-bottom:1px solid #242a32;\n    border-radius:0 3px 3px 0;\n    border-top:1px solid #080b10;\n    box-shadow:none;\n    box-sizing:border-box;\n    color:#5d738d;\n    padding:0 4px;\n    text-align:left;\n    width:45px;\n}\n\n.fleetDetails\n{\n    background:linear-gradient(to bottom, #1a1d24, #0e1014 26px) !important;\n    border:none !important;\n    border-radius:0 !important;\n    box-shadow:0 0 20px -5px #000, 0 0 0 1px #000 !important;\n    display:inline-block !important;\n    line-height:18px !important;\n    margin:12px 0 0 6px !important;\n    overflow:unset !important;\n    padding:5px !important;\n    position:relative !important;\n    width:96% !important;\n}\n\n.fleetDetails.detailsOpened\n{\n    height:auto !important;\n}\n\n.fleetDetails .starStreak, .fleetDetails .nextMission,\n.fleetDetails .mission, .fleetDetails.detailsClosed .ogl_shipsBlock,\n.fleetDetails.detailsClosed .ogl_resourcesBlock,\n.fleetDetails.detailsClosed .fedAttack,\n.fleetDetails.detailsClosed .sendMail,\n.fleetDetails .fleetDetailButton, .fleetDetails .marker01, .fleetDetails .marker02\n{\n    display:none !important;\n}\n\n.fleetDetails hr\n{\n    background:#1e252e;\n    border:none;\n    height:2px;\n}\n\n.fleetDetails .openDetails\n{\n    left:auto !important;\n    position:absolute !important;\n    right:0 !important;\n    top:-2px !important;\n}\n\n.fleetDetails.detailsOpened .timer\n{\n    height:auto !important;\n}\n\n.ogl_resourcesBlock\n{\n    box-sizing:border-box;\n    display:grid;\n    font-size:11px;\n    grid-gap:5px;\n    grid-template-columns:repeat(8, 1fr);\n    margin-top:5px;\n    text-wrap:nowrap;\n    width:100%;\n}\n\n.ogl_resourcesBlock .ogl_icon\n{\n    background:#191d26;\n    margin:0;\n    padding:3px;\n    justify-content:end;\n}\n\n.ogl_resourcesBlock .ogl_icon:before\n{\n    display:block;\n    margin:0 auto 0 0;\n}\n\n.ogl_shipsBlock\n{\n    box-sizing:border-box;\n    color:#fff;\n    display:grid;\n    grid-template-columns:repeat(3, 1fr);\n}\n\n.ogl_backTimer\n{\n    align-items:center;\n    box-shadow:0 0 0 1px #000;\n    box-sizing:border-box;\n    font-size:0;\n    grid-column:-3 / -1;\n    grid-row:1;\n    line-height:14px !important;\n    padding:5px 32px 5px 5px;\n    text-align:right;\n}\n\n.ogl_backTimer:before, .ogl_backTimer:after\n{\n    font-size:11px;\n}\n\n.ogl_backTimer:hover\n{\n    box-shadow:0 0 0 2px var(--ogl);\n    color:transparent !important;\n}\n\n.fleetDetails .reversal_time\n{\n    left:auto !important;\n    position:absolute !important;\n    right:10px !important;\n    top:31px !important;\n    z-index:2 !important;\n}\n\n.fleetDetails.detailsClosed .reversal_time\n{\n    pointer-events:all !important;\n    right:0 !important;\n    top:14px !important;\n}\n\n.ogl_timeBlock\n{\n    align-items:center;\n    border-radius:3px;\n    display:grid;\n    grid-gap:78px;\n    grid-template-columns:repeat(2, 1fr);\n}\n\n.ogl_timeBlockLeft, .ogl_timeBlockRight\n{\n    border-radius:3px;\n    display:grid;\n    grid-template-columns:70px 70px auto;\n    padding:1px;\n    justify-content:start;\n}\n\n.ogl_timeBlockRight\n{\n    grid-template-columns:auto 70px 70px;\n    justify-content:end;\n    text-align:right;\n}\n\n.ogl_timeBlock > div > *\n{\n    left:0 !important;\n    line-height:14px !important;\n    margin:0 !important;\n    padding:0 !important;\n    position:relative !important;\n    text-align:inherit !important;\n    top:0 !important;\n    width:auto !important;\n}\n\n.ogl_timeBlock .tooltip\n{\n    color:inherit !important;\n}\n\n.ogl_timeBlock .originData, .ogl_timeBlock .destinationData\n{\n    display:flex;\n    grid-gap:5px;\n    justify-content:center;\n}\n\n.ogl_timeBlock .originPlanet, .ogl_timeBlock .destinationPlanet,\n.ogl_timeBlock .originCoords, .ogl_timeBlock .destinationCoords\n{\n    left:0 !important;\n    padding:0 !important;\n    position:relative !important;\n}\n\n.detailsOpened .destinationPlanet, .detailsClosed .destinationPlanet,\n.detailsOpened .originPlanet\n{\n    width:auto !important;\n}\n\n.ogl_actionsBlock\n{\n    align-items:center;\n    background:var(--tertiary);\n    border-radius:3px;\n    box-shadow:0 3px 5px -2px #000;\n    display:grid;\n    grid-gap:5px;\n    grid-template-columns:repeat(2, 1fr);\n    justify-content:center;\n    left:50%;\n    padding:2px;\n    position:absolute;\n    top:-5px;\n    transform:translateX(-50%);\n    z-index:2;\n}\n\n.ogl_actionsBlock *\n{\n    justify-self:center;\n    left:0 !important;\n    margin:0 !important;\n    padding:0 !important;\n    position:relative !important;\n    top:0 !important;\n    width:18px !important;\n}\n\n.ogl_actionsBlock .ogl_icon[class*="ogl_mission"]:not(.ogl_mission18):before\n{\n    background-size:212px !important;\n}\n\n.ogl_actionsBlock .ogl_icon[class*="ogl_mission"]:before\n{\n    margin:0;\n    width:18px;\n}\n\n.fleetDetails .allianceName\n{\n    bottom:auto !important;\n    left:auto !important;\n    right:3px !important;\n    top:-17px !important;\n}\n\n.ogl_phalanxLastUpdate\n{\n    background:var(--secondary);\n    border-radius:4px;\n    margin-bottom:10px;\n    padding:5px;\n    text-align:center;\n}\n\n.ogl_phalanxLastUpdate b\n{\n    color:var(--amber);\n}\n\n.ogl_universeName\n{\n    color:#aeaac1;\n    font-size:12px;\n    font-weight:bold;\n    line-height:12px;\n    pointer-events:none;\n    position:absolute;\n    text-align:right;\n    top:92px;\n    width:138px;\n}\n\n.ogl_universeInfoTooltip\n{\n    line-height:1.4;\n}\n\n.ogl_universeInfoTooltip div\n{\n    color:var(--amber);\n    display:inline-block;\n    float:right;\n    font-size:11px;\n    text-indent:10px;\n}\n\n.ogl_popup .ogl_frameSelector\n{\n    display:grid;\n    grid-gap:5px;\n    grid-template-columns:repeat(6, 1fr);\n    margin-bottom:10px;\n}\n\n.ogl_popup .ogl_frameSelector .ogl_button\n{\n    min-width:80px;\n}\n\n.ogl_popup .ogl_frameSelector .ogl_button.ogl_active\n{\n    box-shadow:0 0 0 2px var(--ogl);\n}\n\n.ogl_ptreContent\n{\n    display:grid;\n    grid-gap:10px;\n    grid-template-columns:auto auto;\n}\n\n.ogl_ptreContent b\n{\n    align-items:center;\n    border-bottom:1px solid #1b222b;\n    border-top:1px solid #1b222b;\n    color:#ff4646;\n    display:flex;\n    font-size:12px;\n    justify-content:center;\n    margin-bottom:10px;\n    padding:5px 0;\n}\n\n.ogl_ptreContent b .material-icons\n{\n    font-size:16px !important;\n    margin-right:5px;\n}\n\n.ogl_ptreContent h3\n{\n    font-size:18px;\n    grid-column:1 / -1;\n    padding:8px;\n    text-align:center;\n}\n\n.ogl_ptreContent hr\n{\n    background:#151e28;\n    border:none;\n    grid-column:1 / -1;\n    height:2px;\n    width:100%;\n}\n\n.ogl_ptreActivityBlock, .ogl_ptreBestReport\n{\n    background:rgba(0,0,0,.2);\n    border-radius:9px;\n    padding:10px;\n}\n\n.ogl_ptreLegend\n{\n    color:var(--blue);\n    font-size:10px;\n    margin-top:20px;\n    text-align:left;\n}\n\n.ogl_ptreActivities [data-check]\n{\n    align-self:center;\n    background:currentColor;\n    border:3px solid currentColor;\n    border-radius:50%;\n    height:0;\n    padding:4px;\n    width:0;\n}\n\n.ogl_ptreActivities [data-check].ogl_active\n{\n    background:none;\n}\n\n.ogl_ptreActivities > span\n{\n    color:var(--red);\n}\n\n.ogl_ptreActivities > div\n{\n    display:grid;\n    grid-gap:5px;\n    grid-template-columns:repeat(12, 1fr);\n}\n\n.ogl_ptreActivities > div > *\n{\n    align-items:center;\n    background:var(--secondary);\n    border-radius:2px;\n    color:#656f78;\n    display:grid;\n    height:45px;\n    padding:3px;\n}\n\n.ogl_ptreActivities > div > * > *\n{\n    display:inline-block;\n    margin:auto;\n}\n\n.ogl_ptreActivities .ptreDotStats\n{\n    height:30px;\n    position:relative;\n    width:30px;\n}\n\n.ogl_ptreContent\n{\n    text-align:center;\n}\n\n.ogl_ptreBestReport > div:first-child\n{\n    padding:10px;\n}\n\n.ogl_checked\n{\n    color:var(--green);\n    font-size:19px !important;\n    vertical-align:middle;\n}\n\n.ogl_log > div:not(.ogl_close):not(.ogl_share)\n{\n    border-bottom:1px solid #20262c;\n    display:grid;\n    grid-template-columns:100px 100px 300px;\n    margin-top:5px;\n    padding-bottom:5px;\n}\n\n.ogl_log h2\n{\n    grid-column:1 / -1;\n}\n\n.ogl_ptreActionIcon\n{\n    align-items:center;\n    display:inline-flex;\n    justify-content:center;\n}\n\n.ogl_ptreActionIcon i\n{\n    color:inherit;\n    font-size:12px !important;\n}\n\n.ogl_ptreActionIcon i.ogl_active\n{\n    animation:blink 1.5s linear infinite;\n}\n\n@keyframes blink\n{\n  50% { opacity: 0; }\n}\n\n.ogl_leftMenuIcon\n{\n    background:linear-gradient(to bottom, #1b2024 50%, #000 50%);\n    border-radius:4px;\n    display:block;\n    height:27px;\n    margin-right:11px;\n    user-select:none;\n    text-align:center;\n    width:27px !important;\n}\n\n.ogl_leftMenuIcon a\n{\n    align-items:center;\n    color:#353a3c !important;\n    display:flex !important;\n    height:100%;\n    justify-content:center;\n}\n\n.ogl_leftMenuIcon a i\n{\n    font-size:21px !important;\n    line-height:27px !important;\n}\n\n.ogl_leftMenuIcon a:hover\n{\n    color:#d39343 !important;\n}\n\n.ogl_resourceBoxStorage\n{\n    display:none;\n    font-size:10px;\n    left:0;\n    pointer-events:none;\n    position:absolute;\n    top:12px;\n    width:100%;\n}\n\n#resources:hover .ogl_resourceBoxStorage\n{\n    display:block;\n}\n\n#resources:hover .resource_tile .resourceIcon.metal,\n#resources:hover .resource_tile .resourceIcon.crystal,\n#resources:hover .resource_tile .resourceIcon.deuterium\n{\n    box-shadow:inset 0 0 0 20px rgba(0,0,0, .8);\n}\n\n.ogl_manageData .ogl_grid\n{\n    display:grid;\n    grid-gap:5px;\n}\n\n.ogl_manageData .ogl_button\n{\n    align-items:center;\n    display:flex;\n    justify-content:center;\n    padding:3px 9px;\n}\n\n.ogl_manageData .ogl_button .material-icons\n{\n    margin-left:auto;\n}\n\n.ogl_manageData .ogl_button.ogl_danger\n{\n    background:linear-gradient(to bottom, #7c4848, #5a3535 2px, #3a1818);\n    color:#b7c1c9 !important;\n}\n\n.ogl_manageData .ogl_button.ogl_danger:hover\n{\n    color:var(--ogl) !important;\n}\n\n.ogl_manageData hr\n{\n    background:#151e28;\n    border:none;\n    grid-column:1 / -1;\n    height:2px;\n    width:100%;\n}\n\n.chat_msg .msg_date\n{\n    position:absolute;\n}\n\n.ogl_acsInfo .value span\n{\n    margin-left:5px;\n}\n\n.ogl_blackHoleButton\n{\n    font-size:16px !important;\n    position:absolute;\n    right:-3px;\n    top:0;\n    transform:translateX(100%);\n    width:28px;\n}\n\n.ogl_blackhole .ogl_button\n{\n    float:right;\n    margin-top:10px;\n    width:70px;\n}\n\n.ogl_buildIconList\n{\n    bottom:0;\n    display:flex;\n    left:30px;\n    pointer-events:none;\n    position:absolute;\n}\n\n.ogl_buildIcon\n{\n    color:#73fff2;\n}\n\n.ogl_baseShip\n{\n    color:#ffcb55;\n}\n\n.ogl_buildIcon.ogl_lfBuilding\n{\n    color:#e598ff;\n}\n\n.ogl_buildList\n{\n    margin-top:5px;\n}\n\n.ogl_buildList li\n{\n    align-items:center;\n    display:flex;\n}\n\n.ogl_buildList li span\n{\n    display:inline-block;\n    max-width:100px;\n}\n\n.ogl_buildList .material-icons\n{\n    margin:0 7px;\n}\n\n.ogl_buildList .material-icons:first-child\n{\n    font-size:8px !important;\n    margin:0 4px 0 0;\n}\n\n.ogl_buildList b\n{\n    color:var(--amber);\n    font-size:12px;\n    font-weight:bold;\n}\n\n[data-debug]\n{\n    position:relative;\n}\n\n[data-debug]:after\n{\n    background:rgba(0,0,0,.7);\n    color:yellow !important;\n    content:attr(data-debug);\n    display:block;\n    left:0;\n    opacity:.8;\n    position:absolute;\n    text-shadow:1px 1px #000;\n    top:12px;\n    width:max-content;\n}\n\n.ogl_datePicker\n{\n    display:grid !important;\n    grid-gap:10px;\n    grid-template-columns:repeat(3, 1fr);\n    user-select:none;\n}\n\n.ogl_datePicker .ogl_dateItem\n{\n    align-items:center;\n    display:flex;\n    font-size:14px;\n    justify-content:center;\n}\n\n.ogl_datePicker .material-icons\n{\n    font-size:16px !important;\n}\n\n#jumpgate #selecttarget select\n{\n    display:block !important;\n    visibility:visible !important;\n}\n\n#jumpgate #selecttarget .dropdown\n{\n    display:none !important;\n}\n\n#jumpgate select\n{\n    font-size:12px !important;\n    padding:2px !important;\n}\n\n.ogl_boardMessageTab .tabs_btn_img\n{\n    background:linear-gradient(135deg, #375063 33.33%, #23394a 33.33%, #23394a 50%, #375063 50%, #375063 83.33%, #23394a 83.33%, #23394a 100%) !important;\n    background-size:3px 3px !important;\n    border-bottom:1px solid #385365 !important;\n    border-left:2px solid #3c596c !important;\n    border-right:2px solid #3c596c !important;\n    border-top:1px solid #385365 !important;\n    border-radius:7px !important;\n    box-shadow:inset 0 0 10px 6px #1c2831 !important;\n    cursor:pointer !important;\n    height:50px !important;\n    margin-top:1px !important;\n    position:relative !important;\n    text-decoration:none !important;\n    width:48px !important;\n}\n\n.ogl_boardMessageTab .tabs_btn_img:hover\n{\n    filter:brightness(1.2);\n}\n\n.ogl_boardMessageTab .tabs_btn_img:before\n{\n    background:#395467;\n    border-radius:6px;\n    content:\'\';\n    filter:blur(0.5px);\n    height:calc(50% + 2px);\n    left:0;\n    opacity:.6;\n    position:absolute;\n    right:0;\n    top:-2px;\n}\n\n.ogl_boardMessageTab .tabs_btn_img:after\n{\n    background:#395467;\n    border-radius:7px;\n    bottom:2px;\n    content:\'\';\n    filter:blur(1px);\n    height:4px;\n    left:3px;\n    opacity:.6;\n    position:absolute;\n    right:3px;\n}\n\n.ogl_boardMessageTab.ui-tabs-active .marker\n{\n    left:-10px !important;\n    top:-9px !important;\n}\n\n.ogl_boardMessageTab .icon_caption\n{\n    margin:0 !important;\n    position:relative !important;\n    width:100% !important;\n    z-index:1 !important;\n}\n\n.tabs_btn_img .material-icons\n{\n    align-items:center;\n    background:linear-gradient(to bottom, #d7dfe5 50%, #d4d9dd 50%);\n    background-clip:text;\n    color:transparent;\n    display:flex;\n    font-size:36px !important;\n    height:100%;\n    justify-content:center;\n    margin-bottom:4px;\n    width:100%;\n}\n\n#oglBoardTab *\n{\n    max-width:100%;\n}\n\n#oglBoardTab .msg\n{\n    padding:10px;\n}\n\n#oglBoardTab .msg_content\n{\n    margin-top:10px;\n    padding:0;\n}\n\n#oglBoardTab .msg_title\n{\n    display:inline-block !important\n}\n\n#oglBoardTab .msg_title:hover\n{\n    color:#fff;\n    cursor:pointer;\n    text-decoration:underline;\n}\n\n#oglBoardTab .msg_title i\n{\n    color:var(--pink);\n}\n\n#oglBoardTab .spoilerBox\n{\n    display:none !important;\n}\n\n.ogl_sidenote\n{\n    color:#aaa;\n    font-style:italic;\n}\n\n.ogl_shipDataInfo .material-icons\n{\n    color:#7ca8ad;\n    font-size:18px !important;\n    vertical-align:middle;\n}\n\n.ogl_shipDataInfo b\n{\n    color:var(--ogl);\n}\n\n.ogl_totalRequired\n{\n    background:var(--primary);\n    border-radius:3px;\n    margin-top:10px;\n    padding:10px;\n}\n\n.ogl_totalRequired h3\n{\n    pointer-events:none;\n    text-align:center;\n}\n\n.ogl_totalRequired h3:after\n{\n    content:none;\n}\n\n.ogl_totalRequired .ogl_200:before\n{\n    visibility:hidden;\n}\n\n.ogl_totalRequired .ogl_grid\n{\n    display:flex;\n}\n\n.ogl_totalRequired .ogl_icon\n{\n    display:grid;\n    grid-gap:8px;\n    text-align:center;\n}\n\n.ogl_totalRequired .ogl_icon:before\n{\n    margin:auto;\n}\n\n.shipyardSelection\n{\n    background:var(--primary);\n    padding:10px;\n    width:auto !important;\n}\n\n.ogl_timeBox\n{\n    display:block;\n    margin-top:5px;\n}\n\n.ogl_lineBreakFlex\n{\n    flex-basis:100%;\n    height:0;\n}\n\n.msg .content-box\n{\n    align-items:center !important;\n    background:none !important;\n    border:none !important;\n    box-shadow:none !important;\n    margin:0 !important;\n    padding:0 !important;\n    justify-content:center !important;\n}\n\n.detail_msg .loot-row\n{\n    background:#1f252e;\n    border-radius:5px;\n    padding:5px;\n}\n\n.msg .content-box\n{\n    display:none !important;\n}\n\n#messagecontainercomponent .msg\n{\n    margin-bottom:3px !important;\n}\n\n.messagesHolder .msgWithFilter .msgFilteredHeaderRow\n{\n    border-bottom:1px solid #000;\n    box-shadow:none !important;\n}\n\n.tippy-box\n{\n    box-shadow:0 0 20px -5px #000, 0 0 5px 2px rgba(0,0,0,.5) !important;\n}\n\n.tippy-content\n{\n    background:var(--tertiary) !important;\n    border:none !important;\n    border-radius:5px !important;\n    font-size:11px !important;\n    padding:20px !important;\n}\n\n.tippy-content hr, .ogl_notification hr\n{\n    background:#1e252e;\n    border:none;\n    grid-column:1 / -1;\n    height:2px;\n    width:100%;\n}\n\n.tippy-arrow\n{\n    color:#171c24 !important;\n}\n\n.tippy-box[data-animation=\'pop\'][data-state=\'hidden\'] { opacity:0; }\n.tippy-box[data-animation=\'pop\'][data-state=\'hidden\'][data-placement^="left"] { transform:translateX(20px); }\n.tippy-box[data-animation=\'pop\'][data-state=\'hidden\'][data-placement^="right"] { transform:translateX(-20px); }\n.tippy-box[data-animation=\'pop\'][data-state=\'hidden\'][data-placement^="bottom"] { transform:translateY(-20px); }\n.tippy-box[data-animation=\'pop\'][data-state=\'hidden\'][data-placement^="top"] { transform:translateY(20px); }\n\n';
GM_addStyle(css);
const oglMaterial = "\n@font-face\n{\n    font-family:'Material Icons';\n    font-style:normal;\n    font-weight:400;\n    src:url('data:font/woff2;base64,d09GMgABAAAAAG9gAA8AAAABA3QAAG8AAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0ZGVE0cGhgbIBzHKgZgAIhsEQgKgv4wgqMKC4YwAAE2AiQDjFwEIAWDGwedUBuc0TdUNmyGIP5uGwBUR9j+duECuems3I6isPl1OM5GRLBxALQHF87+///TEpSMofmAR4JUFdV1myGNyLQuKWu0QconI3KT3vduSEQ77JRtd/v0Vrtk1d42u2ZKVrtxoTju530OmT/Te9PFScG9BxZKwS5cow0nIgqiwqg3K1znfjq5vHT7rNEW8jpTsJMCFEW/euhxS1DlHejXcF6WxEqzIJo1QRGI0SwEDMFAwUBRbCWxB9ssmnTktyR/1ipP/T8Xjq+eFiVRm4qfgv+FrDBu4aVi5sQLwbfGb2Zv75sISVybSha9jnpVCZlHKJ4ga2jcMDa/x0XpRMR4YpzgNi+6+/dF9u8eys3+J8DaDHnqR5Or6MlkklTW6k+dC72WaxTfNmKIR5AqNQvw5P/NpjU3yBbIkpEwJQFSHDa50turlcf/QMfQpYCifw7Pb7NnNVgNZoCKhUiU8AkBQUXBQOyPYmxn1Zy6zbnQpWt1pS7VVakLl7dw27m8pauLFRTq3QtVvGRVXLL/nzbtL022kPhEWycwFQaIkopBDGIy7yVDBEIjYmdn6kKqmleVYU1hv4Y0K65DVLu93jzRxsPAAoQkoBqcF3IepNOC/X2zdbfyIcGtfuGcoHj35cy+qnucvFfVLc98QLrtf4GP4LGru20rydiWLYW9uxPWRbpK14FkFigECwwDw/Se+80DywMAMhxLMYNfYFi4mb9iJIJMLgKm9Kxub+CP9HCEaevcgW1zX7Lapbm82kTPvgXm9ikwAiEnp9SsfEhvKM/+Z66Z/x2wXQQqnNRLF1838sjtdfcKPRm/2ySjY8NYFX5kHILc2HbIIxZSAhw6pV0LLJm8uN//Wr12a3/6k+sAoIpwgDJO9tTUvprqOzX9gXrf9ukPPGeC3LMrekK4AUAhARWzUXEywkUJFZ/PVLMd0AlQBC/yHFJFnRNVdA6xDEXj0kX5d7CAZhagNAso7IJ80oJOC10awNK7AS8SDJdSqOw8oNKAlxZwgngOeyFWPHUOKVTn1rUrV25zU7upfKVbdy761tfrrD6V54h8AJwkEF2KSXBB1uonC/pJsvw0YD97Z70+8mpYHvCyJY8XdOTyEdGMl71H8JHDH0QEIXCQfXi+vzf1npm/raGtYqtnU1/SASOQ/rL0Z0UCEqAwBgBDtLks/IHFEJNbGWzZT59eAjiqtqRB0QKypH7f/Y0N/56E3g8XyLGqiaqoqNlbsUJnr3IeGymDiIiIW/E77hVtzk/pU668kvt6pS5hWYwxRhghhBjEYET+H1N7X2OtGYtQaplaUMxYZivJvtvHmNonNV0zv836qMEMFQRkHHBI7R8CuJfvcyx2j/x5ueqSViaqouARyfcuweLgDu9Ql4AYzpLnt9q6kKO44qdxBLrWNyAD8fCBPDlQppUfJcQy4/8317sWGIqrXD+jdElTmXX5/krtyolVXZEO1Zcva01V8HtRRqY6brXobCcbhz1oXb2qgCPEFUF4IjBV9TRb0YkfRN6Fjjt4PbO3tw9F+sKXWmW92fV70V8eX3h8CpXasPLsTcUfxOWypYVx6VQaJgyj0SFGMqT2KxGYcn7mZMhlwoIL6nKMiMcpIe5rYhox/xEMR7TAOxOnmTpaR/S/pRhyIScYTXZvaQjVnuyKzoTKWVFQiSBFjyWBdFFCrOblOAZi4aTYWWlL5aN0IyqHnO5eViMPB2/m0u6JylfP7c4YKdF6wJI7JGuSRgK6RyOXSOl+rF/MmxZbT/ZFU7JwF0arN461WuFeRJj66XWMTyS7WRzUhyBeQBfkK7HoCLn1HZfbykZIyswTKf1ZHWyvLZAEWyAjjYhp8Oq+HviF/Gi9JDJsDyBkcfLKenkb4sgoOFkEsZN4TM4B2ObyaTdFQXnlVtTV5dbcdSP5XiYrIljIgq31cUGJhWtjDiU6bIHgX2vCsquts+GmE+kcfXe88p2/ilijs96GivMPkM9tKOfW8eqGlCLnWh6FXvIgXpQyvbyiWQ5x2bXyJ4ot81MKke2191Eb3jYKp9TZGJxq1qaYnOtjtyUlIp7cipR+IJL6WQZ3RhzS3xzXKDsil/0YtRT/wTbaOkKE5cU1Iu9DqTRCUjKmO7D33zMRQTxqAQSl/9MK62m1vh8iEi2w02Gn5fqqRH/MlLWUzyvoOzEPDpdSA55t3QPfnUCCIDZE/4iP/KiI1bEzDsThOBGn44P4Lv4SgbQibUm90/A0zjyyaAtGJvyIGFQTxNm3jv0ai1GMAPVPGkbODoMO0q8+W11qB83GTGQLMGc9kppNCOPbbom3mQ5qeiGH0tRkIa9ZTQIep2GIl+ErWCb3WWfXE5miy5F9WYbmC2xRr0E/QHQTg6tuCdoH8R92FbeZ+D7WCC2uKHZOm1PinDYj/pw2JeGcNplKrrcSryVmdQQDYHix+htJzeGq5BipL5O1llS5CaBHaEM41wSoUhAGOwYgEIw3+RXCFvE3MVTdFS8RvuX0N5Wa2WlZSnhshHNV4PCq1Hd4r2ytDn59PjSTJ7bFSxWFKsrsbDVqbZ4t/l5iNMswldbXJxqOi1m1JNRH2MNGzZPagCLhELY+/QHP1y6DftEPqkli3fr83rW3AxUF9frUzFXlS9Ux9pj6WCtj9cRoGdo7aJqLUGweYYdctsldwRWCGJFAlXqMXwHRaHIuS1pNdQ0Fxm6UIcnFfimjrBb8+Mtai9qLPNYmPoiaJeQwHEQgoRh4DuqHi23thM2qGwsbVE9zQT1ruPt+5yFRCZkRZC5qZPP3yaisvdGWq9rzyh8JdomVqsgcy2ywk49ZojsyiLM+pfwro+pJomeSm3iLOmdeGkOSFSfRIT5y8dvaVvc4jBlks5zpUdYniIgzzyFtxdDJG/7BwXAxSafUe+Z1ph5dXqxOh/edH7NTXVHxYBpphp9Q8p4yEPARo868Vy4DB+y5R/Ih1tJb5c0lhgdcBNv/1tlhDUR+IMfBpSDP1RVadkulBJM98OelVNfdVMu6/vVTCXvECZmj2jo77BUGyUCL84rOcNyIMi4ExHV6JMbTIGlD2Op0yPgVVsgmEI62lUnyorTRIBfiGhyNuBy5ZMyim5iZZ7liSN2QfDqalSPOkvR+qhVQz5yCxLCXgR/vtp/cbH7UjdCC2yKTkAU83E2xdQNwP1C8rHA3TREHmks6xPOi3U74rroo1DrcL4L8qjwJCYorhZWxpL58ZT3NZdr0xE/F7DBUvEwjE4EkSQ6Ciz0wMWD7qxdBaFGHPoKLvQ62152s18zT2YGb2VpOkIdhSZL6LalvCC1DwIPLI3lJIb9oBn8qGmQB9/ByZh84LYff8ngZtuOZefpOnHPIJs9IOEJkaantHG2yoWOYQcX/QZ7ke7j3ygbfOSHjyyCxNcpY5jJngzmmopYCjHWymrib2CY0X7+6vmaSdQU++CfBNn2pQUteJ385C6x7ydVCRLYiYw6foqz7j6kDpK20Kcxel6RoXiDsODrBFlNg6yD5BAbvt9WnZw4vNiSxF4oxs2pG6cSyeLIkyGpLTGLJdgP2YgqHI6Mah6BnUhvyd1ZOeOa2KggBx5z7UFJca7zvLeumUoTseY1IjSXYLXa5Mx3l2i0w3EZplH8VS+XEWwDEIQpod6DGcCWBy/oDvsS3LQNGMQuJSMsY6pEIYmIPR4hqyr1Zqp0g1c3+X82TpaKeFmr62x8pBktUwDMKzIf5+0MsCB7zc7hJufkOvHhpEfHYn0L3d+Jxqka6Hm/CIz0BX+IaML+8slU0ySsYb69MvSScS7AfqYr465WivBJ7j9UFv8mu+kP6m8vW98xPRWzS3zghMyywkhK22OcSgpKQEHHr0ir4wgOO0GhqEs1mmwG+Xoo4wi1cFeEcqUcQuwMQGU3S4pPRF9jOadMQ+xzfozNmOAR6QWMLBiT2q9I6dWPIEk50IdCmxaB8b7W8pTRdQAl9jzTuLeF1hPbwovu1zshPm3CIL6LpE5axIx1C8+MHoWe2aFK3bXVEGMmgK/7Q8lobbj5V24k3fitkhU2iDRSASjki5d6I9daI+p+VV1DOxVWiZLoQ2aX4zCSgWgzEz/DHWyOK1hPAfYAb4WtnVRqy+ZtrKVFnd43N+Qk8wCYKWApDdYldzXc5ifjdYJYfi5inJFb/gcGDReqs9L4rvKoqNKxaIDKCUfHlKutrvrIDHwK4BgMlclsyUZbNcnI3Q9SdEK/MIsZ5C6kp1slJfX2nGjvbFes7pIFhRVZNDGWMYadBaYoeSk9ud2Ule2cLmvPIO5B9ZFlm5/86fj7D/RMreL3M+mlhu8KRCF1B/pn8tM0xK/m8moxNDDIsEu+WW02djTQ/vUo10xiKFSCkcus5L4iGrJmrTIjcTIXIffCInlqnkWxMM/u1zyWYrje0nkIbObgk7u/Or6eNzgK4AVkqbXKjh5z1lX9ICB0hNBADP2SFstAQOu3gcTdCMxZiFA47F8kDtI29YC3j4S4tQQvUltXWa5bbZQbzBaqd+2YcUjjyCOIj4QgVYFuUjUbSMXXkPm6lhhtfR+z7N2FHjOWi5WEWMgNn75OUFNi4ESkRvl1gTpCbqn+E0km+OabzueVAvZo7TzkHPPbzIcD7y30fuaIQl07214Q3xcXU8PEEOmB0tdZY3NSEv7Bvr0oDym0cLMzRDmIsmV/7kBjX17m9SzXhXVXmkEQjJAuYf/emlPYnZ4ouTcsv7zJyhz/nNTQlO4lbHA5dyECsZ9+TKre6+ppN31LSX0pcPlyifLP2+ffqcaPDHvEsD9DqXu0l/00yHnrUh+ClVllossMdmI2tQatuyPQCviDiXk0+OfN1ZhHlDJcl2+4nkLosXlSjsK8eSXBoQzZmZ4ij+kMyon4s3hRYLh0jKpsXK4yKR1KA62pbA7QXpIAaWzqysxbPcnEJq1D0c9DaQu99x9drCrurUsX9QI2w8sIt0VcpqZgg/9vm0NhUTVau8sLHXdHalp+zo73ZX908w8UqI7im2NSa9bvXm37y2S5/kYggqXKUqNYkvl28LItHIhc6C2Pix12I3qx+MCiQDm8rnPK6F9w6cUjNQW0NmwLp87ahGfjwdrPbIrDLR4VA961uRS2j+D4VkmKUFDvXfdAz5IxwrnWPJYSW4UKTM3m8eDR+kqbTcqfF1GZW+qmTMWlLTq6pV6DPDFUBiR9nFNPC4sAnbuvULvpyfZPq5Sd0qppFaQaVxS6m/lCWkvCUrIuIjRGR2NBRIx7ie3mR2k/3iEggmlaOPyBNhTTsOSQ3okVqppUR8HeebOsFrTOzUlZSBftk5cUPp2VEIk5xPycNj6cDm4HgBAVew2ZsNzjBeoBuYwk5Q9De39BgKism63opfkxZrsAmWj5kUZRokU93vE2/23iyvlf+SWHGf2nFltjigPs96x3f+YdioSF4htAQF+iBH9K5CrEk3/dzSXaiwPWx0+pO8og7IpZ59yFWwPKhslMzro9hKOlaA5rbp7esH2KgW6ttwV1ulma+Ys3iMWiCuENmZXO51a3zg3i3rbgkMgluvQt4WQ+TEKZy17YK4FBb1BsbWnnS/MxueZinrKmHi48MYH+k3OJNIysHYoJCqvu2mr+CEI/jt3tNGXdyBL7m+xo/D8vngp5WlvtdC8aLma0urIxfPQeZbJDrPxgjsLlg5MlzJ0Xqn0NaQRgqQ39waV2NJ7LDQytEQFjRTfTMj9bnEh+lcewrDiKgcrwNWw3Gn45XkjYxC5KF9OPyMX7hcVZzRjMMJIzcOdoMsbKjVz8jsu1JqNLlOpf6wqotEBiHnxjAJZxXEGXvqY6LsAGrHUfIG4S8SYggcfghAypJ4yLLyQN3m/xnPhcA4U6YBXCpe2f8RaGMeHxHHkpVUMv7fdUkALDwmrSdwNoJlF3gLFuGLZrvLflzF+lPsqkAxdc5+Ke2R2iLn/MfyQcAAC76uXGf4FHz/xscJkf3UXS1lPZZ0ojcbuwvCP+fpYBwEYRgBMVwgqRog9FktlhtdofT5QYAQWAIFAZHIFFoDBaHJxBJZAqVRmcwWWwOl8cXCEViiVQmVyhVao1WpzcYTWaL1WZ3OF1uj9fnD4AQjKAYTpAUzbAcL4iSrKiabpiW7bjcHq/PD5BModLoDCaLraCopKyiqqauoanF4fL42jq6elZBCEZQjMcXCEViiVQmxwmSohmWUyhVao1WpzcYTWaL1WZ3OF1uj9fnJ5RxIZV2XM83FrB1hOEEhUrS6Awmi83hGqZlO67nB2EE4iTN8qKs6qbteogwoYwLqfQwTvOybvtxXjcAQjCCYjhBUjTDcrwgSrKiarphWrbjen4QRnGSZnlRVnXTdv0wTvOybvtxXvfzfn8AESaUcSGVNtb5EFMuS10LAAsAJgAAA4Cw2b4dIP4cp4CCwqLiEniEch43VgBfGpx7lcAzP2VeKp3xs4PHlYTLwaHfW9xDMgEQqwEzHsDqzRie2E34z+LTu48QJkQgNcQ1hhYkCSScEH6vaJyTQzV3KogVZUoIR2mhbprIalYH609H59suhuKd+TJN7mnNJMFd9de9QLlAqjmu0bpmnkgcJhI54RZHmokrSAILiTfqJhe4OIlcYUTblW3XmT5Jq+j+so6W8OpkXg40Lrcaq7BFRyYpEEJOKqeIwViC78RFgVkCGP0BgYKZBqNorDoed4Q44gdLl8tYy7Q7qKY3O+znlJUWzrOMGHAi59OS0zy7pZwLVN9c1+h5PvL0mkVMkqkqVeNIIDHbSglw8iBAA3OC3UKdTWUaW3dhrg2IQw6E+qDVnTIg8sX3+h40l752tRpEMsotQ65zzEm3LY7rah/jOFYVMRMAJDAgM11CN88chDqqQWLcl2JFjJS9DwmXamyw88GlJREgFi6K4KA64jifhbVzaJSNjVcJY8iXOruUKVJGZfVOz9IdnO8w378eiMIGoApHV6Sqqnf1VJPWKxOpw5ocHVdAvhvhzuazTFhOj3dJDedAv0shS8RAIViUWT2uQ91FptzBaLC3isiI6MuSYtCz7YdsIMIMFtwaJSHdvNjoen0BbqRUXV1nhbvOZjD5u93l02m1YkQ/xYA+91rA7szC8AtBgUPnBzf0Yy4tXGZjAejzmmGl0KnpDTRx933+QFcxL9qkZQONQ8wlKOmCXrbLac+vZ45DsxT2VFHSMD5BeY3hedPOB3/7FG7gape/5IsZcXaYMG46u0B+qB+nO+U+h1iN/341b2rRoNDmEFdaXlZv0/P7IZEadFneKwOocW5mh84/nHCDDwcid40z6CwO5Zols05e9QUYzbrjtEt5V5brrZdplJdodxIoyBVTc8nte3Xjshx8w9qoVIa7lWeN4VBAYfqA69fJEwyoqooqe9yP0Tpr6WWWdu33WzxNqrN8MV6srWWUJDR0PLUHkHUbDMPY+bG3IJh3O6PAU/CBd1eSuf1j37uLenONOU2RuaGdI4awbbHl/5u8xyiRa2E2qVVRhMSd5hhrpS9jzrHnMW+nnx9NH3osV6/7suNPJO8XRo9s02Xjm5J4tRSawDOcn0W4LXzBIfpS1i/Hdq1XHjgp482e/Pgx4oziw7LY9iYPalM+uNIf/WYUPjDGqzPHvuvD7uPe8FTZsxzASxlB095+EKP5U4f/GTSzJ62ZdwfdIFnFoDnySk+Efs+uO44npkGxiHP7i4o/Jp7Kr594bci30rwzpC5eWgUfx0q9ymWp1yOgQHQA5RJde2jFvn7bV0pW9OLluBCJ5WLFhyxReM+2i21m/x8a+JXff70UUjhWIiO2lg5xFUAKJW72Kr0wtOCk+H/cE3Zg2UF1+0c6GcpVVSUqWdbHR9otkXFQRApDIK5ME5aWhWrDAIWuEz18q1iCJc3DoAZJ1RguigltXR+4rBaASepKD75b5S5RFdugKHXQ968/yD44aUJkajIfImz6BwfkL364ojYrWL9Xp6Ub4z5EQAluTTeCMlo07wUSxr70QblidYwWtFipeEUT62tWXsbu3hZM2aDt8OnhN1j11ck4SbMa2lIzJlJV7sKy0kN1qQOKYptIt3Tkyc+/wrHdPoGUQb6a94hq9oRgN/vZWOMTjalIzC1nB7PyzSRpNnGxT+LeUHqjQTZKhuNRGCZuAB8fJ6AFg9iECHEOZod+haZz4H5YheVZaDp2q8xJjHXL1FmZniwBKM5CUV2/RHbBJq4XzoNy/mzGt+WyuVPM08vpOlEqrPEixbQ9J6mWTMJb5QQRwnAX3jQs1wK5+Qj7pOsl2bRRTdUGqMsDZggYMG4VATkpcOdKcXf4PsXKXBiXsK9YCcXqQ6s0Hol29T4vjkO757IGyFSa54pE3yjDqAZcMZVtiwWEf3kwQTNkhFYRjhmM2F4/+0CBtllc1mXIwEC2V9BKmSiXotIpH47SSTJO3rhO0ZWYdOKlTWddmS6RLLX7T2f7+s/n+8XxtFsgL4DvrIbG/spMArmhl/5QnHCGHc5nt2Y/nVjs1jSTb4GumawnsjQc7k3sM9arri6CMHUCBpPgmaNcjGVuHF6VsYBwgut9XpUyBh4WODBwLJQ1mVekaxEwRYY+WhhY/wydXu1XUEYnrKnHQ/sbO/pnIqG4QkgJH/STPMuKzYKDsn5V9kbTjkN/dH50ZDftKWJuCWivgSuQl8Hp6EP5BVKcIkk+Nz9almvB4YTfMdjndDW60yuzd2ovWy1w+/oAeM8SlVK52aGe2B/SmpmtlfWwTgwGZrYesokyWS1j8hSkqGFJi7oNmKZPjmN05gfWLAXsoHV1Fw6Op7CCpmnU0+k68ZQ7YXOon1OWZfq5XOv3i4ndLonpEHd5P13U6pIY2e/OX4/nm1y6lVrh6mmDO625+KZgSoW7hMHfzaIWcBKHJyqC09O5+STP3JAyAu3U1AVCLtHhc51gIJeo2lJo2Aaaxo1MtXGiyc0ZaNCrm2j9r0xNFXyxzGBzhvR4mipqNMFMZNEgkTWz4EzmrWR3f5VgktqyYGmaRKXroDAMpNcuyF2/eunZt2+f23ZH0IpX0FFj2XkVgg3R/+q79XIAg4nWO1im3gNpC+RUStg2RewOHWiePrJllTWiniZW2QHdD5xYxV8VrBnBikP04kgWFBT3/pWHPF0bme68ZwSFFMjx8LhlwFJzxUt0hzVPmZ8VmnawAfPp1r34IdMF+qB6J6fqXKsQdTON4cK2lXGarTtJVEaGZs1fa390HR9Zhqc4Is2BqgUBt3Q0mblOROpcv8nerQ/8SXcs6WeTrpmmIivBDX6K6XsDq1emoYSb2SZRpetOCH9Ig8mjO7ULx8vt/JVDW+v9q1IYefKxspvEp6qcU1EUcFFVHzQN8NL6tRAlxr7GJhz+SLzT6F0/WJs6rebPBF4+jPZCdpaBRudzFIokNIM7/3Iitr2uOYkWTmmrzMTQrBvjBI7CNzwQexQ66CZBlAQvdPOc/HN6wFVVjRbNlXbSunjZtmWZAnmfwO5sBwlXNM2yYiVzio7jZENRSBB4SvSymGjXaHwCCGFpmEMHeZyvbOJwTdMU6mN+M7cq1plhUT1c8+jkXrSe3Bd0qef+pXtYUcfpSyOJUqcrXyyFB63E6FJIacyGPRwIm611Bk5SJxifEX1NpotSFzgJqEPB7xLYqUwI6wpWlGWCukMRWK53CKNKVfmksCi8w0Dey0JKeKEt72VxJc8V3TgqSKLpzc3ewMXmCBYqhmFIcDHY0BEyVavF9ujObJAUMMM5zck8+whmk7rgX9y+jWDIdd18T5uJOj4byoZbmUZfbxhSyrIq1McNDtuyjrBI7USz9vvgqskDIjejI1AaoHVCv0f1zLFGN8JDhG/lYfD8Pou2Shyv4iX+vyb1X2O6vIkMRzlHHLhHNwQd5WeySzHdJKyL5RZctzTG3ZjCNQsauKxarmkpOXMyhS4T4/mwUz5e+TRzIR07m99F4xQHLtI8QQPUR7ozea1lUgxHsojbTVCHe9BVHARqlBwxxmE9kKGkF6EtwBJAnhP1SB7C5s3EgSnhKgRaUNE8qjK9axaloWEchfmqubeuC2zVKEX5ZI2pSlVNGP7QRGSyNXYhuizLhBeYTxEw7BK/w0HYbh0r48lPktmmys/YHUhKnFWqa9K02z873YFDgR31UtvTdhx7J6PAodfe82eodTSVECvNK32aElK9BxS42jOFuKAoQ12uHEN3s6Lobs5i8KSqZt3aHPR/morA7+wXiId1YRTclx8b2V6/K/9aIWHJPU7AiQf5cE4nB5Dhzo2P9FxFAx68ZdVnMQKCUxWBwXg/mIbsqehkqC4nmiOCThLqgUmpUiiUafYJvOH1AxNDsy+M7aIvH7Hfu0g0gwUDNEILnlk5Vn3Bwih7GAMVTYKGWq0xsWgjms6AWgoEGfIi6AMk7z2fwthu+MSO1i+oRaDd31jvhdUYPaVpFgRHVW2fTUWZADrgklR82ldVNQuI2mCUfbRsqZP6IpPUXL1FiJ26qHsdPWr7nL42Gote8pWVyckLNHg1ADbkedsODar9znynTUpLmXd67Dx4fvYTL/i8DPMSxK3cQPdEChHc3/LGe163bXFuc7MXMc+4bgbsC7RerILHHccZBy0/mB4+VfAL1PurHbrxbN4bJjbWu+E1fytWCqOgVK5O3BstRr3AcB0mOp0bc0eXk+4Yney0W/MLepDUsg8zASa3XJQ2qdbCU4RVrcI5TQZvmUSKQXGN8b1JwrLCK41A52Ba5jM3NfwAm2v5tG8OKhsh8xRHcW/hYXRcY7UCR8QIY1UoN/BBpOE3GbYzNMVFijLxcEIBNnhkGiYdYia27Bo8Y/i4AUuwD3KVKsFjsRw1YoGzKouXNA3ImQzIc5yEFXASwoKvbiifuAHe+/mXVzuw7xIjoJpSqCSaJ9nxOlbm9a8jYmjH9q2hr+qRGoY1PAhhJEPJZPCBht5ry+Ay/gWGCvQ6lC3hPA0yvIm06BEWOcRNhEcg6yVJMCi7AgJSD0qAQpclocpu0k0d1KYJmUTMdquYuEZOkF/h8l9j7rM/uyucBGZIkzKxRXMEcEcsTCiJB91wvhtZlxDXcS3CiaYRy+mhLbtabhqdRNwwougnRE7iAqRKE94npIQUP9DBGenPzUgXSY+EYNCt+buemROOgGKOQ3+zMhyY6IDdWQ06KH7VrzRV7ZnEgYX/zEc5+hMtkAb6AwXPf2TOura+SBJKfKdjicCsDebIqUMOHUeGaTaJYbe//7g/ampGYF7YgLdARUtI4UE+LUif5CSD4MjQLXNcgMDOUb28EaPo9ux9uI1HJ7k7PEYJig9I4tXnGBUcCqQFWBGF0p5A8fMyp62bvKjoddCltieJ3V2PxJpz89ghi2YPv2oomI6PMU6tDYFQOHDx9FipEPaiRRaXXTdChrbf12XbdkLACyrZq/J1M4rfgUMEe5dlaWHVNPmoqOtySDEMjtFPHqxVmpkOoYZVT1TMnOL5c2E4YxLd8wOMogQAft5rOkZPiWMGUILLWodc5TgAIgjtvCUw1RAl+PxSdujnKmT1GnPYquelPZOzG7+xpnyp49J0/Gy5WwYUe6lDhsjJokhzwlGbKRbTaB59Px4yklg0Pp6gGsdlzmgtMqcwDqiX1AsZL802iwEt5QbhOAIyOklo75OnvESC3F4F69zfNAmzi+wPs5dMt4QwGeHpUx5RtlR6lptFNOR+j4sn/bGVKG1AlWqAmNvrXFKYNWZuluBgBElUfogBFEoG71gNO2SeHSIMuv8loNAgPafgzOxCEyPoMRJgCxvNoElDFCPcDebLmnaZHQPjxBpkUEUHI3JWb24wD/MbUBp/3qlqmuMQrHuxu6PD7EEZSAPlXIwZciekeOkcx8qzB7clJamMZMU4MDjICDb2VNMLtXksgl6ljjE7eiRog4IdxaTR3lFv75gvXGMISmKwXepR3N8qb5sNTR2pBA57+NlflwhBDflM3WMAYIbWblg91wmQCh0RF+/QNHgk5eQ4oayMlWZ6NkCYpoawu2jH5+IjL27SYUURjteb/5OCbkqrrQkDW9ZLTE4s+lr1nISZGx8tC5Z1DMi5by6DwUx379ox0rKjv/SqpuWuYEXyZskqWkZfW7+yC6Wvd+VB0X0r8u1LqVqHYPz/Fs0NFohVdZwZDfOWVnmciENjBp02Brc7w6w+DwNOEimscL8/BC14/IuyfB4yVuSd6cPldkq4Sr99yPuuteeHdJTCXOsdqBCynZ2i04tI+oauS/mCPVGWJPLOeSaKgrsBCaFIBmJ+ea7Rzb/iYJ9P0CL4/pqFVK0X3uquUPRaKNsDK1OHX/v74yrMi2l2mtcgBaWwyMDkEiYS8iS6y4dzGq7xfeDgOIeUVIpPS+Dc/0E2TtL86PTRRpIyNfRgssqL8XwXRA+Fc8LO7qAUS22v66OGD6cl75qGPSSsqT18moZKHlNPYheV4xbNaxQlwyADIepG2UYIm0DIGjpFPYEhmnrN4A7fDGVDyC0E8O4LU5o6ywo4Hm9ZiTmnKAre53GYOuo8KbPXnsxijrmQUYD3VA7S4Lx81DW8pKWpx9PpGxdVQTQGT3ivvySkBCpmk7uxJjgTxxlwaykWIWGQWhZQWqTp31eNoaJ1RaTLzZseITCaYatPDNXHF3YPDDVGbVm0eUqxHYc/+v9PQvfFzifp5QVFsVwihVqlfnP1Cs0zildwpHsPkT1UYCa5/BL9pWp0gR0jrqpruKKU4Soo9NJsKMtputNj3CNhmypFX92dxjMCc+yGW/N7iz48cHBzdc09BmQOtqEyITaPl3n8ZMivuj+BbjNgg2+Bb5wID8mlUBHmUNZ01n6yS1fyFsvkw3biSeNsEk3cSjqKn49O/XlZtpTj4VyM6iTnfJdRk8J+yxo68yuVYG9uNjqarAfo5AXXHYKksQ4jc067vdX1K3SAorq6w82S9ik53ZqgRg4MSvwKgzVdhInDIWYhwokxt8nZpkkHt9zrjgoGoYKcNfNt0/WFJPrB7fDLiiTuqyHKpcevz1R/kJo2Ce5gIo2ay2GfORAzxU+RvfylRvPMdQcB+5IYr7xhyFvkZCY+aha6PWBGF7xORawQskzFQyAF5uklEs9V0biguGyIuaCOX7rGJ9mLzEMlbkRjsBSLBHg1SiSCO58nEtQLA3/2iA0B+g2O/WCYZlaND+nZWFMb/6mH4Eyza36D2/xG+4TsjqTaTsYHazhqsdZSHp087cPKPodAuduVlyv5pYJPjET+X4BiJWKQwEgvdoTKaeTtrpfT/KsLttHs+ITMr/y5qqrypOsG5L6XFEiI4G+6mFLQ/TC/AUTHerJxhmhBXOfThsIkrLbgBk51Io+LcWeF4yhKgEiimwRNMi1GY3SdRzg9iSMSRQSGxQFYIklghwiT/ETpQr2q2l2bcJ0qLStYlvvmfK+EF9dMUw0PDLNOyZKGHv9Uy6qZENKXLEsgkwb6Hhfgoj7gmDCheWpBCEGiE1x0BS0Oc10fp4Gzuu44uPhCHc80eUIyDNd93UKEf3t5FWZDqT8DGfXo7qu4w2CPoa8ASReSOQri+wq+UCedYNHGXyLRrksWeLvbSmlV5mVnh8f4nmT5tEZoOrgY06pxiKgKt5n7OVImEv0WJ53UwIlm27QKqn8bwr8f2gtOG5Xgm4Nug7nHdc+7PzuUJRaMjYoKhdc4oisoFKM+6HdqQa8dxVqmWTGHaIBz4H99ijsxGcJsdiXXsiYHl8W0cTPVpk1siKoej/IFssfjKNIvDOMIyPiT9NPHYz6LO9Ra7VwYXYf87vjUlJrZ0g5LsIp2Sl83p1DUGkAxWsDoCZf2HaAkZsvGx7unIw11ZSYeEPVFkjkWpmelBLe8iUEhkpVN9r/FQew6PnNjveyGwssPalpi4agpJMr0j+ZboqhbFtwumzieUl47+Cb6iYd82pDQJrjN58D9Z/abljYaVUbLVPukFS4W/ILqxRe0p6W8Fx1bK6GFMTVpO45ZvcLESDgZkZGzo5AgZ5KiRVqFOPVLn9iLuhvjL94Q0/qrNVyhz9Tzp2D87mu5lntvxnDYIzs5FMtYhgxdBggIRMzgnsaNZs8iTmZ7Enm65QCEVWqqZHWAwSDsNwbulVKZiOK4Z3rOhoUyIZ12NbibFH2y9Sq5WSzvW2P0s9ZYD6MT8muxmUDdwd3svCYF60mCGED6lGEwIXKSgZ0i7MAyUy1E2e/+4X9h0cn4jQ2//O/fhd+GnvxWvInbItJz6o4YGS/yPEbJHfsWJUUZMESL1RJXyUnrUi4TGt7KrLoIy9rFLa5ulHB66ekidUsOLBcvRFcKVWIXenUhidwKQ3eMunqYqNnFanDzjrBRMwI3Ggz3YaT+FPh+MboaQywDAisPWPhosR7asrYLIMKy4OORbcQqqJ6MEdb+J/KIUZgX1/LSDr7jFglZ8U9jMHfmVG7rNnCm+J9AU+1AbJQdhAAWB8BIvIjJx2Q9czy4coSrQ/rF0u5+anl1MvKnnbm09y0kw1Ey9LqXy9lnKgQ+gIYrX9mfvy30enpBWYIX/Kx3vUV7/NrBlfHOeWGg8y/4Gw4vSsu0JtagheDhHDFzLQXCBiUXVsVwt6upElLkAuk51kLqYCz+i9Xs86YSpyId/MQLWPQBDTjPIB4T33Kh3XcdL/Mh9x0n7RC5lg/zkrPy5oC/pD5Je2iBvm+fyPeSJ6EF7nKfpqsFWrszMG3pkMXpljt/KyHgpQ3AdjQUm7b4K4Y1HkBIq9uEP0dhueUr5aZh0VT/s4PazaPObGSHQB9tWZcbzZyDddxje0U7GlZp5387DbCQCm23IT+4zvmdWA5iGSru5JsEAifonLFa3hbX8cH84Aut7Pd2tkA+gDnEivXtP7k7MmUZ/s1TcjOA71j+QfSC6Mv/NrdqyT3lIk4V/O74rhTWo4Qn4p5tew74+jeiiluI1SepPMGk+TEUVcdQHEeb42Zus1B6UAXlh83BRQbeX5iLehQnqJ6onzyj5j/bvq/WIHJUxkq44COsHyufPxuovsl7qQyQXLBESZIAG/wDnxWcvABWXJbylWZKGpsuqLz+QnjEBbRvB9HSN+VbU/dR5jbvClcFqmPA4rjgRdN3lfYNPb/Kt8I3i0n7jB3FPHuJHNy0oa2qxFknzFi2Xcyj6lqO9c5dl6ZouHskG3n0BzwHszubkajhqhUgWCzXGCmfl1csN/+cP8UcuxktBqFsiJnIk9mmC9ctNrsdzcTD2O3NRYxAqHyCRwIuRO7ERzyV6m1kt7YBFfaRpRKFEXM0vZTNy8iHtrjFQZz4qqFhZ1EfGA9ERimG41rx2I6KVqrKcd79ktxcWuFqzadXtkiX2zGzui71qk0tb2IkLtzutFdNLSofqGGiR078UbDoHPgEBI8CowDjIaKk6MlUOl/9WV7ddtrAVCts+TyurBlN1JHUt4jWftGlrTuu5Qg518SaFVrNH9rCemTb26YHC4b7nzs8LC6Z3lUPqrQZF28BhOtJOUPhl2Cyi6++MbsBWM0T975Egt/rAYQlrvTwE2cmXEauvDY6/rYfbFA2gzyTWviKecjZpWP6JD29cuKIfrp83KLCyXhG7FfBYM6K9LY+Okt+oxbcD1515k2nwquesQyLpYKPMw2FCBb92NuEl8Rju1SYfinX8l03Yht8iJhKB3p4DAgNaFnZVAcNQErVUNLelOH/r8hYqQPmi36p9yknagemIl72QJI/KfCiLvfj0ssX4X7wz2GU9MHyhY3w0OKFdE/X94FKbFnvcC+cC0xzWL+7JOFT8+oWsLj9UO5Wyzss5y+br8aF4NKqcashHB19i4SrgU9qOPxca86v0PlXPB/O4d6VcAqnYwSFHH81pgza0V+HQZLj5pRoYgqizwafoiuf3w5RtyQ6d5TOFHeO4Dn7DMhiYzmpQ1ejqFG+V2KhOMZUnSDMCm8y12f4h/BG4on91MAiVq4Av7Kkn7TNd8cuGgWMYbXlC3RI8X4dmvXNmOyv3ODIlCxd6DgX4P3zaxjVjxXletHxu/KePjvEiAcmFHU86vyS4s0dng97HctiqOXDUt+shO2xy5bTPT++GvQsczByBRQQ7NhaZYCItYSw78OjO4DV+J546A1dCKFyHM+2ARZTje+6COsvPhH8ks9JQd4jJHA7PI7ps53ypCCfO11AZqX9G9/MJp89lTDmhRSnhJV9bqpjAKtUraKth0sgwTvncWBx7CinRpD2aStdmol3cp+jWGLql7vV1phxnzMUWHayG/PDAxETG1VitsXazREOE7i9WAXVP5uhz8UK8lzW8dE+eVEgcc5HKbyiEvGMC2Vy+S+/ukzl+Ra+xG937+IbSrGQL/dW8q38SxSOfJj+yKUgZDMh4IIjZZ2R5VUoHPCsjR/uFcWSw3qBlIA/StOYgozxMI+9d8XFK6eN2427z026Faw3zQsUWIrNxI4vS301hG1a3XL+hNMXz2zBnmrx4ipqK/qGcb7GFMq8eeURXFJ2I8vXHTcqx3Rl7bH6is7i0qIRcwo6vICrrSfCAfxdgXPiHXjHQTB/ym7bdmffYxGs8W8TDhvXe3Ef7Mvq1SM5eWaTaAOoiDptZ8M647YjGYCFaP/v1FPLs95ONNv+SoZLnUILoQ3i/iPbtUS5auXyjA2oYtPAcJdX1vaUYQbqy72TF0yvrDGgjLYsy8rrO/Yn+YML7WmBeRCh6weYezpYNISAhXOa8TWzRmnx67wWunhj+D6UulZA9eXAfOA4z1gfLnXcZzd4MLnjG/nVc5Ue7l2BZYvS9s/nOz9tzf+k3fpZRy49RXJ37ruuwm1ifP5ax7dCuGpet2T9vqONPGuaAZ5hbqfkzXGKv9ni07rcKNIGrWZlQ4NnyG7nbZTvTVP/nu+OpT657sV/LrNNXey17RneK4ni/pm68lj7j0aAr70y0pFPZL8yW6u1PBuLk770wqwccczEoS2AQtn69HDSOLEQYfDYXKjuEJZ3Bevb8LTyeCS9TOxEY7fRnCLKH40FhTR1Y9vJxd6v0lPXLFTCvyEWnv5UsRP9juTx9kKss3I5+fIzb3bA8DA0STbRDd3P1EQzS1rSGULBw+9LquXPPwJ95H/SZh15Ijv/DYr4SzhsY9xdWsGhdyy/tKT1e1LmdU44GtJ+4VeP+CTFq+t08hLrj0dIuRezI/8xXijIgUM+yiXmbcsV26DMvzl6Wo9bjpdYs66P+9HL1nbxQC3Ie151rLpBRaiCpvK1/yWcfpbFee7K8rpwrbW0/18VIgK+0v9vOCPz7rc9Bi3NPdj//nv1Wl/H5Iyf0x2sRQNNJiY/StIACEPJ+ehwbYupg/kb+BFEYJkdMR3pNtUaWc+osaPiB3rQqHLagzdAP8yXDxxCjoHdexzaOwc8o1ZsOXP1RK9NYeS6dRaAw7sqFYfOBwFnlt+udXEyQ0O8yI3lnlRaloRKQgm1mB8aPhbVREMajdbV1zW9NJTM5hk+WNGr/t9iT0dx1NHwGxsewpxNV/PzY6gB/qG+1bb6B7mGHA+SBxnOoTvTnPlACyz7WQ+eGR2MHATTx32Tm1c3HUntNbE1jc3WASeJeWDhluazP43jr/91XfgMTkWNgh07Pam1NT0RPjQ3Y65xXJYuOBqfCxj54RSzoKAopq0taEzyqfLxDZnvroLuuAtFUXsj9w495jycdnObflAR+zVyRHKhWNfA0Bj3413CvYgYR6SWAycQNkEk3U149zPaoMr0W5iksQqCNy4R6MISfMJtzE4GOxOmJhMSJqcIZOq6bwD4gX5vtcyBcnLUsNpgL+5KZvaqgCuQ1YOb5crEn87z7xlLWKn0m1RuU0G2Ono5KdDWdnJ9WP6nT/l6gtW4X+D8vBbEtblnZnKg169fvV5xvNhdxWrNKivAj/W6tA7iyNhPP2LN0OSoIFcBsVvbziLgrfzWVg7bxMTUFNxRGAgInEL+VhhxtoRyI/ixNH64Pz5+iNP9A3EPwnAcRWT2RzovjV+Hr6g8JIA9POCKxzAczB0cNGfBQANbGfNgYCg+zqrqFKxUyoFePCfMOE4Km66LS3nxgsORZmBgjMEOTwvCwwLwIwN4/IZhfAsbsWAvflSYlTLluPKojPIR+a/evnoDNHND+ybwTKc2/sddhlNDQEMgw/FAIJz20IpAM+6T5tNv9dTdz2UJ2YdzDq/i3mfvuZ9CUL6nNAjTz0qN0gul9rGCAgtkDza7nN+G69MrFero6ulq6+lplQr6tJsjeC3NFES3P6KH3NIib4o8C1hYEIY6o2dZktwYpR2XmJ2NRa7wX+XGIGGYTAyJYQmJkIwA04DT1v62YUNgJZ/H51d2z+ObA4/ulunoQNA2Mh2hRWcAJO+OFoJBRwIG+H+3R+mV+no8DYmkJbz+d2MpWqtdy0uuqODyeNyKymSe90RXauVtY7HGx9bjtjQ2bolePzoOrmJrrJIzkzOaEuy8ERBk0bfDWxAUz7YsyymDLPDBQmk8OZ6UpqWXR6cP61Z0Zr/e8syczNzu5hsdZNYiQdjppSdDACJYrq6A2D8AKw5PLk1ElZBxEgZzHXC6ksGvnJ7c3Jwxak9OXq6ih3F1/md+Ph6v3GRi9H+MnEQEJl8t3blcQoj5bpRSZtwqS5OndYDGPCmeiqfIZKBQpdoCAcR+AF/UfYglEGiH3Lkdjrl9J4QFs0A5RgSve/16HSwiMljM8hke8ebEBJlkE7DaQsjBsEVi1pOHfUD5FGxPa2ajbYDnO07AbDZ8wiUYue98gnUK3lqcCP98BoKePxtTafPYs+cgOCGSTImIoJAjI8hCWyMkY5cXQyBKSpixe0+YGEpmZw4tLbV6sDhLLHniZc8mhpEuBUSY3Th92rwFB0XB5CQK2tzUNMkgRyVXkvawk4xQmrmpmVm+m21HpkyW2dHBsIUO+jtKj6Cv554fZTg6Hr2+ccuWxvW48TEWazNvVY75WtraWvrVq7RlrXzx9PwSBi2lQy0cfPkCpGu9kMqVdBqd3tb2/l14cRIzKak4zEpbzrO0Ci1xEOi6ffeotZXBoDMqC6mJ4P0+T/jQIdhzXIN79wQ7bs3dZLObm2Kj2dCyDjB/qzkpPWGdoiivcK1e9j/H6MfIhvQldC765pmu5Xlh76TDzxV15jWnsQwfKLBjTnlYechb6aZ07VW+UYY9XYyAT6e/Tt8KR3x5/AWs+VBQUrC62CzABN/yaNU3wmPCN1V0uQjQU+EIfF58XoVDVFTeWJT8RUvLK1mUH43oYWWdFpoUyhR4RstjX8CCjqoqAubUaQlOpjM2RhTSXWlurRTYyNiw/rqm+UVWlC812yWe99RmGxgaGsF2hohOQcmPtsV7LkoGOn9yOeqynxout1ylVq2sDKyIqQIVhA9C3JnZmWti0dVrZKZvFtACaEAFD81Fz84anydNR8Z1lmRoWM1NSnCfzSPcT+y3I2/fcciXj33MVwOd5HCWy/WJLG+9VboUbkpjHb359m3OW7uLtHH573FvDUpJVy5/fFdAYXkxM90pwLlOz4HgOGrcAamr+9e7d7MjLQflD2AmlRSXsXellAkNwOb09DQEOUggjo0gb1dg9cHwq9OnIVDBTk7rmRYUbu+hZkijTEyKXrP2PJN58ICMRmN+0Akl3/9b5JSbi+NyqSf2hyPXJDm96wsPOFbkRIcpJ06ENn3jZYr1e3L1RwVcvXD7h22phV6s/0e9CxfV2mwgV4dRa28v1OzVzFot8GDb6aWRFuDBzbkrYDGiax5dRLdbHNlp5aOen5sDr6xyHj4IaxZnpmQ262vNMxgHD1B7Bu2DdkPdTZtTnKjCZi7X0iqx10EGPbV5ExFth5Pz4GFYo1iWIssSBfx5nwtlSA+pDknTOdDz52ufvzC0Ag/SD6uO5BrBpZ2+MhnEeaWPDEGyTF8YPFDUGY7tQpwPHFLUL7LuhgdUDy6HGZkP4YcGO3+pJdB24eu//6uXgsMPXr1EoiYz8xx8LrNSBksvKIOvwG/XoN+0OQf29ICzN28C33YZKRv28IRzHhAGUN92H75/4waHK5GkpKzhtWsAymPmb0CYXOltgcGqIoEnOixAXLIaZVBy0V0oUjIRJmrfg3OVHONggYgIci/tTdmcTda6R8xJ7nNQLmPOkr/4S3u9AvzbHy9mlVrbsNEWmg89eHD/QUE+ZCaIIyaWJo3jMFjTkONQTRQkHpwh1JYr4rgKFCu4z14zYIUhzHjpUgAMAhUB1uaRGy8BYYpv62PyORm1+fmqiA0wSBUbIlQuI82vIGb9N/BpiDm4zq86zr295/GrX6QbtR9ctmxzu9+H3WojggxTnA4Nffh+ikwE8wUK9JTq7R3sFgy51ZttVVps2QKwZ9xsYCTqkZCcjt+Z6N4NacJ3lgkNW8APF+9KLpqHunpw6uNZRqCkkELxCKqPR1D8KkRHn7Hs+zDYubyzKKCG/CE/wN/JSafm7Md/TexDZpLQJBTX1dRuMB+8e28riRjTJZfJ5V2xXp6OBrX+S5Yio5FLlwSA//amySaWTM8g3Nd61P/oKrenDFUzzQ6LtadcvjRZaWGmQDIZTKalwmTbzh3ndM9zdbUu8XGx+PL7f3as3dl6dVaSX6DMZp0/m5rG7Lh9a13cxY7l3lKpuatL8MqVC3N/PQXl/U6kt7XEntZsiSKCUkuF89oHdmfyqx7a2k6W1C99Uh1tp8sg/k2pZxCZ0RAmZhJKkZMTSMTJQ1iOWBU5MYJs/kyYHCklpgp79ZxSSCMnR0ojk+l1MyUQlJ2NZKBtffD3Ph/Con4HboyOjqlMlgtevXr9GnRy+eOFhZdsNtTXJ3vsWwMCxoUPHwSGU0W/XtdXVXph3ry5+Na/6VJfXwz0Mf293erjRyZx//6A1AP7E5KUZ7X9/0w0KLqv5ZL4JdvM09PLobHpEOefpjJb1Ho5/2TPetn6uzQ3qZ+JZuK9Uh3bxQvr4dJ0r0eamh3Qtl4z1gYFrl9qqeTyqOFxHQGtpiYgGzhgDKfd/BGKjc1CEnADAa3mD5TJAuGicOU0ZeHPLVgxJp1GR1GYcA8MBv0OUQcPOk29Rudu8B1OG1fg8HB0laNVhoTAl3a3ivL7Ix0Iz1qULYYTvjxTw5BzCQuyBc9F9R8PwE9lDoVMJeWkRpNwJKExKoMbzY3JU4sZYoZNOWQYy+RLHs1L0ODCj8VFOm3nziQmndG7+nJvDsMP60PumzYuPh06Lt6xNB/8w0eWrB3sEB8ferq4cZP7IcPSQsOivKICNhv2Iteu/fZy74YklZgpYbS3cVsJU5W0YeM//7Su1eqNLT6YIvSJe3wGhry9h/t9vPuH7cFDw15Yb4EyGSQF2fZqrW29caIbC3mc9r78tnYtstcXsD6cu4het2610MQ4kBxI8UshWwRII5gRSdlMWlagPLDMzAwOkgfJKExbViSZpIGrV9s1op2c0WhnJ7SHEB7hTnHCki6kBFACMdqWpfInT/IuXNxtVLUyuqrKznuJFwNBcQj09ARIJpKBAZuM7B2P7ckgYwyYCC6S55Y+lfZfk5vEIpmGUCrRlaiK7GSsOIJKIkKAB7umziljJgOGzUxS1Jxoxx3c6wnJ1WeSMRl7jjnaAzU9/0BkuhEKZZR3cH3ajaig7YAYahq3tVUfYaU7YlYTR/VXY9pCQsNhqdSeLzohtHFy3K7StlxZenV8XN1FX7nD1mZbNSvoa1zc16SgwrGajq94VmDv1812ATHnEotZQXHfwMv0OKOxFOWQWddGYkEhYfe6R/1QwkEvMlY4THQlujEKC0gbun7t8LIus71dAqpxcNKTJHQ883jOtsUQC/MQdGwcnUPjxCWhfS3QVK8RiVJENSnBDIod8jQXM56cxkZgm1pb3VFLl685Z2TMcik2QS4bU12i2FEseU2KSCSqAaseuQmFbuKlFHc3gdByjueIelSgSmVVMfPWLTvK1Bvbucosca2mX/hr/3jzPjVmG8Se3FR82p57vLvlZMfxZTs77eMsNqhJu/GljV2OnQ1oXwobk4SBT8Afx0YAf+kHH8fheEgr4M6B3DHYI82Gt39tAbOYkhQhRUQ9cOr9T7KSRqfS8rA3F8LQlqUhzPK2CvLPRXs7jzwqjUZXJpj/ikmMJnBoEE0mAF/0uNy2tq1bL19Zv27bNguLyevXRbduzM7NCW/cnLo5h7lzeyR3vbPTjh2StLzcisozZ4Cmmtnn0VUUrU7oYjKUg7QdugTKQfm0YgOosFpMEpNR+Yb6cdW3XtNisM17aMA75uJS74Ehr3BHSw5hPQqhpdclk8tlXUYGhoabWSQMK/aAnWDPUDC47RK7CpeKk+SkKw1OgktdFQvH6moDrx65rptySvSWRVZMYJxxjmmsf+zOy3sqK6mnqYrKY5mfNmDtnmOVCipvAMsxsUk6EUGedns065hvex1NQVGTe7JzcrJ7ehg26BGgKHHr67YFjrOzbjlbpzHT0VjbrijMytIINdOIhV0I9uDMtzspPz6Jd8h7FQyDvw1yUEW/AZ9QQihJF8PxyTJBpkctOZlE1jnlRKBwnClOVC2hqNWhzfG3jb2NdYd1O5dvTXD6QQVNHjmvvEpe/Z/15I+9NZi9+2qkuvFJ9b+a7H/fiMW3+g/8799A813K7GwK8kRF/ur4/qD+4h7duLzFmGBHA4xShammyq/s3fr+qE32iTTAVJrkxhrYoDq3oVNp8PoeuyHLTG5W6lOWsX6o4lhqKrvIvMC80FulurW2KpnPT66qQtjjV1EtSCB3SDOk0vY2mVREb9MCauELJOHeX6TFAYGRGYGHBweLqKLwuLZyaDioXZre9IBY6ZwlN9OkpGaqtM+GcYFBWGfUU25l2FNmBSJdJBCKjRroN087tmRQUZ1bvdXepNBB7ihnMmn0bPsch1xT281L8pYot96UNKSQ/Il+XoQzjvm99r2EHR5O9SlgFxaDwaJCBDFEAA04gc7rUi4fNoe7SZiNLAgQTUUVlue6U9IpgnHZLwaQnzWO2Rv+gsAlRidM7mZYTv98LcVLX3VZaoNpOXXDxvk//7w6fZxqOET5iw7dfoLC4QS9gKd4VFFaaFFoalGmpMivqHVt6vai7anF7sXb/OBIkc+aipw6VTSVVnRrZEepM+D5F/y6Rip1LoTzA6XFNa0wJZ0g3XSpGZqQvuf6TlgXvqEUwMD2lkeRN2rSF4vsiiIy+VRXcklY9Kl8vipTsGRpLj5h+3YbMimJRSSVJ8USEpdQMTM9t7oodV+VNZTGSa2rY1g4A+wx//50bdjSGzXL/yhchIgmLEcnE5vQGhsTJ0eWSeiSxaKly2tu5GapPf1+3iMMfAcVRbizM6bMS8+YmObRo2Q0H5WZxnOjeV26hGZ4METVIraQXRqkTeTpmRivDA5aURf5svsQ3eAqFLm6iYSuTmweUAO5bq65FDE3FK5XkX67OlcANNM/2a5nzMc+/NFDen8GmnMzYmNPZXC7MYFfuL5cRW7uCnJX7QeNj5butb0bySvycvMUfTB+7wEtQ4OQLAqZTkbOcZVKq2A/LopnfQARTv1FVQBFjlYuBSkQIU6pumXaIO9KrK0FDx5onb+XmKzQexIQZmWB1avBnsGbm/br0OBMR/9xDltB0qNt3nKWwxn3d8z0XqDq3v87lsPxH9z2HN59lsML/PsBTRv+snp1zPWdpPcfSKQP70mkeaLOk7yc4a+rt/tdSMbeV3R2n/fvXaULTzE9uB8bVcXhjvk7ZsJ61C1bzhpWzXT0G+ew5zbv06HBYLTYPboZ8W7rvhGUY27Lsv+8mZNzJyugsgtBfx18VTkfor5/rap9I27xV3jkyxdPPr/nbcZ3Pq0HXI8QSgXpTY0Cqb2W6y02gEosXqCDjzI2dvfauUbboKIiBleZF830wDBNTWtqV6yqrQEX/uqAL3Wx2EF+sF/QQ9Mlhh2kGgJBKuVX1kjhYM3/lEBmITZElh5GQM7UNm7P7PN5M1O8VQvXJKmSNpNL1SeRiytgaRsOokDQ2OgeeM/oKLB7sLZiRi8iELB2tnItmDQuhBUK1QuaXRENM897DfR7efcPeRGDV/+wF7jdtxt+ffQoBKHmNbwbrGtQvbp3LwDUv1Lt3g00wK46Oj4ED42OQWzPBDQl8FLIMjMySlYYZ6OrgxpVrd7q2RTGnzqWRxYuqe6PdQk0txMItpFJEESj2lrpWD09fTo1QGQYpETYmDu7xPYv6yiUYZvrC2NtdG30arMP6NkUxMWWGYlkQ3hCgvVfnxCIT1rPqBau9g7mrnTCdaJCRKMJFUSSIoVCU9ggijoP054J7mtvy53ZkXuNBbKv7sqePnZ2OVR4YxmUf+Ovhj5BwY01osJrYNtwuvTZs/cEwlVMlbFRVXdPSnNUZIuop/sxgXAtvNrIsOPZcxC6Unnv3mt492749aKPgG95S4DAXHWqA1eiK1osTnyhRVNFUYURGZme22zRATFDZBOSUmmipRK5UMXVJ1GFFQWThGUyMWROYkltyBgm0Bzy6l/m5dXR72XTnl7LwkNT61NrSVPdmwcrSrfvyCuFx7O3OrVGUnuiHwyGur7cWh0t7jx89px5AbQlxgsPJWk+tbeid+1yjH2GC8e9LH2lf05f3mnz/oONzYf3NpY8Jo+b1lTqAt5GwnAkqt7aSvjwsc17bGvbAkTruWvbtYOowTeyKRQyJTvHQJ0xZ5Dp3r9tQ78iN7eTkpEJWtvY0NjoEDw0PgpBG+1GoEncO4D5TKHU2kQlQQlHGaal1VFC/ej+dMGyzMyHBV7mMkEE0lBDepJSjVWRhHwq1qTeccA9Dk1dp21Vczhcrpr05oeoq6ary2dmwpUGAA3pXadnfFZuXF4tevOGpK6jpWc1ZrstKdOGQA5DocPC0KgwMifTjqzE/BPw/nFAwOP3aBMT6LApHCuw/v3e1ubjB9t8Z6DhxmT8OBeFS24cX4YbSylt4T7OCmdGLY8W2nzQJQU6KtiSxmCs3WadHL8oyQX1CfX4iQmGDQp47FgyNyDK2ObvfrlistDZ6OambI9ZE+759GmaST+DPqGV4+B34Nu379+zBkyKC7BibEpCojAKyBvstUCr+c5DnStZAaFp9B8AZAORD9WHRguM2bzCzef87b0bRjYM77193td9yxYmLcCP7ksXkrTogqtqcjMpjWfKT+Oa9bO0ZbqyEPxqbc+udjh2GDnxtb+n/21cE3PGHdmOmuqdYNnolYlLUna163Ki4md0gcvha8p783KeOc2gPXcmid3fPdoy2tebk/fsOVoCSRRCZ4uzt2+3JsZIIImCVU32d+MkGAwGogCYOadvxh2uRdvtmRtmx99GK1tzW7L1ibfgg5rbV44N3J/NkveBJnyu0gnXTS9/OQWWsUCChwuS+tKeXaiUw9vsdpt962IpALFRym0QNuRfyVGIIE7k2qRDgAzX36tfus/15dZeN49C5lF0VlKWA8SDPsqcXnALd3t5vzTnYHhtzoFw8AIRPzkZH7yjr8y9rG97EH5ywhsczfBFOdAZpokRfFBfyypUU9/q4PiRyZ8nk8nwcfdhxAQvm0XNYCkj7ntJ5Gn3aSxpCjVFws6A+7Q/61uag+KHh+Li+wfiQ5pWZ+TXNWTcL1ndFDLnjbFDw/EBrX2ZykRrYBZvLLGMpuKo0uIkbSiWEGOI0fYpe8Mh6Nhx1SMbQlulRVw7gUsYHk7AvXsYkVYFg8b4qtSItw9j8PEAPvrEyVErS9ZV2ShQ+F67FGI0MSa1OCmJmVQsxVHxfkgsjWFwCfM0fetWTx5XuHJLFK60PlKMhtjmZTaalHY8Eq+KI+tLcVFbVgobmacQ6U9FqfTcPVsFKi+fq4JfJW4yxAXgwexsxJ00VhxTd+fWAmMNqh2Aw06vqYF/iUglNiZkSz7I67dmBesW8PIECEH8emYLKe6NRDGxMEAs7xhOSRGnlKbEZ+cMUtkrIGDg9nmGFrjWUOlg+u0rPv7rN9MKB5LK6tPXr35+3OqTlYpUYY9/8TUBP6EepWE10GLMt8N1W+vr8P0N/fUJ/dtOMoOMFZXGJgqFSaAFp8vmBeWCsoeYM5y3hgt2NcCh/+fhuTLMsVV3qce48JwETv7/ofC4uNu7f9jriNdwv963amwONleSSJCQw33ZfizpK6nBDg8nV0JMX+Kc6mIr0hAgKPfX0eCTOtCJGuisXAOu39yWTZZFShauJ2dvg7dhyZdmgoz9BPXHlTI6w5PjchNDEygHDpjculyMg31s+9Y2HHiAeVt03FzP7RZcUhAPHlTCPj6wcm4OhqdWsZJk2Xl81PxsOXig6IGvnzwJQSdPXFN1A+0/e3qcKSHhypVNcHo6vMneHvz809gtJJBEAUUPYDFj3cLCY7kcek2FPhzascx0tfaaNWz2mj7wbcBSxupMPPKLwCa+f0f01vww8G7F5iA5mUQi92DYgpzWJNn8/m1jjX5Sd5Y+QXdHM1c0lxiBJWMjSJgjIYAG81vJsOsVnZ4hZdJkGTZ7MzJc5MwMBj0E//BB4vj6Tx/6xwkPH2bKm7va8qHuFyuJJs8w3BHQ/CYYGBIIhgYE5A6Sc/1mZ/2Q8nVPe0a7NK5fYMFxwj2cBnzG8KmuNDcyxYCKfD4WFHKIuBu+jOfD98UwOpSYCGUFae8URf1b87wKNd/4yeVVn/vH164o09qlVqnLdhe/3LJpQXm4oZFOB/3nQxYtglE7Cw0LXlwM8TrrsCm7INuY5U0O9qUwrpe2AJpoGgftUmATaemCuggwc3BRqbSvX0VJDPHsbFj3rSfR3S1gC910h9YodHhy8vO8qoA0lDG+/ZHSY96dOMFgqCv27KbTgSbxqsM756SljnJSJUCgUVRqkeMy4bWHjEOztj305RZWwbAnqKBhMQ2JoOMiJC1JRwxh+k7N+PrOTGW9nwho/ZWUNLDxYZHRxETrTynXVduP92iG8BKTZZ5UeqriU5DgPS7nhLxAZ4/Ph3f4eLat9XYOJ/7XFOGSSg4gB3JzNQmE9PgAp5rayQnTbopL8MffQcG/PwYHCTBADyZflMGqf80qK83+VfUGiwjVgirCAuTZgjTfB9XWawK9oJj87yOKH+RjVtpad62ysuRadaF+mJx5TrOiWTGD1u7q6u7aqH5yn6KhiGvYZCybhSWx2SQMq1gyGLz08tUry+HhZGI8mJYI1OaDs2sp1hQrhqFRg8GiREek0BPL5e/+ehqK/fLlPzt9Z2uryNss4yIJYWdv3zb86RbCgMfMlIfDrRls5cGdmuF6XFrRJBusc9YLgWTDCw9SNNUnvlrNP7LmdfNWZF2nNZ+yvrr/1fnli+Zno1iBu3csudnl2blch+i8RKwzAfvAJ8jNyS5L0aGbnfOqxuQRsQZzpsftJM8GPW4XSqhwR+UKUe7CXGYKZZ6yKjh39+JwIYrTLmKZmpmaKhxSofvQxbvnsvnBKD1U6H7gFJazqZlzyhLUcJn7MPzOD/g94Rg06i5QvGDIBkHqW9PaTLTCpCCMzEwMF8NSEi372tb2IUkKC1LF4Z1rPmEESBNjE0eL7GCC5eqdO9WIeIrC2n2cTQ4w/ehIGiLe7MYNC49jJDQWYKiHtsjReQoUKi8PbUleW0WetycbS2azyBg2m4RlOQ3YY1Qzl4nBemD0+zwxcPYhi5C7ycosrtkvWvDuX+bt1d/v5T2wzMuvAIJyFL3fow1qyK9fY6Nj7LEG9isEOmyZWguLM7NIZJx6EZuWrP86ztzZ9VvNTC2dmplCUszlGi2tdZXrPml9zDN5t36dfPVxPz9T5KCfw5XVqnXrHx34OoS01ray0rZ0G0rUstwFUrsTXZY+NGIf2YVKwlOtUM/3JFoiraxkmbBHS/dJ1rKyMP579WUHv8FH69ZfCK1sQ2h9e6H1w9q3q2Xr170b9PM7BsJGww+Mxr7wiLu4fZuuQXExnR5WbsdgANyZ09uiVgOkub4jIz4+IxM+dp7Dvj7Dkz681G87vgEi3bGTzkhLvXKZSbe2toTZ5LXASOyTyCz3gPjyqpeePW63zMPU9DTDj4akI/CO584agIcAjquLK88Z2aAuH0rwWO+F6g0jORrQ8+niRQf47c6damFqt6yJUNkJRS2Z0d7PItb0LcijWhV5tvBE3/OJ4Qx59C0LGIyTGUXIcRkjE89xsmANfPasLVnCDI6SiRUVcpXkU7Q8mClJVskVCvrQJ5W8QiFO004p7XOqbRZj7SAuE7+4uCCLZk8cv2tUdMECuuJkdyaGi+U4wqCdSNEqi0K2tkb4PLNdrhGl2Koi1uxYAKaY3eqyCpX2LpVWxamiWKm+QS3UFevvJF6ymjK1l6RWYjHKDgyD58v3kZ2Cjp98Wol51Mgyl0PmUopDLX635CotEfn80u3b7eNvPTMc0rM4M2vb3R0cvbCAZ+X/958yLt1DnxP+9i07Nevq7IvZWQ4H9FiuifH/IzEjG0sxlqlyw3PCEjI2xsb1rTFZWRPJEwemBORmiwJSAiP53aZb13xC1NonphJSIQJNFBWVK4xyi6S5uUVR3cu4HBBlZeNXHsQtD6VFdcTFMLdfOHIk5mJMTGiXLCtT3tUll8vky6NT6DhcCg3nKiS7upAprnkR9Ei60u6chOHvuLb9c9GHw2OjaZLY2J3niRZEBI1GQhCRNw47BkgY49vvSk9ci084daq46l5ioh1kBwnkJBLRxbCWLwu5eZXS3KyjypyORtPp1lY0miXRijTVYWwqWbr4tJ9PKabgKfFl5nl55uZV7WYSljQZsWrQ1DyvytREoVi97cwcAmTsdHJ0duJAM7PT0xxOIoC4MzPTM2y2k6OTE5jjpWtvV3qacthRatd6hCxN8M98VplHqnLjv7Mmx4yP2v2cF0+dEIumpqDFo3ci8ftHoibnIhEdvA789z+v8nL7ch6fxysPfTDTuHXr1OAW2yYRrD5Zvd4G45Hz88f4OCjH+Cmp9uAu5a6wxrLVVx6oEQ8oAJYEojXJWqiw86Fsu7CVQi1+9+hYXDlc7rZizY6QhMkJPH5iMiFkZ98Kt4Qcd+zR+2IKpUXaRvGxU4hutSZaJYAdiOF+BLJ/GGGTSEQL8Nf5fDqDQVfmm4eBke9fW/ueSU5mEmJ/R0baxrSvj43pWB9jGxX5Ozn0XW2dvxkvkIBkQHE6iSQkMSTKeg7Hwt3yQ3/V1voDvd2VWnxeMq/SWaBb/Hi+VmUpeuO/rxMchn+T+Pr6Kx6lIf1PZ9YBbT7NlXolXaa50Ph8F6p1hbmGuTqKXaEQC9S9DIIa6S3eMxhVVXuVf65Zo65/yDeu0+nXb3i/GWOLdB2srIM4PO7OnRcuFcL+QXCJta2TQV8dXHjh4oBkAHG1dazB2qYYDvQHf4x59fd7e7Pnpc/V0sWLtjo6BlFxyPtWpqKXkJPNC9XTJ1mf0LtKT083y4baVplCeXq9vQlJz8BzYMhr0Ax4Gujr6mVl8QgiMPjrwkXPhgDsZcRJLy5uPe/AbHR057rrzyvzHG8jKXSHvJRna67vzDGzev/6uHjYuZfFIZyDpBv+1OIQWitLVU3BWSkyBzeVlazUAmoP3JO6uCDilp3nDdZu5XC4nD27fWi8pIpte/eCX+DdkBs3nj+9Prfw1HjuS1UTvJWBoYVnf7+n13qyzHL8lJ3A/955uo9rTY6v7F9wKLpR/7yDnF20JyAXuIcsPJ27/uzJ9bnilHXzdhaLdnYa9uwXLYQMNDo38mMeDeq9jl7moVqQ5fl0OoOuvGfz+QvGJZHnbNjMiIx0SEnJiF/qmPjGoE4E2wgcmUxNfFryx+oDlv33b969tCV0p96S3r5PGMSb1tY0Ya4Dr72az6vu4PE7qnkOItGhzEsh6K95dIBGV3WIZHX7n+w7qpqTHyx8/usDnEa8FgcOhO7LS3SC1eWBCcMTCcEFqT8SMqSM6vwnsgDRVmKRVL9ItoHsn3wvb2mBgVxGCKrtXncUv2tfkNzN+uqstdXsVWvr+Vkr69n5OX9wTXs29c9mZlp6dizzsClM+82JSbL16O/wRMoyZ7f0g8yEmmxaFtWnpDJfpqvfVw30ZPmVvnAWRXRcw09CJbkXcblL6OJ42sJnT+I/+Xa6egYXetHXs8v/+t+lS5x4Om4Zj1vARDNRApCJWZpJpQXsU9QFL9FHIg2XwF2+pZmUDPJSMcuN5T7JgR7kKYn0F881f8AOWgiLEAf4u8m9l3RCe9ssBJ1kubJcxeCPVxvJgqnEQQtYVQpbDBJ3PN+HKKsrr91/oLzOdrgPkVjX0BAY0NhYmyBI2CsQDhAttsAP/VYL8M1uu0VJVUn17t0ModtuXqkyZ4tYwsoKEGyhk6vZ1UrTJAbqTZXlZv1FRYVF/WZmVyf61LSnNKkEKiI5dzkAn/eVhJaGJtHKw9Xh23dgn5ZUGnWxt0RBNadavHrVVdOp6qxZ/vrVe6BQ0Cys/Op1Tdcy1bIsVRBa+amCGkxbLzII20qOKMmYfoHvH8bjh/vxDR7VVR7oKt48eiWjJOLK1xh+ZBKfvnmUgUQyvEENdsDC3v4Mdi/gdjE4y8lJJDSAqr+JEIfIkQzaa8Z9honDZtiyMwBDSUwQkggEYTL74Uz9hH/Y3V7HBMoxvfWt9vWNr6P4fDu/CxeXlAnoQ8n8dTiGk++undgr7YjyclW/S7hcrVKXV7c6oY9Ymo+tta9TCyLr8Ax8ytEFdDBDSnusXGKeWOi7xMXc0yec6OjQ0vchzXV4Q3TU//+RrMT5YobZ168OCv/l6hZX9xA80i7Ene8COaRKAFGLVFNIM0vJB5uv44vwJ3lcUd8GeD18d8NXeFq5cuYNPQgr14NLsf3u7ukfMjIWz1tqrwNXHYtrjnZs6QlLR0NozszkNUw/LZ2r4CBjQHGBBGzeLLlUVOtYDpQKGaumhphY8wdbvrhYTySZmbI6/Ud5kpnZhhWPHxOJj+fjFkCT5NNc6a4UgRmj8eEKt4tUWAskTwa5UgtNZx4+RGU6A3WaSNPcBLmaF6M7h+ZFBF5gdGx0lM16vHO4xM5qns2ue2tnvTFWTEPD/K6hElBrBTNg+lH4L3Imosgx/w8Ns6E0ybFDEMvAAJymwlmw/Kjqf3Am4CcbYLdrB7xjp2rnTnjnLhXQRCe7hCYc00ZD0O31y0FclPYsU2yptRWwXj+Z7qYD1Y0t6elp6S0taQBB2iiloG0LAuVMEyPDpCRDQ6uWLzHhpXJT//iDBU8iQpCvqhZqV7BkXSQQrvI+I7Ci1B6Hc3jyNGV+/sHDx/MPH4KU60IT7ghmwJROoVpRrC4X4giyRHlZGcPCscuRlWkN/L6K94pjN4pTxFSx5ps4QeHU00nP+LsNNFkpLHcWamg9io1iiXeXVpdWbbeoKTFjCZKE5XUpops61qnTuwrwOF5qqCS0GPu+ra0oNLUWtbYxDAoSJtLT3NRJgla0s5pbuLllafXu4BP77ay+nO0+MOROdg0pqd5hXgObMZcI1ANJNz5WGqOTJSGpIUUN3woSjqdLXdUllHGF1VzE5ZalVXtC927EAU2NjUW6snFDUfHaoZHJyk8pjx6hxHhKAjU/hCcPMTU308tD7TEbgEUofKx0iEpdm64bQ44lS7sOKu8qD3ZKYykxlHTdtVTqUOkx+Knu8W6Co9evn5/vfv75y8uR0A3CZL6lpRIxCgQHg4EBb/fQEklpiZatHaAAOzvQt+rKlTx3MmYKJRbDMEhVhQg7W2S7SYKcJAt01k/PjB2qvXPvHir37o6PgY0HBNrdnWwW/YDELoFz+MB/LKlkyIFSQoHdix5VRweQlQTVKfye/8meji/wYgNPMZRH8ztua37kqJ6ooC83Nfvn35HwgPjy444PO54sDjHQSAbDEsVJlGWARI+mwyym1yB2RoZUCkH3IK01SzGNBwMYNjRpX2Zcvoq6VpQiEtUCSIjmUysUCVNqYIhKhaBcEQQgkQIiDQ4m6ps9vp+sHxsDAw9dSWRXVzLJ1Saw78G4DmwMh7ESsFg3oMJEdWyl//cDc10PfmDIj+b7FuCAsr/KuOSsQsav2ues7gtfFhLYjyzSDceIQWxiLCEt5uZZV1bngNC9os0+DIEI/aPodLh+0bazStS/TtSGh2/dY/+8dBD9P0rmiUx0WKEi2HvIPC43uWDJLi4krEqSMXABKKL50lOlduTqfGR8wwpnqwxIQyKSiRoIsnJe0RAfOX81cFkgzyctC58UGTwtBBxgEcAegKK7hVqA5jXUKHE+CoAWXcMniY0clXsHulMEOLLeJXG+Wqk1B2Djih/7vUqtR6aBgNajanC3CAB4368M7X9bvpe2kw6D+gLt4eEmTQFHi4aRtoDTpCEDWn5IQMJwnMRaVq+2ADW0jpIZ2MnznBQykkmd1eqycsYVrSrlTmUe2xb8C0ReUQNGWBonLiUBz48MLMcLCU3R4AvR8Nw/JiGXoFbnUpxixxCmMcYWnHGMpOkhhvAO8AWcJsDET2J1x0ctvDOmQ1cXRlm9ZXTyqsf7dHuXUZ1RHonHY56hHsSExTYd+yJtTihsegp6xwOVZ+815q6X678bwXeU7q/4M+hM+9Sb2gy/5Q0ZZ+83pdmrmXY3LuUf+0Mn92MwmDd14Mmpi/oT3v65wu9AnhojAlZTakDHEy0LIWpITjUMIFTHpjaVBsRU/VpA6BQCQDSBPuI0jQ52YicZD2sI+8WwO4tDlaBxNm4Unz3HZuyxwgBCVadn7nqJs5PieMFRK3ActyENTmddfZHGimNBC3Dy9fVGnXx/1bpgIRjoZofjB4vo44/9N/PuXh86+99TYh4EpwgiMIyJJA1M5tenZ4jlFR/eQiD+fys9XUzP4Bsnq0Xc9IiAAKEQaQOsHTnhgEJNtVj4MEW1kJuhnNuBE0H4QcKE8K7orgeSBuGCW4KoE57l+iF4n0soQgD8b0UKAgQCoSA6wHDNsG8U1OvaZYem/qKDwH8iK+zttil/p4QR2cxkGFXDLNdPStoTnz2njg++zsY365LMc8bXOMeFAej2sL/g79VoBWD10h7cO8CN7lCU+NtkpnOP5D9LlndybzOZFU3NeZYIfELRDkIVXQWslaSIMo9zOWFjamJHZ8sF/uo46b9Nh0fl2jjXTi2I4K0J22z59hjwHzly5ISHKX4qSkN9RDbDwPxZrzzfGuiPdX+IQvhYISFC8qqVGZT/P4sA7tc2v69Om5louf8gPf3KMQs0eHvO2JYYathmI0vFxjX4+IV0BwWlZmNcSXKc0UxGIIK/iS2qr4OgcKbDERLuNN0My6Ff6pWSZ8hO4l3kJBn8UT6h2YiF09BKhzV0FqPy3PPKu40JVQYicxzufc8OR8jNloAlJCyBcy3k5Xy5SeUxrLYspGS+68jXbKQBy8YJQhR98qWE3rOVjhL2XOqF9fZi/0G9VjwIcNaoAUMfAhiBIaKlwZ/XG035gYl+7AETkLSd5fmilLzwgqlZWqFc68uPKwYX9+ydl3nuUPK/xfEryq5jWUmWeRqNBJYdJGAQ2X2+1ubkocWZfrJ3EJlMGJ8z0t4UIAqgRZFwjyqpoQHvFINGFUPJj+d0ZoPfMH35lwwVWRWnT1dwC4mU5cXkuXeXK8czimHlTTHxBjVWohX4BpwWCLx1rtCVdksuH0+zV3ruVqAgjPA9fw+qC+s0u+YoB4cy+I/bMJf4wPxA0mQNVp6qIJMiQRiAhtYRx8vDcvLyFejk5fo4fFdUT5CAYDrXDG0GPjdPnH5vWmGK+fDi3+MhGao38s76csvhurCUPvVWh/vqpRC+Xf/2YnxHpP9koNo10P+OvvCO8I42XNXvDsUHU9CL23j7hOguUOoQaG/Npwdd3Uyrj++viH3rEY0mYSFSalrSv/1og0bIsgMHGoDk7WTQtebCOm+D5mqapeZeT2B8qxnhWE2e4KE5sYyd+NPZg564YhJGCKfZn9LsTAmzu7veXMNq8oJxZ33n89oTLHSV1U+0EeetZ7Fw0zyR/3uqOM9wG+ebeIH5NNMWJXAcJxAvpcElQvdbT5IQGDgXZge5E74rlX+UVwa5BFSWNRLXUBCisF+iwMWvaTRpH0wDSMPmWhbJUnMR9mpQXUGIUiJV/OwO0o6vGahVOUAYgOghPGjAgldYmmuPnjBoXnwg93hMUgIRn6Hesy4u3N/h4+BgGC4nxNeXBS7MyR8d/MPj1u2poIoGNJ2Me9rfNZu1kevA8O16f1Mdiwxt/P1P3Yb/NKznHACG+xr0QyS4I9TZfSyy2pBqQA0nHKCHMBnF7g0R+mIOh+6/I/veawT19WvSaQOZjuPxFPLtZxEAeOrYOJGdgCPFCThRHIF73M2nUZ8+3efJgMCKTkclZ0uNbdLTLHnIRMtEs2ST5DxUYAALS8wR0yKyQPyhRF+ZzDZlbm7YU4tApDUgfMwGCz4xruM1nx6IhN5zxk+U+abIe5fqRIdqTtDcA0JwB40gr0AoICbiws61kZ9sv7PYSupIuYQ1OKzY4cFhNHNoPRYCBFvfFYL6Agg4nTRoyW0WhT9onxIg7Ou72XJX9SoKC+tKV60qJY29q+66eDxmFQozZNJTpGc+LzpvLfXgtvGOv0CIVBAkCHaPXf9YQue/rmd34Fzk8BDG0vwh0rhnQOvY/1MjionWXp66/J3CzKBmqNn3JBL62MjoBRJWrZoM4XPnKi2qqkLybJOEZBWiVXDVuQvCb4r4N1T7kypVDLWorAxRXDif+3LkJRKZxQtVCjeZRA443TNIu5hnuori4l4d3netNOjwHb2euJRELZhdbY9S5yUnc14Zs219V+hjY8MXCICFOjYVi0fbdGVPvXG/ubQLYcSHtyiUlauSoWptDjv1ZwmnVzs8lRUuiVQ+W+9wbv3wrv/t5S1DiuOMUn/vkUdyLRs+7FyTDxH8/uHhSd0URwaGc4TiqHdsBgE4Ffm1bbHNN+yNUd/Y2n4C27dtQbLyQYf7AfJc+aXWOrYfbPK2jfKSntZ0NDvv5BA2xYOYOTxwm5jZfGk91zY1Eg4SHCim+2XfY2IzCwCR81wAlo3dOdUEgmeo2nqhtOA+A9URmx3WO2gR222207w4PUe9vTWVCoHdX/paSxCedF32ds4XRMJnFOqtZYcyCpEMMyGkPw+FRs2Aj/nDW6EQfQn8/lhwAlGEKA6LZ2b8s3FPgveiJNgwM8NRHmCTrZxll1UilnH2RZYRP32zz2CVKGXlnM7G6V2v/z4hxCASpbyZhz4ANHu3D28FG4GgiabUALbeviNFSltAUDLh3VNgbOjt77dai4pNQKjnn25YPrq9ws6rEwuzuHibAJ0jIOPYcLSsorw7OyLJkGndnV2rkkl4ILXyPHgw4TLr4ZsH76wsAmKWRb955YhbZ4atbiq6rawnKywx3mLJ8s0ywPFlUsvXpqc7nWcdXoN5LaT/RbP8recwiP7rMeDr0S+K2D/IOrBbTWSDx7uG7mqxAvcYNw8xOf8VD07/2maFHmy2V9hKQgLlQpr1aJfUrCeSVzMsHELEJ6hO6kAXnPwSmCO3bVAWuqS7ZCgbMja/EHAdc1F8tgJMTGzhfvzY6poDKppS/4ZEHXSMl0itv9KYiVrBFoX6P+cVx9YN7rgk9o/5OF5XQzC56xTqX3BwxQ03g4Sgmxt23/GC/mmngr3D82dL809H3fH6VaXP0GxnY/+cX8ick/yx/0Al4BLX/7Hy2cNd3bM/1J+W/mFlvWe2EPh35Nrvrt9fUyp8PbPOHg7biss0Rh8iUVrMMuyYcOYdGaSTo05N1Irw8L803bNtrFjNGFDb2BIoMDbK7ExjhAwyPekt1TfG3boVlhY5/xK11lShSDfoUm5eB9SR+YskXsfEGdsZX46YnJ8cxiYgv7ujPNzTaW4nV33lq2Nkykr/b+9P5q8rv9Db4I/4DCtC3djYBn7maXvlxHzLnoP60IKQnzuWxRYqQpusEeK89fIhFETwzjpzEAJvjUdkWouHHSaOF0JMydupytDLFT74TdvTfSqmQ6XIi/uBwRwO4KGLUNZU1e1xfaaO1en2rbJRR/lVO8cnWAJzY1U/PKZ4dJM/duzX6zfTNg8jD/195MjpzNErV1fciXNPz07PxC3Zf6VxnTZTswI0vU3SPLYJgZAcggB8sb+q9cFRwNGEjrDz2fp68rWlP03RTNg7E3W86CnIryf9NOJj5BhOgmjk/4p7XfqL2gX4I/89rXXGhFAdeXVopMkUiH9T1FdT1z33NSRe6MzOs8UHJYWclbiHN3Iua0wLnXy8R0ckPHebSF6pNxzVj4z93y0yMW9FuGx6MkVb0pKWnPtQf2F7e+GsH++uaxbXrW2Jm8VSJCHdN4GBX8sIbwcGvQ1YUsMLFwlZ06cbsXuOFHDHCHj6YYuz78/u679SOcVLR/jvfET7a0rE3bo/MWUg8v3uZaWOGWa9/d5jfJCltQ8gRuGO/5A/EbAM24CYcQ1CfCTXizT8MM93cDWMd1hDEBUlcHujcNNnZDg2pL39mErT5PhlV42kLIBifDyGQ4g4oJnfma+hjpZIcp5Ojk9DnqLoi28X73qlolB3pa/BCZ7w/ZIAojCnDw1tOgBajIBgYhAA13ZaBfHVrEBw0HzQ3AyPW8xb4u/xvEOA/k6G/lQ6mOjMDIn7FuN1wf+XPsr/Iom+r/pmAgAKmBlP/5+sW/BVV2LRMZDZvDrgG+9Q45+ZAv0zXzUPAMKKZHXFlEQO200rD+PIpY7QgMF1IjBHjSdLoDgkc5Od7ubtIybWwCXJiAKBD9yik7jYVM9/axjjc8mrNdQNkwJKvJGD3w9FmZWy9sDuaD9jHJqZ9BW1069Lz/wXlQ1L4lsyHLHWzacx0y6RwOelTkUm5qU5KyxsRs8OaXYnVlKbirhOfsU74BCXzHXSjX9cprtbUZOX+TQidAnmcXlNxt2MEK3260B3kbF0zRlnliVTxZ0Gl+zgQ/UMpW7e2bbFsbQhyT1crbQcoRC4DCVL4VUaJhj3klS7/EUcXmAqvlCH+6Hdq41O0zxUXfOXHDiYWEBDL5IaWsZc2d5IqHHO4qeXaPSqFds6ECBS5AF/kuSUWT+MjpS/s9SVP6l44AINC82iwsDK2nHqLSuK9ba8sqxnhgIWar6bnvip1BHHI6rsXzUUVTrJhc99ZDlpdXPAO+JxmP2MOrvrJwnrds/4dY4GN5MsXta5OSWusZXAJvQf13qeo0PfQOWltNa7Vdk0vKnC7lmFS+CcfmVTcIQ7Yp04ZGwsRp9ruQJiegKb25XsUMZ3Vck31S/bvC4OPT/mLf5P3q88VbAXwXuMIg0J1ZPslCTlKSbNT0jhGW4FXbJ4TwnErT9SLhaTKEiBJIuCSX4KJdVPCKNpbxElkz9TgsJW+1g1tfXQTXeDvTA+8OUeANbrct54iN46GAh8VxW3B3AXWC69WRcDDfIP7qcvVwF55Qc+38pjTMibX4bF/HIwV9ZlsYp1qJm1zio7GhFlDZ1+sDqBUV45L/BBniZ8+JFyVqfS/0fA9E4Bkt46ioGACcE3DvuDXaXRGUyWvwXe7N1fwG9Q7n95giglU+lMNpe/tbwiK6qmG6ZlF4qlcqVaqzeaLcf1/Han21uFCBPKPD8IozhJs5wLqbSxriirumm7fhineVm3/Tiv+3m/X9Q8svrc92fRGCDJiio03TAt23E9BpPF5nB5fIFQBIglUplcoVSpNVqdHoRgBMVwgqRog9FktlhtdofT5QYAQWAIFAZHIFFoDBaHJxBJZAqVRmcwWWwOl8cXCEViiVQmVyhVao1WpzfE8v/8k+32OYAv/qey8Ov7CBPKuJAKtLG5+c9HmFDGhVSgjc19skYIIYQQQgghhBDGGGOMMcYYY4wxIYQQQgghhBBCCKWUUkoppZRSSiljjDHGGGOMMcYY55xzzjnnnHPOuRBCCCGEEEIIIYSUUkoppZRSSimlUkoppZRSSimlFAAAAAAAAACA1lprrbXWWmuttTHGGGOMMcYYY4y11lprrbXWWmutc84555xzzjnncv2dAz7ChDIupAJt7AUAAAAAAACSJEmSJEkREREREREREVVVVVVVVVVVMzMzMzMzMzO37gLChDIupAL9BgAA') format('woff2');\n}\n";
GM_addStyle(oglMaterial);
const miniImage = '\n/*css*/\nbody[data-minipics="true"]\n{\n    .maincontent > div header, .maincontent .planet-header\n    {\n        height:34px !important;\n    }\n\n    .maincontent #overviewcomponent #planet,\n    .maincontent #overviewcomponent #detailWrapper\n    {\n        height:auto !important;\n        min-height:208px !important;\n        position:relative !important;\n    }\n\n    .maincontent #technologydetails_wrapper:not(.slide-down)\n    {\n        position:relative !important;\n    }\n\n    .maincontent #detail.detail_screen\n    {\n        height:300px !important;\n        position:relative !important;\n    }\n}\n/*!css*/\n';
GM_addStyle(miniImage);
const altStyle = '\n/*css*/\nbody[data-menulayout="1"], body[data-menulayout="2"]\n{\n    #bannerSkyscrapercomponent\n    {\n        margin-left:260px !important;\n    }\n\n    /*#pageContent, #mainContent\n    {\n        width:1016px !important;\n        width:990px !important;\n    }*/\n\n    #commandercomponent\n    {\n        transform:translateX(27px);\n    }\n\n    #bar ul li.OGameClock\n    {\n        transform:translateX(29px);\n    }\n\n    .ogl_topbar\n    {\n        font-size:16px;\n        width:100%;\n    }\n\n    #planetbarcomponent #rechts\n    {\n        width:170px !important;\n    }\n\n    #planetList\n    {\n        transform:translate(0);\n        width:100%;\n    }\n\n    .smallplanet\n    {\n        background:#0e1116;\n        box-sizing:border-box;\n        height:38px !important;\n    }\n\n    .smallplanet .planetlink, .smallplanet .moonlink\n    {\n        border-radius:4px !important;\n        height:100% !important;\n    }\n\n    .smallplanet .planet-name\n    {\n        top:6px !important;\n    }\n\n    .smallplanet .planet-koords\n    {\n        bottom:7px !important;\n    }\n\n    .smallplanet .planetPic\n    {\n        box-shadow:0 0 2px #000000 !important;\n        left:8px !important;\n        top:7px !important;\n        transform:scale(1.2);\n    }\n\n    .smallplanet .icon-moon\n    {\n        box-shadow:0 0 3px #000000 !important;\n        left:11px !important;\n        top:11px !important;\n        transform:scale(1.1);\n    }\n\n    #planetbarcomponent #rechts .ogl_shortcuts\n    {\n        transform:translateX(0);\n        width:170px;\n    }\n\n    #planetbarcomponent #rechts .ogl_shortcuts [data-key]\n    {\n        min-width:42px;\n    }\n}\n\nbody[data-menulayout="1"]\n{\n    .smallplanet { grid-template-columns:127px 38px; }\n    .smallplanet .ogl_available { display:none; }\n    .smallplanet .planet-name, .smallplanet .planet-koords { left:40px !important; }\n    .ogl_refreshTimer { background:none;font-size:11px;left:auto;right:3px; }\n    &.ogl_destinationPicker .smallplanet .planetlink.ogl_currentDestination:after { top:9px !important;left:9px !important; }\n    &.ogl_destinationPicker .smallplanet .moonlink.ogl_currentDestination:after { top:9px !important;left:10px !important; }\n    .ogl_buildIconList { left:4px; }\n}\n\nbody[data-menulayout="2"]\n{\n    .smallplanet { grid-template-columns:101px 64px; }\n    .smallplanet .ogl_available { line-height:10px; }\n    .smallplanet .planet-name, .smallplanet .planet-koords { opacity:0 !important; }\n    .smallplanet .icon-moon { left:4px !important; }\n    &.ogl_destinationPicker .smallplanet .planetlink.ogl_currentDestination:after { top:9px !important;left:9px !important; }\n    &.ogl_destinationPicker .smallplanet .moonlink.ogl_currentDestination:after { top:9px !important;left:4px !important; }\n}\n\n/*!css*/\n';
GM_addStyle(altStyle);
class CSSManager {
  static miniMenu(e) {
    document.body.setAttribute("data-menulayout", e), localStorage.setItem("ogl_menulayout", e)
  }
  static miniImage(e) {
    document.body.setAttribute("data-minipics", e), localStorage.setItem("ogl_minipics", e)
  }
}
