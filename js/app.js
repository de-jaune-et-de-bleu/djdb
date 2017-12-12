"use strict";

(function () {
  'use strict';

  var utils = {

    viewportWidth: window.innerWidth,

    //-----------------------------
    // THROTTLE FUNC
    //-----------------------------

    throttle: function throttle(callback, delay) {
      var last;
      var timer;
      return function () {
        var context = this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + delay) {
          // le délai n'est pas écoulé on reset le timer
          clearTimeout(timer);
          timer = setTimeout(function () {
            last = now;
            callback.apply(context, args);
          }, delay);
        } else {
          last = now;
          callback.apply(context, args);
        }
      };
    },

    //-----------------------------
    // DEBOUNCE FUNC
    //-----------------------------

    debounce: function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this,
            args = arguments;
        var later = function later() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },

    //-----------------------------
    // CREATE PROMISE FOR TL
    //-----------------------------

    //tl = timeline a observer
    // e = event de callback => (ex: "onComplete"...)
    createTlPromise: function createTlPromise(tl, e) {
      return new Promise(function (resolve) {
        tl.eventCallback(e, function () {
          resolve(true);
        });
      });
    },

    //-----------------------------
    // RESPONSIVE FUNC
    //-----------------------------

    //ordre du callback : responsive ORD, responsive TAB, responsive MOB

    matchesMediaQuery: function matchesMediaQuery(callbackObj) {
      var xs = window.matchMedia("(min-width: 0px)");
      var sm = window.matchMedia("(min-width: 768px)");
      var md = window.matchMedia("(min-width: 1024px)");

      // check obj de callback
      for (var property in callbackObj) {

        if (md.matches && property === 'md') {

          return callbackObj[property](); //callback pour ord
        } else if (sm.matches && property === 'sm') {

          return callbackObj[property](); //callback pour tab
        } else if (xs.matches && property === 'xs') {

          return callbackObj[property](); //callback pour mob
        }
      }
    },

    getLanguage: function getLanguage() {
      return document.documentElement.getAttribute('lang');
    },

    findAncestor: function findAncestor(el, cls) {
      while ((el = el.parentElement) && !el.classList.contains(cls)) {}
      return el;
    },

    // CHARMING JS via https://github.com/yuanqing/charming/blob/master/index.js
    charming: function charming(element, options) {
      options = options || {};

      var tagName = options.tagName || 'span';
      var classPrefix = options.classPrefix != null ? options.classPrefix : 'char';
      var count = 1;

      function inject(element) {
        var parentNode = element.parentNode;
        var string = element.nodeValue;
        var length = string.length;
        var i = -1;
        while (++i < length) {
          var node = document.createElement(tagName);
          if (classPrefix) {
            node.className = classPrefix + count;
            count++;
          }
          node.appendChild(document.createTextNode(string[i]));
          parentNode.insertBefore(node, element);
        }
        parentNode.removeChild(element);
      }

      (function traverse(element) {
        // `element` is itself a text node.
        if (element.nodeType === Node.TEXT_NODE) {
          return inject(element);
        }

        // `element` has a single child text node.
        var childNodes = Array.prototype.slice.call(element.childNodes); // static array of nodes
        var length = childNodes.length;
        if (length === 1 && childNodes[0].nodeType === Node.TEXT_NODE) {
          return inject(childNodes[0]);
        }

        // `element` has more than one child node.
        var i = -1;
        while (++i < length) {
          traverse(childNodes[i]);
        }
      })(element);
    }
  };

  //modules utils
  //------------------------------
  //------------------------------
  // MODULE GENERAL NAVIGATION
  //------------------------------
  //------------------------------

  var Navigation = function Navigation(el) {

    //composants DOM
    this.nav = el;
    this.button = el.querySelector('.js-nav-button'); //bouton à actionner
    this.buttonUI = el.querySelector('.js-nav-trigger');
  };

  Navigation.prototype = function () {

    //-----------------------
    // PRIVATE
    //-----------------------

    //GLOBALES
    var animationProgress = 0,
        scrollEventCallbackBinded = null,
        firstLoad = true,
        currentY;

    // ANIMATION TWEENMAX (private)
    var _configAnimation = function _configAnimation() {
      var _this = this;

      /* Elements du DOM */
      var buttonIcons = this.nav.querySelector('.js-menu-trigger'),
          buttonIconList = this.nav.querySelectorAll('.menu-trigger__ico__bar'),
          menu = this.nav.querySelector('.js-nav-menu'),
          menuLinks = menu.querySelectorAll('.menu-nav__list__item'),
          menuLang = menu.querySelector('.menu-nav__langs');

      this.animation = new TimelineMax({ paused: true });

      //scenario de l'animation
      this.animation.fromTo(this.nav, .25, { className: "-=a-nav-open" }, { className: "+=a-nav-open", ease: Sine.easeInOut }).fromTo(buttonIconList[0], .3, { className: "-=a-ico-open" }, { className: "+=a-ico-open", ease: Sine.easeOut }, 0.1).fromTo(buttonIconList[1], .3, { className: "-=a-ico-open" }, { className: "+=a-ico-open", ease: Sine.easeOut }, "-=.2").fromTo(buttonIconList[2], .3, { className: "-=a-ico-open" }, { className: "+=a-ico-open", ease: Sine.easeOut }, "-=.35").add("click").fromTo(menu, .6, { className: "-=a-menu-expend" }, { className: "+=a-menu-expend", ease: Power2.easeOut }).fromTo(buttonIcons, .1, { height: "50%" }, { height: "100%", ease: Power0.easeNone }, "-=.5").set(this.buttonUI, { className: "+=a-ui-expend" }).staggerFromTo(menuLinks, .35, { className: "-=a-menu__item-expend" }, { className: "+=a-menu__item-expend", ease: Sine.easeOut }, .2).add("openNav").fromTo(menuLang, .6, { className: "-=a-menu__item-expend" }, { className: "+=a-menu__item-expend", ease: Sine.easeOut }, '-=.2');

      //mise en place de la scene à la bonne séquence
      this.animation.progress(animationProgress);

      //check home page ou non => la nav doit être visible sur la nav uniquement
      if (document.body.classList.contains('home')) {
        utils.matchesMediaQuery({
          sm: function sm() {
            if (firstLoad === true) {

              //ouverture
              // this.animation.progress(1); //desactivé pour jouer l'ouverture au chargement

              _this.buttonUI.setAttribute('aria-expanded', 'true');

              //timeout pour eviter lag de début (pas css chargé encore) => on peut voir load au lieu de domcontentloaded dans le script ?
              setTimeout(function () {
                _play.call(_this);
              }, 500);

              //ajout de la fermeture auto au 1er load page home
              _enableScrollEvent.call(_this);

              //drapeau
              firstLoad = false;
            }
          },
          xs: function xs() {
            _this.animation.progress(0);
            _this.buttonUI.setAttribute('aria-expanded', 'false');
          }
        });
      }
    },


    // LANCEMENT ANIMATION (private)
    _play = function _play() {
      this.animation.timeScale(1);
      this.animation.play();
    },


    // RETOUR ARIERRE ANIMATION (private)
    _reverse = function _reverse() {
      this.animation.removePause("click");
      this.animation.timeScale(1.5);

      // this.animation.seek('openNav'); //saut avant l'apparition des items
      this.animation.reverse();
    },


    //FONCTION DE CALLBACK AU SCROLL (private)
    _scrollEventCallback = function _scrollEventCallback() {

      // vérifie si on slide plus de 200px vers le haut ou bas
      if (currentY > window.pageYOffset + 200 || currentY < window.pageYOffset - 200) {

        //on ferme la nav
        _reverse.call(this);

        //on ferme l'ARIA flag
        this.buttonUI.setAttribute('aria-expanded', 'false');

        //on retire l'event
        window.removeEventListener('scroll', scrollEventCallbackBinded, false);
        scrollEventCallbackBinded = null; //reset le bind pour eviter conflit entre click et scroll
      }
    },


    //ACTIVATION DE L'EVENT DE SCROLL (private)
    _enableScrollEvent = function _enableScrollEvent() {
      // activation fermeture scroll
      currentY = window.pageYOffset;

      //si l'event de scroll n'est pas encore instancié
      if (scrollEventCallbackBinded === null) {
        scrollEventCallbackBinded = _scrollEventCallback.bind(this);
      }

      window.addEventListener('scroll', scrollEventCallbackBinded, false);
    },


    // ACTION CLICK (private)
    _navigationAction = function _navigationAction(e) {

      //ARIA activé ou non
      this.buttonUI.getAttribute('aria-expanded') === "true" ? this.buttonUI.setAttribute('aria-expanded', 'false') : this.buttonUI.setAttribute('aria-expanded', 'true');

      //nav fermé => on ouvre
      if (this.buttonUI.getAttribute('aria-expanded') === "true") {

        // si l'animation hover est en cours, on retire le break pour la laisser fini jusqu'au bout
        if (this.animation.isActive()) {

          this.animation.removePause("click");
        } else {
          _play.call(this);
        }

        //activation de l'event de scroll
        _enableScrollEvent.call(this);

        // nav déja etendu => on close
      } else {
        window.removeEventListener('scroll', scrollEventCallbackBinded, false);
        scrollEventCallbackBinded = null; //reset le bind pour eviter conflit entre click et scroll
        _reverse.call(this);
      }
    },


    // ACTION HOVER ENTER (private)
    _navigationEnter = function _navigationEnter() {

      //si la nav est fermée
      if (this.buttonUI.getAttribute('aria-expanded') === "false") {
        this.animation.timeScale(1);
        this.animation.play();
        this.animation.addPause("click");
      } else {

        //effet de hover
        // this.nav.querySelector('.menu-trigger__ico').classList.add("a-ico-hover");

      }
    },


    // ACTION HOVER OUT (private)
    _navigationOut = function _navigationOut() {

      // si nav fermée, on peut close la languette
      if (this.buttonUI.getAttribute('aria-expanded') === "false") {

        this.animation.reverse();
      } else {

        //hover nav fermée
        // this.nav.querySelector('.menu-trigger__ico').classList.remove("a-ico-hover");

      }
    },


    // BIND DES EVENTS (private)
    _bindEvent = function _bindEvent(el) {

      var EventNavigationEnter = _navigationEnter.bind(this);
      var EventNavigationOut = _navigationOut.bind(this);
      var EventNavigationAction = _navigationAction.bind(this);
      el.addEventListener('mouseenter', EventNavigationEnter, false);
      el.addEventListener('mouseleave', EventNavigationOut, false);
      el.addEventListener('click', EventNavigationAction, false);

      //EVENT RESIZE OLD => Maintenant dans le script via public method

      //debounce
      // var resizeEvent = utils.debounce(()=>{
      //
      //   console.log(utils.viewportWidth);
      //   console.log(window.innerWidth)
      //
      //   // si la largeur de l'écran à bien changé (toolbar iphone change hauteur)
      //   if(window.innerWidth !== utils.viewportWidth){
      //
      //     console.log("ici");
      //
      //     let isActive = this.animation.isActive();
      //
      //     //sauvegarde de la scene en cour
      //     animationProgress = this.animation.progress();
      //
      //     //destruction de la timeline
      //     this.animation.kill();
      //
      //     //construciton d'une nouvelle animation
      //     _configAnimation.call(this);
      //
      //     //active l'animation si elle était en cours
      //     isActive && this.animation.play();
      //
      //   }
      //
      //
      // }, 250);

      //  window.addEventListener("resize", resizeEvent.bind(this), false);
    };

    //-----------------------
    // PUBLIC
    //-----------------------

    // INIT DU MODULE (public)
    var init = function init() {
      _bindEvent.call(this, this.button);
      _configAnimation.call(this);
    },
        resize = function resize() {

      // si la largeur de l'écran à bien changé (toolbar iphone change hauteur)
      if (window.innerWidth !== utils.viewportWidth) {

        var isActive = this.animation.isActive();

        //sauvegarde de la scene en cour
        animationProgress = this.animation.progress();

        //destruction de la timeline
        this.animation.kill();

        //construciton d'une nouvelle animation
        _configAnimation.call(this);

        //active l'animation si elle était en cours
        isActive && this.animation.play();
      }
    };

    return {
      init: init,
      resize: resize
    };
  }();

  /*******************************
  -------- AJAX
  *******************************/
  var AjaxRequest = function AjaxRequest(url) {
    this.url = url;
  };

  AjaxRequest.prototype = function () {
    //request by GET : URI / no PARAMS
    var getRequestPromise = function getRequestPromise(uri) {
      this.type = 'GET';
      this.params = null;

      if (uri !== undefined) {
        var uriContent = '';
        for (var props in uri) {
          if (props === Object.keys(uri)[0]) {
            uriContent = uriContent + props + '=' + uri[props];
          } else {
            uriContent = uriContent + '&' + props + '=' + uri[props];
          }
        }
        this.uri = '?' + uriContent;
      } else {
        this.uri = "";
      }

      return requestPromise.call(this);
    };

    //request by POST : no URI / PARAMS
    var postRequestPromise = function postRequestPromise(uri) {
      this.type = 'POST';
      this.params = uri;
      this.uri = "";

      return requestPromise.call(this);
    };

    //requete
    var requestPromise = function requestPromise() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.open(_this2.type, _this2.url + _this2.uri, true);
        xhr.send(JSON.stringify(_this2.params));

        return requestResponsePromise(xhr, resolve, reject);
      });
    };
    var requestResponsePromise = function requestResponsePromise(xhr, resolve, reject) {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(Error('Error: ' + xhr.status));
          }
        }
      };
      xhr.onerror = function () {
        reject(Error('There was a network error.'));
      };
    };

    return {
      getRequestPromise: getRequestPromise,
      postRequestPromise: postRequestPromise
    };
  }();

  //modules utils
  //------------------------------
  //==============================
  // MODULE FORECASTING
  //==============================
  //------------------------------

  /***********
   INIT
   ***********/
  var Forecast = function Forecast(weatherTarget, tempTarget) {
    this.weatherTarget = weatherTarget; //element DOM à remplacer pour la météo
    this.tempTarget = tempTarget; //element DOM à remplacer pour la temperature
  };

  /***********
   PROTOTYPE
   ***********/
  Forecast.prototype = function () {

    /***** GLOBALES *****/
    var wording = {
      en: {
        Rain: "rainy",
        Clear: "sunny",
        Clouds: "cloudy",
        Atmosphere: "misty",
        Snow: "snowy",
        Thunderstorm: "stormy",
        Extreme: "danger"
      },
      fr: {
        Rain: "pluvieux",
        Clear: "soleil",
        Clouds: "nuageux",
        Atmosphere: "brumeux",
        Snow: "enneigé",
        Thunderstorm: "tempête",
        Extreme: "danger"
      }
    };

    /***** PRIVATES *****/
    //==== utils ===
    var url = "https://api.de-jaune-et-de-bleu.com/Get/weather"; //url de requete API

    //==== funcs ====
    //Func pour enregistrer les datas AJAX
    var _storeWeatherData = function _storeWeatherData(data, self) {
      //rec
      self.weatherData = Forecast.prototype.weatherData = JSON.parse(data);
      //display
      _displayWeather.call(self);
    };

    //Func pour afficher la météo dans le DOM
    var _displayWeather = function _displayWeather() {
      //temperature
      this.tempTarget.innerHTML = " " + this.weatherData.main.temp.toFixed(1) + " <sup>\xB0</sup>C";
      //météo
      var weatherWording = void 0;
      var language = utils.getLanguage();

      switch (this.weatherData.weather[0].main) {
        case "Rain":
          weatherWording = wording[language]["Rain"];
          break;
        case "Clear":
          weatherWording = wording[language]["Clear"];
          break;
        case "Clouds":
          weatherWording = wording[language]["Clouds"];
          break;
        case "Atmosphere":
          weatherWording = wording[language]["Atmosphere"];
          break;
        case "Snow":
          weatherWording = wording[language]["Snow"];
          break;
        case "Thunderstorm":
          weatherWording = wording[language]["Thunderstorm"];
          break;
        case "Extreme":
          weatherWording = wording[language]["Extreme"];
          break;
        default:
          weatherWording = wording[language]["Rain"];
      }

      this.weatherTarget.innerHTML = weatherWording;
    };

    /***** PUBLIC *****/
    //==== funcs ====

    //Func pour récupérer l'API météo par Ajax
    var getWeather = function getWeather() {
      //variables
      var type = 'GET';
      var params = {};
      var self = this;

      //création de la promise Ajax
      var weatherRequest = new AjaxRequest(url, type);
      var weatherDeffered = weatherRequest.getRequestPromise(params);

      //resolution de promise
      weatherDeffered.then(function (success) {
        //Succès : fonction d'enregistrement des datas
        _storeWeatherData(success, self);
      }, function (error) {
        //Echec : message erreur
        window.console.log('Error : ' + error);
      });
    };

    return {
      getWeather: getWeather
    };
  }();

  //modules utils
  //------------------------------
  //==============================
  // MODULE SUBWAY
  //==============================
  //------------------------------

  var Subway = function Subway(subwayTarget) {
    this.subwayTargete = "test";
  };

  Subway.prototype = function () {

    /***** PUBLIC *****/
    //==== funcs ====
    //Func pour récupérer l'état du traffc de la ligne 2 du métro parisien
    var getSubwayTraffic = function getSubwayTraffic() {

      //variables
      var type = 'GET';
      var url = "https://api.de-jaune-et-de-bleu.com/Get/subway";
      var params = {};

      //création de la promise Ajax
      var trafficRequest = new AjaxRequest(url, type);
      var trafficDeffered = trafficRequest.getRequestPromise(params);

      //resolution de promise
      return trafficDeffered.then(function (success) {
        //success : affichage l'état du service
        var ratpApi = new Promise(function (resolve, rejected) {
          var traffic = JSON.parse(success);
          if (success) {
            resolve(traffic);
          } else {
            rejected("error");
          }
        });
        return ratpApi;
      }, function (error) {
        //Echec : message erreur
        window.console.log('Error : ' + error);
      });
    };

    return {
      getSubwayTraffic: getSubwayTraffic
    };
  }();

  //modules utils
  //------------------------------
  //==============================
  // MODULE HOUR
  //==============================
  //------------------------------

  //POTENTIEL SOURCEZ LEAK MEMORY : peut etre actualiser toutes les minutes et non secondes

  var TimeServer = function TimeServer(hour, min) {
    this.hour = hour;
    this.min = min;
  };

  TimeServer.prototype = function () {

    /***** GLOBALES *****/

    var wording = {
      en: {
        matin: "work work work",
        midi: "lunch time!",
        apresmidi: "let's meet!",
        soir: "have a drink?",
        nuit: "time to get rest",
        weekend: "back on Monday!",

        ouvert: "you are welcome",
        fermee: "see you soon"
      },
      fr: {
        matin: "au boulot !",
        midi: "la pause sacrée",
        apresmidi: "voyons-nous !",
        soir: "un verre ?",
        nuit: "un peu de repos",
        weekend: "de retour lundi !",

        ouvert: "bienvenue à l'atelier",
        fermee: "on se voit bientôt ?"
      }
    };

    /***** PRIVATES *****/
    //==== utils ===
    var timePromise; //promesse contenant le retour d'API "hour"

    //==== funcs ===
    //Func de balance entre la promise et son enregistrement (evite de charger l'API 2x)
    var _requestTimer = function _requestTimer() {
      return timePromise = timePromise === undefined ? _requestPromise() : timePromise;
    };

    //Func to get time from djdb server
    var _requestPromise = function _requestPromise() {
      //variables
      var type = 'GET';
      var url = "https://api.de-jaune-et-de-bleu.com/Get/hour";
      var params = {};
      var hourRequest = new AjaxRequest(url, type);
      return hourRequest.getRequestPromise(params);
    };

    //Func to create time
    var _checkTime = function _checkTime(i) {
      if (i < 10) {
        i = "0" + i; // add zero in front of numbers < 10
      }
      return i;
    };

    //Func pour calculer l'heure
    var _clock = function _clock(setTime) {
      //init time pour eviter un decalage avec la récupération async de l'heure serveur
      var initTime = setTime.setSeconds(new Date(Date.now()).getSeconds());

      //func de timer
      var clockMechanism = function clockMechanism(setTime) {
        var _this3 = this;

        //variables de temps
        var today = new Date(setTime);
        var now = new Date(Date.now());

        //recalcul
        var diff = now.getSeconds() - today.getSeconds();
        diff < 0 ? diff = 1 : diff = diff; //corriger le differentiel au changement de minute
        if (diff > 0) {

          //Affichage dans le DOM
          this.hour.innerHTML = _checkTime(today.getHours());
          this.min.innerHTML = _checkTime(today.getMinutes());

          today.setSeconds(today.getSeconds() + diff); //change secondes
        }

        //regeneration par seconde
        setTimeout(function () {
          clockMechanism.call(_this3, today);
        }, 100);
      };

      //init
      clockMechanism.call(this, initTime);
    };

    /***** PUBLICS *****/

    //Func pour récupérer l'heure brut depuis le server
    var getHour = function getHour() {
      return _requestTimer();
    };

    //Func pour afficher l'heure
    var displayHour = function displayHour() {
      var _this4 = this;

      //On récupère l'heure via une promise AJAX
      var defferedHour = _requestTimer();
      defferedHour.then(function (success) {
        //Success : on appelle la fonction de génération de l'-heure
        _clock.call(_this4, new Date(success));
      }, function (error) {
        window.console.log('Error : ' + error);
      });
    };

    //Func pour afficher ce qu'il se passe à l'atelier en fonction de l'heure
    var displayPeople = function displayPeople(target, welcome) {
      var stateTarget = target;
      var messageTarget = welcome;

      //on récupère l'heure => A FAIRE !! chainer une promise après recupe date pour gérer l'heure sans faire une double requete : si, this undefined alors, enregistrer la premiere promise en this et chainer les propriétés à cette promise. enfin stocker le resultat en this
      var defferedHour = _requestTimer();
      defferedHour.then(function (success) {
        //Success : on segmente l'heure

        var hourData = new Date(success);
        var hour = hourData.getHours(),
            day = hourData.getDay(),
            peopleContent,
            isWelcome;

        var language = utils.getLanguage();

        //Segmentation
        if (day === 0 || day === 6) {
          //weekend
          peopleContent = wording[language]["weekend"];
          isWelcome = wording[language]["fermee"];
        } else if (hour >= 9 && hour <= 11) {
          peopleContent = wording[language]["matin"];
          isWelcome = wording[language]["ouvert"];
        } else if (hour >= 12 && hour <= 13) {
          peopleContent = wording[language]["midi"];
          isWelcome = wording[language]["ouvert"];
        } else if (hour >= 14 && hour <= 18) {
          peopleContent = wording[language]["apresmidi"];
          isWelcome = wording[language]["ouvert"];
        } else if (hour >= 19 && hour <= 23) {
          peopleContent = wording[language]["soir"];
          isWelcome = wording[language]["fermee"];
        } else {
          peopleContent = wording[language]["nuit"];
          isWelcome = wording[language]["fermee"];
        }

        //display dans le DOM
        stateTarget.innerHTML = peopleContent;
        messageTarget.innerHTML = isWelcome;
      }, function (error) {
        window.console.log('Error : ' + error);
      });
    };

    return {
      displayHour: displayHour,
      displayPeople: displayPeople,
      getHour: getHour
    };
  }();

  //modules utils
  //------------------------------
  //==============================
  // MODULE BIKE SHARING
  //==============================
  //------------------------------

  var Velib = function Velib(bikeTarget) {
    this.bikeTarget = bikeTarget;
  };

  Velib.prototype = function () {
    /***** PUBLIC *****/
    //==== funcs ====
    var getInformation = function getInformation() {

      //variables
      var type = 'GET';
      var url = 'https://api.de-jaune-et-de-bleu.com/Get/bike';
      var params = {};
      var self = this;

      //création de la promise Ajax
      var velibRequest = new AjaxRequest(url, type);
      var velibDeffered = velibRequest.getRequestPromise(params);

      //resolution de promise
      velibDeffered.then(function (success) {
        //success : affichage du nombre de vélo dispos
        var velibStation = JSON.parse(success);
        self.bikeTarget.innerHTML = velibStation.available_bike_stands;
      }, function (error) {
        //Echec : message erreur
        window.console.log('Error : ' + error);
      });
    };

    return {
      getInformation: getInformation
    };
  }();

  //modules utils
  //modules content
  //------------------------------
  //==============================
  // MODULE GENERAL FOOTER
  //==============================
  //------------------------------

  //EXPORT
  function footer() {
    //meteo
    var weatherTarget = document.getElementById("footer-weather");
    var tempTarget = document.getElementById("footer-temp");

    var forecastObj = new Forecast(weatherTarget, tempTarget);
    forecastObj.getWeather();

    //velos
    var bikeTarget = document.getElementById("footer-bikes");
    var bikeObj = new Velib(bikeTarget);
    bikeObj.getInformation();

    //subway
    var subwayTarget = document.getElementById("footer-subway");
    var subwayObj = new Subway(subwayTarget);
    var deferedSubway = subwayObj.getSubwayTraffic();
    deferedSubway.then(function (data) {
      //validation etat traffic

      var wording = {
        en: {
          ok: "OK",
          nok: "disturbed",
          hs: "out for now"
        },
        fr: {
          ok: "à l'heure",
          nok: "retardée",
          hs: "hors service"
        }
      };

      var language = utils.getLanguage();

      //ajout de l'heure pour mettre le traffic HS
      var time = new Date();
      var state = data.result.slug;
      if (time.getHours() > 1 && time.getHours() < 6) {
        state = "hors-service";
      }

      if (state === "normal") {
        var etat = wording[language]["ok"];
      } else if (state === "hors-service") {
        var etat = wording[language]["hs"];
      } else {
        var etat = wording[language]["nok"];
      }

      subwayTarget.innerHTML = etat;
    });

    //heure
    var minutesTarget = document.getElementById("footer-minute");
    var hoursTarget = document.getElementById("footer-hour");
    var stateTarget = document.getElementById("footer-state");
    var welcomeTarget = document.getElementById("footer-welcome");
    var hourObj = new TimeServer(hoursTarget, minutesTarget);
    hourObj.displayHour();
    hourObj.displayPeople(stateTarget, welcomeTarget);
  }

  //------------------------------
  //------------------------------
  // MODULE GENERAL SELECT FORM
  //------------------------------
  //------------------------------

  var SelectForm = function SelectForm(el) {
    this.el = el;
    this.modalTool = el.querySelector('.c-select__tool');
    this.options = el.querySelectorAll('.c-select__values');
    this.placeholder = el.querySelector('.c-select__placeholder');
    this.placeholderInitWording = this.placeholder.innerHTML;

    //action
    this.init();
  };

  SelectForm.prototype = function () {

    //-----------------------
    // PRIVATE
    //-----------------------


    // fonction d'event au click sur la selectbox (private)
    var _selectboxCLick = function _selectboxCLick(e) {
      if (e.target.classList.contains('c-select__placeholder')) {
        e.stopPropagation();

        //remplacement option choisie par placeholder initial => pour savoir de quoi on parle
        if (this.el.classList.contains('c-select--is-open')) {
          // si on a déjà fait une selection
          if (this.selected) {
            this.placeholder.innerHTML = this.selected.textContent;
          }
        } else {
          this.placeholder.innerHTML = this.placeholderInitWording;
        }

        // on click sur un item
      } else if (e.target.classList.contains('c-select__value__wording')) {
        e.stopPropagation();

        // on efface l'ancienne selection
        if (this.selected) {
          this.selected.classList.remove('is-selected');
        }

        // rec du champs selectionné et ajout class de selectionné
        this.selected = e.target.parentNode;
        e.target.parentNode.classList.add("is-selected");

        this.el.querySelector('.c-select__tool [value="' + this.selected.getAttribute("data-value") + '"]').selected = true;

        //remplacement option choisie dans le placeholder
        this.placeholder.innerHTML = e.target.textContent;
      }

      // on ferme / ouvre
      this.el.classList.toggle('c-select--is-open');
    },


    // BIND DES EVENTS (private)
    _bindEvent = function _bindEvent(el) {

      var EventSelectboxClick = _selectboxCLick.bind(this);

      //bind du click sur la select box => event delegation
      el.addEventListener('click', EventSelectboxClick, false);
    };

    //-----------------------
    // PUBLIC
    //-----------------------

    // INIT DU MODULE (public)
    var init = function init() {

      _bindEvent.call(this, this.el);
    };

    return {
      init: init
    };
  }();

  //modules import
  //------------------------------
  //------------------------------
  // MODULE GENERAL CONTACT
  //------------------------------
  //------------------------------

  /**
  * Créer un nouveau formulaire
  * @class
  */
  var ContactForm = function ContactForm() {
    var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    this.el = el;
    this.next = el.querySelectorAll('.js-formnext');
    this.secure = false;

    this.data = {
      t: "msg",
      lang: utils.getLanguage()
    };
  };

  ContactForm.prototype = function () {

    //----------------
    // PRIVATE
    //----------------

    // Rooting des scope formulaire (private)
    var _sectionScopeRoute = function _sectionScopeRoute(section) {

      switch (section.getAttribute('data-section')) {
        case '1':
          _scopeName.call(this, section);
          break;

        case '2':
          _scopeBusinessType.call(this, section);
          break;

        case '3':
          _scopeBusinessName.call(this, section);
          break;

        case '4':
          _scopeMission.call(this, section);
          break;

        case '5':
          _scopeMissionDetail.call(this, section);
          break;

        case '6':
          _scopeMessage.call(this, section);
          break;

        case '7':
          _scopeEmail.call(this, section);
          break;
      }
    },


    // fonction du scope du name
    _scopeName = function _scopeName(scope) {
      var _this5 = this;

      // rec le nom dans la variable globale
      this.data.name = scope.querySelector('.js-formanswer').value;

      // poser le nom dans la phrase suivante
      [].slice.call(document.querySelectorAll('.formName')).forEach(function (el) {
        el.innerHTML = _this5.data.name;
      });

      _changeQuestionNumber.call(this, scope.getAttribute("data-section"));

      _animationNewScope.call(this, scope);
    },


    // fonction du scope du business type
    _scopeBusinessType = function _scopeBusinessType(scope) {

      // rec le nom dans la variable globale
      this.data.businessType = scope.querySelector('.js-formanswer').value;

      var wording = {
        en: {
          persoNom: "you",
          persoPronom: "me",
          companyNom: "this company",
          companyPronom: "us",
          orgaNom: "this organization",
          orgaPronom: "us"
        },
        fr: {
          persoNom: "vous",
          persoPronom: "me",
          companyNom: "cette entreprise",
          companyPronom: "nous",
          orgaNom: "cette organisation",
          orgaPronom: "nous"
        }
      };

      switch (this.data.businessType) {
        case "1":
          var businessNomination = wording[this.data.lang]["persoNom"];

          var businessPronoun = wording[this.data.lang]["persoPronom"];
          break;

        case "2":
          var businessNomination = wording[this.data.lang]["companyNom"];
          var businessPronoun = wording[this.data.lang]["companyPronom"];
          break;

        case "3":
          var businessNomination = wording[this.data.lang]["orgaNom"];
          var businessPronoun = wording[this.data.lang]["orgaPronom"];
          break;

        default:
          var businessNomination = wording[this.data.lang]["orgaNom"];
          var businessPronoun = wording[this.data.lang]["orgaPronom"];
          break;
      }

      // poser le nom dans la phrase suivante
      document.getElementById('businessNomination').innerHTML = businessNomination;
      document.getElementById('businessPronoun').innerHTML = businessPronoun;

      // changement numéro question
      _changeQuestionNumber.call(this, scope.getAttribute("data-section"));
      _animationNewScope.call(this, scope);
    },


    // fonction du scope du business name
    _scopeBusinessName = function _scopeBusinessName(scope) {

      // rec le nom dans la variable globale
      this.data.businessName = scope.querySelector('.js-formanswer').value;

      // changement numéro question
      _changeQuestionNumber.call(this, scope.getAttribute("data-section"));
      _animationNewScope.call(this, scope);
    },


    // fonction du scope de la mission
    _scopeMission = function _scopeMission(scope) {

      // rec le nom dans la variable globale
      this.data.mission = scope.querySelector('.js-formanswer').value;

      // affichage des détails de mission en fonction du choix de la mission
      var switcher = document.getElementById('form-switchMissionDetails');

      //reset style de la liste
      [].slice.call(switcher.querySelectorAll('li')).forEach(function (el) {
        el.style.display = "block";
      });

      //modif
      switch (this.data.mission) {
        case "1":
          [].slice.call(switcher.querySelectorAll('li:nth-child(-n+4)')).forEach(function (el) {
            el.style.display = "none";
          });
          break;

        case "2":
          [].slice.call(switcher.querySelectorAll('li:nth-child(n+5):nth-child(-n+6)')).forEach(function (el) {
            el.style.display = "none";
          });
          break;

        case "3":
          [].slice.call(switcher.querySelectorAll('li:nth-child(n+4):nth-child(-n+6)')).forEach(function (el) {
            el.style.display = "none";
          });
          break;

        case "4":
          [].slice.call(switcher.querySelectorAll('li:nth-child(n+5):nth-child(-n+6)')).forEach(function (el) {
            el.style.display = "none";
          });
          break;

        case "5":
          [].slice.call(switcher.querySelectorAll('li:nth-child(n+5):nth-child(-n+6)')).forEach(function (el) {
            el.style.display = "none";
          });
          break;

      }

      // changement numéro question
      _changeQuestionNumber.call(this, scope.getAttribute("data-section"));
      _animationNewScope.call(this, scope);
    },


    // fonction du scope du business name
    _scopeMissionDetail = function _scopeMissionDetail(scope) {

      // rec le nom dans la variable globale
      this.data.missionDetails = scope.querySelector('.js-formanswer').value;

      // changement numéro question
      _changeQuestionNumber.call(this, scope.getAttribute("data-section"));
      _animationNewScope.call(this, scope);
    },


    // fonction du scope du message
    _scopeMessage = function _scopeMessage(scope) {

      // rec le nom dans la variable globale
      this.data.message = scope.querySelector('.js-formanswer').value;

      // changement numéro question
      _changeQuestionNumber.call(this, scope.getAttribute("data-section"));
      _animationNewScope.call(this, scope);
    },


    // fonction du scope de l'email (private)
    _scopeEmail = function _scopeEmail(scope) {

      var formAnswer = scope.querySelector('.js-formanswer');
      var buttonNext = scope.querySelector('.js-formnext');
      var icoError = scope.querySelector('.js-formerror');

      /** fonction de validation email à la frappe */
      var validEmail = function validEmail() {
        if (_testEmail(formAnswer.value)) {
          formAnswer.classList.remove("contactform__answer--wrong");
          buttonNext.classList.remove("m-nodisplay");
          icoError.classList.add("m-nodisplay");

          formAnswer.removeEventListener('keyup', formAnswer, false);
        }
      };

      /** rec le nom dans la variable globale */
      if (_testEmail(formAnswer.value)) {
        this.data.email = formAnswer.value;
        formAnswer.classList.remove("contactform__answer--wrong");

        var ajaxForm = new AjaxRequest("https://api.de-jaune-et-de-bleu.com/Post/contact");
        ajaxForm.postRequestPromise(this.data).then(function (res) {
          console.log('message sent'); // mettre ici le passage au message d'envoi (ou non -> sauvegarde);
        });

        /** animation */
        _animationNewScope.call(this, scope);
      } else {

        buttonNext.classList.add("m-nodisplay");
        icoError.classList.remove("m-nodisplay");

        formAnswer.classList.add("contactform__answer--wrong");
        formAnswer.addEventListener('keyup', validEmail, false);
      }
    },


    // desactiver la touche enter sur le formulaire pour eviter envois non désirés (private)
    _disableEnterEventer = function _disableEnterEventer() {
      var _this6 = this;

      var answersInputs = this.el.querySelectorAll('.js-formanswer');

      this.el.addEventListener('keypress', function (e) {
        if (e.keyCode == 13 && !e.target.classList.contains("js-formanswerText")) {
          //enter hors textarea
          e.preventDefault();

          if (_this6.secure === true) {
            // simule le click pour envoyer la réponse
            e.target.blur(); //quiter le champs lors du click sur enter
            _sectionScopeRoute.call(_this6, utils.findAncestor(e.target, "contactform__group"));
          }
        }
      }, false);
    },


    // changer le numéro de la question (private)
    _changeQuestionNumber = function _changeQuestionNumber(num) {
      var firstItem = this.el.querySelector('.counter__item--first');
      firstItem.innerHTML = parseInt(num) + 1;
    },


    /**
    * fonction pour valider ecriture email (private)
    * @param {string} email - structure email à valider
    * @returns {boolean}
    */
    _testEmail = function _testEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },


    /**
     * _apparitionNextButton - apparition du bouton suivant (private)
     * @param  {nodelist} scope - scope courant
     * @param  {boolean} appear - apparition ou disparition
     */
    _nextButton = function _nextButton(scope, appear) {
      var buttonContainer = scope.querySelector('.js-formnext');
      var buttonShape = buttonContainer.querySelector('.ico-arrow-poly');

      buttonContainer.classList.remove("m-opty0");

      //scenario animation
      var animation = anime.timeline();
      animation.add({
        targets: buttonContainer,
        duration: 400,
        easing: "easeInCirc",
        opacity: [0, 1]
      }).add({
        targets: buttonShape,
        duration: 400,
        offset: "-=100",
        easing: [0, 1.18, .76, 1.32],
        translateX: [-60, 0],
        points: [{ value: "35,7 90,60 35,113" }, { value: "40,2 90,60 40,118" }, { value: "35,7 90,60 35,113" }]
      });

      if (appear) {
        animation.play();
      } else {
        animation.reverse();
      }
    },


    /**
     * _observer - fonction de création d'un observer (placement en utils ?) (private)
     * @param  {nodelist} el       - element à observe
     * @param  {callback} callback - callback à appliquer lorsque un changement est apparu
     */
    _observer = function _observer(el, callback) {

      // création d'un observer pour vérifier changement DOM listes
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          //Action
          callback(mutation, observer);
        });
      });

      //observation
      observer.observe(el, { childList: true, characterData: true, attributes: true });
    },


    /**
     * _observerSelect - callback pour observer (private)
     * @param  {type} mutation - mutation à observer
     * @param  {type} observer - objet observer
     */
    _observerSelect = function _observerSelect(mutation, observer) {

      var wording = {
        en: "- choose -",
        fr: "- choisir -"
      };

      if (mutation.target.innerHTML != wording[this.data.lang]) {
        _nextButton(utils.findAncestor(mutation.target, "contactform__group"), true);
        this.secure = true;
        observer.disconnect(); //fin
      }
    },


    /**
     * _enableAnswerObserver - fonction pour débuter l'observation des réponses  (private)
     */
    _enableAnswerObserver = function _enableAnswerObserver() {
      var _this7 = this;

      var inputs = this.el.querySelectorAll('.js-formanswer:not(select):not(textarea), .c-select__placeholder');

      var _loop = function _loop(i) {
        if (inputs[i].nodeName.toLowerCase() === "span") {

          //observer pour les listes (pas d'event sur les nodes de textes)
          _observer.call(_this7, inputs[i], _observerSelect.bind(_this7));
        } else {
          var j = 0;

          //event pour les inputs et txtarea
          inputs[i].addEventListener("input", function (e) {

            if (e.target.value.length === 0) {
              _nextButton(utils.findAncestor(inputs[i], "contactform__group"), false);
              _this7.secure = false;
            } else if (e.target.value.length === 1 && j < 1 || _this7.secure === false) {
              _nextButton(utils.findAncestor(inputs[i], "contactform__group"), true);
              _this7.secure = true;
            }

            // reset ancienne valeur
            j = e.target.value.length;
          }, false);
        }
      };

      for (var i = 0; i < inputs.length; i++) {
        _loop(i);
      }
    },


    /**
    * fonction d'animation des textes du formulaire (private)
    * @param {string} scope - scope à animer
    */
    _animationAppear = function _animationAppear(scope) {

      /** params texte */
      var animation = {};

      animation.writters = scope.querySelectorAll(".contactform__writter");
      animation.question = scope.querySelector(".js-question");
      animation.answer = scope.querySelector(".js-answer");
      animation.answerInput = scope.querySelector(".js-formanswer, .c-select__placeholder");

      /** decomposition char */
      utils.charming(animation.question, { classPrefix: "letter char" });
      animation.questionChars = animation.question.querySelectorAll('.letter');

      if (animation.answer !== null) {
        utils.charming(animation.answer, { classPrefix: "letter char" });
        animation.answerChars = animation.answer.querySelectorAll('.letter');
      }

      /** params animation */
      var animeParam = {
        letters: {
          speed: 26,
          duration: 50
        },
        writter: {
          duration: 1000,
          delay: 500
        }
      };

      scope.style.display = "block";

      /** animation timeline */
      var formAnimation = anime.timeline({ autoplay: true });
      formAnimation.add({ //apparition name
        targets: animation.writters[0],
        opacity: [0, 1],
        translateY: [50, 0],
        easing: "easeOutElastic",
        elasticity: 100,
        duration: animeParam.writter.duration,
        delay: animeParam.writter.delay
      }).add({ //apparition question
        targets: animation.questionChars,
        opacity: [0, 1],
        easing: "linear",
        duration: animeParam.letters.duration,
        delay: function delay(el, i) {
          return animeParam.letters.speed * (i + 1);
        }
      }).add({ //apparition 2e writter
        targets: animation.writters[1],
        opacity: [0, 1],
        translateY: [50, 0],
        easing: "easeOutElastic",
        elasticity: 100,
        duration: animeParam.writter.duration,
        delay: animeParam.writter.delay
      }).add({
        targets: animation.answerChars,
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 50,
        delay: function delay(el, i) {
          return animeParam.letters.speed * (i + 1);
        }
      }).add({ //apparition barre
        targets: animation.answerInput,
        scaleX: [0, 1],
        easing: "easeOutExpo",
        duration: 600,
        offset: '+=20',
        complete: function complete() {
          //Selection de l'input
          if (animation.answerInput) {
            if (animation.answerInput.nodeName.toLowerCase() === "input" || animation.answerInput.nodeName.toLowerCase() === "textarea") {
              // animation.answerInput.focus(); => recardre la page
              animation.answerInput.select();
            }
          }
        }
      });
    },


    /**
     * _animationNewScope - animation au fadeout après validation d'une étape
     * @param  {nodelist} scope scope a effacer
     */
    _animationNewScope = function _animationNewScope(scope) {

      this.secure = false;

      var tl = anime.timeline();
      tl.add({
        targets: scope,
        duration: 800,
        //    easing: [.3,-0.42,.81,.04],
        easing: "easeInSine",
        //elasticity: 400,
        // translateY: -70,
        translateY: [{ value: 70 }, { value: -70 }],
        opacity: 0,
        complete: function complete() {
          setTimeout(function () {
            scope.style.display = "none";
            _animationAppear(scope.nextElementSibling);
          }, 500);
        }
      });

      // tl.finished.then(()=>{
      //
      // });
    };

    //----------------
    // PUBLIC
    //----------------

    // fonction d'initialisation (public)
    var init = function init() {
      var _this8 = this;

      // detecter toutes les select box
      [].slice.call(document.querySelectorAll('.c-select')).forEach(function (el) {
        new SelectForm(el);
      });

      // click sur les étapes

      var _loop2 = function _loop2(i) {
        _this8.next[i].addEventListener('click', function (e) {

          // parent node pour avoir le scope de la question au dessus du bouton
          _sectionScopeRoute.call(_this8, utils.findAncestor(_this8.next[i], "contactform__group"));
        });
      };

      for (var i = 0; i < this.next.length; i++) {
        _loop2(i);
      }

      // desactiver l'envoi du formulaire sur enter
      _disableEnterEventer.call(this);

      //animation du contenu
      _animationAppear(this.el.querySelector(".contactform__group"));

      //apparition des boutons next
      _enableAnswerObserver.call(this);
    };

    return {
      init: init
    };
  }();

  var bundle = function () {

    // navigationUI (private)
    var navigation = {

      config: {
        navigationEl: document.querySelectorAll('.menu') || null,
        contactFormEl: document.getElementById('contactForm') || null

      },

      init: function init() {
        if (this.config.navigationEl != null) {
          // load and init module
          for (var i = 0; i < this.config.navigationEl.length; i++) {
            //pas de boucle ici nirmalement
            var navigation = new Navigation(this.config.navigationEl[i]);
            navigation.init();
          }

          return navigation;
        }
      }
    };

    // contact formulaire (private)
    var contactForm = {

      config: {
        contactFormEl: document.getElementById('contactForm') || null
      },

      init: function init() {
        if (this.config.contactFormEl != null) {
          // load and init module          var contactForm = new Navigation(this.config.navigationEl[i]);
          var contactForm = new ContactForm(this.config.contactFormEl);
          contactForm.init();
        }
      }
    };

    var BindUIActions = {

      config: {},

      init: function init() {
        this.config.navigation = navigation.init(); //bind navigation (closure)
        contactForm.init(); // contact
        // footer
        // introAnimation
        // scroller
        // animation texte
        // script Tag manager macro
      },

      resize: function resize() {
        var _this9 = this;

        window.addEventListener("resize", function () {

          //call tous les resizeEvent
          _this9.config.navigation.resize();

          //actualisation effective de la largeur écran apres resize
          if (window.innerWidth !== utils.viewportWidth) {
            utils.viewportWidth = window.innerWidth;
          }
        }, false);
      }
    };

    //----------------
    // Initilisation
    //----------------

    //INIT GLOBAL
    window.addEventListener("DOMContentLoaded", function (event) {

      footer();
      BindUIActions.init();
      BindUIActions.resize();

      // // Polyfill
      // if (!window.Promise) {
      //   window.Promise = Promise;
      // }

    }, false);
  }();
})();
//# sourceMappingURL=app.js.map
