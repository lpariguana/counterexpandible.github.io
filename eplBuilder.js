// - 18/01/2017 - eplBuilder

window.getEplBannerId = function () {
    if (typeof window.bannerId !== "undefined") {
        return window.bannerId;
    } else if (typeof bannerId !== "undefined") {
        return bannerId;
    }
    return null;
};

console.log("eplBuilder 2017");

var eplFormats = {
    ad: "Ad",
    bannerGenerico: "bannerGenerico",
    bannerSkin: "bannerSkin",
    layerGenerico: "layerGenerico",
    bannerLayer: "bannerLayer",
    layerBoton: "layerBoton",
    layerScroll: "layerScroll",
    anuncioPrevio: "anuncioPrevio",
    unionLayers: "unionLayers",
    expandibleMultiple: "expandibleMultiple",
    folding: "folding",
    expandiblePush: "expandiblePush",
    expandibleRollover: "expandibleRollover",
    takeover: "takeover",
    zocalo: "zocalo",
    tripleImpacto: "tripleImpacto",
    multipleImpacto: "multipleImpacto",
    quintupleImpacto: "quintupleImpacto",
    inline: "inline",
    inlineExpandible: "inlineExpandible",
    filmstrip: "filmstrip",
    videoCounterExpandible: "VideoCounterExpandible",
    videoPreview: "VideoPreview"
};

function eplBuilder() {

    function ext(padre) {
        function o() {
        }
        o.prototype = padre;
        return new o();
    }

    var eplMetrics = {
        COMPLETE: 1,
        EXPAND: 9,
        SHRINK: 10,
        CLOSE: 8,
        VIDEO_START: 3,
        VIDEO_STOP: 4,
        VIDEO_SOUND_ON: 7,
        VIDEO_SOUND_OFF: 6,
        VIDEO_RESTART: 5,
        VIDEO_CUARTO1: 16,
        VIDEO_CUARTO2: 17,
        VIDEO_CUARTO3: 18
    };

    // EXTRAS - INICIO
    /*-----------------------------------------------------------------------------------------------------------*/

    function eplTween(obj, prop, final, duration, easingFunc, onComplete) {
        var start = parseInt(obj.style[prop].replace("px", ""));
        var change = final - start;
        var startTime = new Date();

        var t = setInterval(update, 24);

        onComplete = onComplete || null;

        var that = this;
        function update() {
            var time = new Date() - startTime;
            if (time < duration) {
                obj.style[prop] = easingFunc(time, start, change, duration) + "px";
            } else {
                time = duration;
                obj.style[prop] = easingFunc(time, start, change, duration) + "px";
                clearInterval(t);
                (onComplete !== null) ? onComplete() : console.log("no hay callback");
            }
        }
    }
    eplTween.easeInQuad = function (t, b, c, d) {
        return c * (t /= d) * t + b;
    };
    eplTween.easeOutQuad = function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    };


    /*-----------------------------------------------------------------------------------------------------------*/
    // EXTRAS - FIN

    //clase para componente video standard
    function videoStandard(_id, _trackComplete, _callBackEnd) {
        this.video = document.getElementById(_id) || parent.document.getElementById(_id);
        this.trackComplete = _trackComplete;
        this.callBackEnd = (typeof _callBackEnd === "undefined" || _callBackEnd === null) ? null : _callBackEnd;
        this.isLoop = this.video.getAttribute("loop") !== null ? true : false;
        this.isCuartil1 = true;
        this.isCuartil2 = true;
        this.isCuartil3 = true;
        this.isVideoComplete = false;

        this.METRICA_CUARTO1 = 16;
        this.METRICA_CUARTO2 = 17;
        this.METRICA_CUARTO3 = 18;
        this.adr = (typeof parent.eplDoc !== "undefined") ? parent.eplDoc.eplTH4.getAdR(window.getEplBannerId()) : "ADR"; // objeto que es necesario para registrar acciones de cuartiles
        this.ct = null;
        this.init = function () {
            var that = this;
            if (this.isLoop) {
                this.video.removeAttribute("loop");
            }
            this.ct = document.createElement("a");
            this.ct.setAttribute("onclick", "window.open(window.clickTag); return false");
            this.ct.href = "#!";
            var tipoMedida = "";
            if (this.video.style["width"].indexOf("px") !== -1) {
                tipoMedida = "px";
            }
            if (this.video.style["width"].indexOf("%") !== -1) {
                tipoMedida = "%";
            }
            var vAncho = parseInt(this.video.style["width"].replace(tipoMedida, ""));
            var vAlto = parseInt(this.video.style["height"].replace(tipoMedida, ""));
            this.ct.style["width"] = vAncho + tipoMedida;
            var r = (100 * 25) / (window.innerHeight<2?parent.window.innerHeight:window.innerHeight);
            var r2 = 100 - r;
            this.ct.style["height"] = ((tipoMedida === "%") ? r2 : (vAlto - 25)) + tipoMedida;
            this.ct.style["position"] = "absolute";
            this.ct.style["z-index"] = "99999";
            this.ct.style["left"] = "0px";
            this.ct.style["top"] = "0px";
            this.video.parentNode.appendChild(this.ct);

            this.video.onplay = function () {
                if (that.isVideoComplete === false) {
                    console.log("Video Play " + that.video.id);
                    if (typeof parent.eplDoc !== "undefined") {
                        parent.eplDoc.eplTH.start(window.getEplBannerId());
                    }
                } else {
                    console.log("Video Restart " + that.video.id);
                    if (typeof parent.eplDoc !== "undefined") {
                        parent.eplDoc.eplTH.restart(window.getEplBannerId());
                    }
                }
            };
            this.video.onpause = function () {
                console.log("Video Pause " + that.video.id);
                if (typeof parent.eplDoc !== "undefined") {
                    parent.eplDoc.eplTH.stop(window.getEplBannerId());
                }
            };
            this.video.onended = function () {
                console.log("Video Ended: " + that.video.id);
                that.isVideoComplete = true;

                if (that.callBackEnd !== null) {
                    that.callBackEnd();
                }//llamada a la funcion callback al terminar, antes de ejecutar cualquier accion de complete

                //si es loop emitimos la metrica de complete siempre pero no vamos a analizar si hay que hacer un EPL.adComplete ni nada mas. loop gana siempre
                if (that.isLoop === true) {
                    console.log("Video Loop: " + that.video.id);
                    that.video.play();
                    if (typeof parent.eplDoc !== "undefined") {
                        parent.eplDoc.eplTH.anuncioCompleto(window.getEplBannerId(), 1);//la metricas siempre la emitimos pero no el EPL.adComplete();
                    }
                    return; // salimos de la funcion ya no vamos a ejecutar el EPL.adComplete();
                }

                if (that.trackComplete === true) {
                    console.log("Video Complete (llamada a EPL.adComplete): " + that.video.id);
                    EPL.adComplete();
                }
            };
            this.video.onvolumechange = function () {
                if (that.video.muted === true) {
                    console.log("Video Sonido Off " + that.video.id);
                    parent.eplDoc.eplTH.soundOff(window.getEplBannerId());
                } else if (that.video.volume > 0) {
                    console.log("Video Sonido On " + that.video.id);
                    parent.eplDoc.eplTH.soundOn(window.getEplBannerId());
                }
            };
            this.video.ontimeupdate = function () {
                var t = Math.round(that.video.currentTime);
                if (that.isCuartil1 === true) {
                    if (t >= Math.round(that.video.duration / 4)) {
                        //metrica de 1/4
                        that.isCuartil1 = false;
                        console.log("Video " + that.video.id + " metrica 1/4");
                        parent.eplDoc.eplTH4.registrarAccion(that.adr, that.METRICA_CUARTO1);//1/4
                    }
                }
                if (that.isCuartil2 === true) {
                    if (t >= Math.round(that.video.duration / 2)) {
                        //metrica de 1/2
                        that.isCuartil2 = false;
                        console.log("Video " + that.video.id + " metrica 1/2");
                        parent.eplDoc.eplTH4.registrarAccion(that.adr, that.METRICA_CUARTO2);//2/4
                    }
                }
                if (that.isCuartil3 === true) {
                    if (t >= Math.round((that.video.duration / 4) * 3)) {
                        //metrica de 3/4
                        that.isCuartil3 = false;
                        console.log("Video " + that.video.id + " metrica 3/4");
                        parent.eplDoc.eplTH4.registrarAccion(that.adr, that.METRICA_CUARTO3);//3/4
                    }
                }
            };
            //
        };
    }
    function videoStandardController() {
        this.videoCount = 0;
        this.videos = [];

        this.addVideo = function (_id, _trackComplete, _callBackEnd) {
            if (this.videoCount > 4) {
                console.log("Maximo de videos alcanzado (5)");
            } else {
                var v = new videoStandard(_id, _trackComplete, _callBackEnd);
                this.videos[this.videoCount] = v;
                this.videoCount++;
                v.init();
            }
        };
        this.getVideo = function (_index) {
            if (typeof this.videos[_index] !== "undefined" && this.videos[_index] !== null) {
                return this.videos[_index];
            } else {
                console.log("El video no existe");
                return;
            }
        };
        this.removeVideo = function (_index) {
            if (this.videos[_index] !== null) {
                this.videos.splice(_index, 1);
                this.videoCount--;
            } else {
                console.log("No es posible eliminar el video ya que no existe");
            }
        };
        this.reloadVideo = function (_index) {
            if (typeof this.videos[_index] !== "undefined" && this.videos[_index] !== null) {
                this.videos[_index].video.load();
            } else {
                console.log("El video no se puede recargar ya que no existe");
            }
        };
        this.reloadAllVideos = function () {
            if (this.videos.length > 0) {
                for (var i = 0; i < this.videos.length; i++) {
                    this.videos[i].video.load();
                    this.videos[i].video.play();
                }
            } else {
                console.log("No hay videos añadidos a la lista para recargar");
            }
        };
        this.pauseVideo = function (_index) {
            if (typeof this.videos[_index] !== "undefined" && this.videos[_index] !== null) {
                this.videos[_index].video.pause();
            } else {
                console.log("El video no se puede pausar ya que no existe");
            }
        };
        this.playVideo = function (_index) {
            if (typeof this.videos[_index] !== "undefined" && this.videos[_index] !== null) {
                this.videos[_index].video.play();
            } else {
                console.log("El video no se puede reproducir ya que no existe");
            }
        };
        this.pauseAllVideos = function () {
            if (this.videos.length > 0) {
                for (var i = 0; i < this.videos.length; i++) {
                    this.videos[i].video.pause();
                }
            } else {
                console.log("No hay videos añadidos a la lista para pausar");
            }
        };
        this.stopAllVideos = function () {
            if (this.videos.length > 0) {
                for (var i = 0; i < this.videos.length; i++) {
                    this.videos[i].video.load();
                    this.videos[i].video.pause();
                }
            }
        };
        this.playAllVideos = function () {
            if (this.videos.length > 0) {
                for (var i = 0; i < this.videos.length; i++) {
                    this.videos[i].video.play();
                }
            }
        };
    }

    //clase para componente video youtube
    function videoYoutube(_idDiv, _idVideo, _ancho, _alto, _autoPlay, _sound, _loop, _trackComplete, _callBackEnd) {
        this.idDiv = _idDiv;
        this.idVideo = _idVideo;
        this.ancho = (_ancho < 200) ? 200 : _ancho;
        this.alto = (_alto < 200) ? 200 : _alto;
        this.autoPlay = (typeof _autoPlay === "undefined" || _autoPlay === null) ? false : _autoPlay;
        this.initSound = _sound;
        this.isLoop = _loop;
        this.trackComplete = _trackComplete;
        this.callBackEnd = (typeof _callBackEnd === "undefined" || _callBackEnd === null) ? null : _callBackEnd;
        this.isVideoComplete = false;

        this.isCuartil1 = true;
        this.isCuartil2 = true;
        this.isCuartil3 = true;

        this.METRICA_CUARTO1 = 16;
        this.METRICA_CUARTO2 = 17;
        this.METRICA_CUARTO3 = 18;

        this.adr = (typeof parent.eplDoc !== "undefined") ? parent.eplDoc.eplTH4.getAdR(window.getEplBannerId()) : "ADR"; // objeto que es necesario para registrar acciones de cuartiles

        this.setVariablePlayer = function (_idDiv) {
            if (typeof window["playerYoutube" + _idDiv] !== "undefined" && window["playerYoutube" + _idDiv] !== null) {
                console.log("No es posible setear la variable para el player ya que existe la misma");
            } else {
                window["playerYoutube" + _idDiv] = "memoria recervada para variable Player";
            }

        };
        this.getVariablePlayer = function (_idDiv) {
            if (typeof window["playerYoutube" + _idDiv] !== "undefined" && window["playerYoutube" + _idDiv] !== null) {
                return window["playerYoutube" + _idDiv];
            } else {
                console.log("No existe el player de youtube al que se quiere acceder");
                return;
            }
        };

        this.flagSonido = this.initSound;

        var that = this;
        this.setOnPlayerReadyEvent = function (event) {
            var d = Math.round(that.playerObject.getDuration());
            console.log("duration: " + d);

            var counter = setInterval(function () {

                //CUARTILES YOUTUEBE
                var t = Math.round(that.playerObject.getCurrentTime());

                if (that.isCuartil1 === true) {
                    if (t >= Math.round(d / 4)) {
                        //metrica de 1/4
                        that.isCuartil1 = false;
                        console.log("Video " + that.idDiv + " metrica 1/4");
                        if (typeof parent.eplDoc !== "undefined") {
                            parent.eplDoc.eplTH4.registrarAccion(that.adr, that.METRICA_CUARTO1);
                        }//1/4
                    }
                }
                if (that.isCuartil2 === true) {
                    if (t >= Math.round(d / 2)) {
                        //metrica de 1/2
                        that.isCuartil2 = false;
                        console.log("Video " + that.idDiv + " metrica 1/2");
                        if (typeof parent.eplDoc !== "undefined") {
                            parent.eplDoc.eplTH4.registrarAccion(that.adr, that.METRICA_CUARTO2);
                        }//2/4
                    }
                }
                if (that.isCuartil3 === true) {
                    if (t >= Math.round((d / 4) * 3)) {
                        //metrica de 3/4
                        that.isCuartil3 = false;
                        console.log("Video " + that.idDiv + " metrica 3/4");
                        if (typeof parent.eplDoc !== "undefined") {
                            parent.eplDoc.eplTH4.registrarAccion(that.adr, that.METRICA_CUARTO3);
                        }//3/4
                    }
                }

                //SONIDO YOUTUBE
                var sactual = that.playerObject.isMuted() ? false : true;
                if (that.flagSonido !== sactual) {
                    if (sactual === true) {
                        console.log("Sonido On: " + that.idDiv);
                        if (typeof parent.eplDoc !== "undefined") {
                            parent.eplDoc.eplTH.soundOn(window.getEplBannerId());
                        }
                    } else {
                        console.log("Sonido Off: " + that.idDiv);
                        if (typeof parent.eplDoc !== "undefined") {
                            parent.eplDoc.eplTH.soundOff(window.getEplBannerId());
                        }
                    }
                    that.flagSonido = sactual;
                }

            }, 1000);



            //auto play
            if (that.autoPlay === true) {
                event.target.playVideo();
                console.log("Play: " + that.idDiv);
                if (typeof parent.eplDoc !== "undefined") {
                    parent.eplDoc.eplTH.start(window.getEplBannerId());
                }
            }
            //auto sound
            if (that.initSound === true) {
                event.target.unMute();
                console.log("Sonido On: " + that.idDiv);
                if (typeof parent.eplDoc !== "undefined") {
                    parent.eplDoc.eplTH.soundOn(window.getEplBannerId());
                }
            } else {
                event.target.mute();
                console.log("Sonido Off: " + that.idDiv);
                if (typeof parent.eplDoc !== "undefined") {
                    parent.eplDoc.eplTH.soundOff(window.getEplBannerId());
                }
            }
        };

        this.setOnPlayerStateChange = function (event) {
            //play
            if (event.data === 1) {
                if (that.isVideoComplete === false) {
                    console.log("Play:" + that.idDiv);
                    if (typeof parent.eplDoc !== "undefined") {
                        parent.eplDoc.eplTH.start(window.getEplBannerId());
                    }
                } else {
                    console.log("Restart:" + that.idDiv);
                    if (typeof parent.eplDoc !== "undefined") {
                        parent.eplDoc.eplTH.restart(window.getEplBannerId());
                    }
                }
            }
            //pause
            if (event.data === 2) {
                console.log("Pause: " + that.idDiv);
                if (typeof parent.eplDoc !== "undefined") {
                    parent.eplDoc.eplTH.stop(window.getEplBannerId());
                }
            }
            //finalizado
            if (event.data === 0) {
                console.log("Ended: " + that.idDiv);
                that.isVideoComplete = true;

                if (that.callBackEnd !== null) {
                    that.callBackEnd();
                }//llamada a la funcion callback al terminar, antes de ejecutar cualquier accion de complete

                //si es loop emitimos la metrica de complete siempre pero no vamos a analizar si hay que hacer un EPL.adComplete ni nada mas. loop gana siempre
                if (that.isLoop === true) {
                    console.log("Loop: " + that.idDiv);
                    event.target.seekTo(0);
                    if (typeof parent.eplDoc !== "undefined") {
                        parent.eplDoc.eplTH.anuncioCompleto(window.getEplBannerId(), 1);//la metricas siempre la emitimos pero no el EPL.adComplete();
                    }
                    return; // salimos de la funcion ya no vamos a ejecutar el EPL.adComplete();
                }

                if (that.trackComplete === true) {
                    console.log("Video Complete (llamada a EPL.adComplete): " + that.idDiv);
                    EPL.adComplete();
                }
            }
        };

        this.setVariablePlayer(this.idDiv);
        this.playerObject = this.getVariablePlayer(this.idDiv);



    }
    function videoYoutubeController() {
        this.isApiLoaded = false;
        this.videos = [];
        this.videoCount = 0;

        this.loadYoutubeApi = function () {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            console.log("api youtube cargada");
            this.isApiLoaded = true;
        };

        this.addVideo = function (_idDiv, _idVideo, _ancho, _alto, _autoPlay, _sound, _loop, _trackComplete, _callBackEnd) {
            var v = new videoYoutube(_idDiv, _idVideo, _ancho, _alto, _autoPlay, _sound, _loop, _trackComplete, _callBackEnd);
            this.videos[this.videoCount] = v;
            this.videoCount++;
        };
        this.getVideo = function (_index) {
            if (typeof this.videos[_index] !== "undefined" && this.videos[_index] !== null) {
                return this.videos[_index];
            } else {
                console.log("No es posible obtener el video ya que no existe");
            }
        };
        this.stopAllVideos = function () {
            if (this.videos.length > 0) {
                for (a in this.videos) {
                    this.videos[a].playerObject.stopVideo();
                }
            }
        };
        this.playAllVideos = function () {
            if (this.videos.length > 0) {
                for (a in this.videos) {
                    this.videos[a].playerObject.playVideo();
                }
            }
        };


        this.init = function () {
            var that = this;
            if (this.isApiLoaded === false) {
                this.loadYoutubeApi();
            }
            window.onYouTubePlayerAPIReady = function () {
                console.log("init api youtube");
                for (a in that.videos) {
                    that.videos[a].playerObject = new YT.Player(that.videos[a].idDiv, {
                        height: that.videos[a].alto,
                        width: that.videos[a].ancho,
                        videoId: that.videos[a].idVideo,
                        events: {
                            onReady: that.videos[a].setOnPlayerReadyEvent,
                            onStateChange: that.videos[a].setOnPlayerStateChange
                        }
                    });
                    //console.log("duracion: " + that.videos[a].playerObject.getDuration()); 
                }

            };
        };
    }

    //FORMATOS - comienzo
    //AD clase base para formatos
    /*-----------------------------------------------------------------------------------------------------------*/
    function Ad() {
        this.isComplete = false;
        this.videoController = new videoStandardController();
        this.videoControllerYoutube = new videoYoutubeController();
        this.adType = this.constructor.name;
        //this.setResponsive();
    }
    Ad.prototype.getBannerId = function () {
        return window.getEplBannerId();
    };
    Ad.prototype.setVideo = function (vid, trackC, callB) {
        this.videoController.addVideo(vid, trackC, callB);
    };
    Ad.prototype.setVideoYoutube = function (_idDiv, _idVideo, _ancho, _alto, _autoPlay, _sound, _loop, _trackComplete, _callBackEnd) {
        this.videoControllerYoutube.addVideo(_idDiv, _idVideo, _ancho, _alto, _autoPlay, _sound, _loop, _trackComplete, _callBackEnd);
    };
    Ad.prototype.initYoutubeVideos = function () {
        this.videoControllerYoutube.init();
    };
    Ad.prototype.deleteAd = function () {
        this.videoController.pauseAllVideos();
        var a = parent.document.getElementById(window.name);
        a.parentNode.removeChild(a);
    };
    Ad.prototype.adComplete = function () {
        console.log("anuncio Completo " + this.adType);
        this.isComplete = true;
        parent.eplDoc.eplTH.anuncioCompleto(this.getBannerId(), 1);
    };
    Ad.prototype.adCustomAction = function (id) {
        console.log("accion custom [" + id + "] " + this.adType);
        console.log(this.getBannerId());
        parent.eplDoc.eplTH.customAction(this.getBannerId(), id);
    };
    Ad.prototype.adStartTimer = function () {
        console.log("Start Timer " + this.getBannerId() + " " + this.adType);
        parent.eplDoc.eplTH.timerStart(this.getBannerId());
    };
    Ad.prototype.adStopTimer = function () {
        console.log("Stop Timer " + this.getBannerId() + " " + this.adType);
        parent.eplDoc.eplTH.timerStop(this.getBannerId());
    };
    //Funcion para mediaquerys - parametro json con resolucion en ancho y como comportarce ej: {}
    Ad.prototype.setMediaQuery = function (_resolutions) {
        var ifrId = window.name;
        var ifr = window.parent.document.getElementById(ifrId);
        var top = window.parent;

        var styleQuery = document.createElement("style");
        styleQuery.type = "text/css";

        function applyResolution(_media) {
            var str = "@media screen and (max-width: " + _media.wScreen + "px) {#" + ifrId + "{width: " + _media.wAd + "px !important; height: " + _media.hAd + "px !important;}}";
            styleQuery.innerHTML += str;
        }

        for (var q in _resolutions) {
            applyResolution(_resolutions[q]);
        }

        parent.document.head.appendChild(styleQuery);

        /*top.addEventListener("resize", function(){
         console.log("1");
         });*/
    };
    Ad.prototype.setResponsive = function () {
        if (typeof window.eplMediaResponsive !== "undefined" && window.eplMediaResponsive !== null) {
            this.setMediaQuery(window.eplMediaResponsive);
        } else {
            console.log("No hay resoluciones definidas para responsive");
        }
    };

    /*-----------------------------------------------------------------------------------------------------------*/

    //Banner Generico
    /*-----------------------------------------------------------------------------------------------------------*/
    function BannerGenerico() {
        Ad.call(this);
    }
    BannerGenerico.prototype = ext(Ad.prototype);
    BannerGenerico.prototype.constructor = BannerGenerico;
    /*BannerGenerico.prototype.setResponsive = function(){
     var ifrId = window.name;
     var ifr = window.parent.document.getElementById(ifrId);
     var top = window.parent;
     
     var initialTopW = top.innerWidth;
     var initialTopH = top.innerHeight;
     
     var initialAdW = parseInt(ifr.style["width"].replace("px", ""));
     var initialAdH = parseInt(ifr.style["height"].replace("px", ""));
     
     top.onresize = function(){
     var newTopW = top.innerWidth;
     var newTopH = top.innerHeight;
     
     var newAdW = (newTopW*initialAdW)/initialTopW;
     var newAdH = (newTopH*initialAdH)/initialTopH;
     
     ifr.style["width"] = Math.round(newAdW)+"px";
     ifr.style["height"] = Math.round(newAdH)+"px";
     
     console.log("resize top window");
     };
     
     };*/

    /*-----------------------------------------------------------------------------------------------------------*/

    //Banner con Skin
    /*-----------------------------------------------------------------------------------------------------------*/
    function BannerSkin() {
        Ad.call(this);
    }
    BannerSkin.prototype = ext(Ad.prototype);
    BannerSkin.prototype.constructor = BannerSkin;
    BannerSkin.prototype.adShowSkin = function (id, fixed) {
        if (fixed) {
            parent.document.body.style['background-attachment'] = 'fixed';
        } else {
            parent.document.body.style['background-attachment'] = 'scroll';
        }
        parent.eplShowSkin(this.getBannerId(), id);
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Layer Generico
    /*-----------------------------------------------------------------------------------------------------------*/
    function LayerGenerico() {
        Ad.call(this);
    }
    LayerGenerico.prototype = ext(Ad.prototype);
    LayerGenerico.prototype.constructor = LayerGenerico;

    LayerGenerico.prototype.adComplete = function () {
        console.log("anuncio Completo " + this.adType);
        this.isComplete = true;
        parent.eplHideLayer(this.getBannerId(), 1);
        this.deleteAd();
    };
    LayerGenerico.prototype.adClose = function () {
        console.log("cerrar anuncio" + this.adType);
        parent.eplHideLayer(this.getBannerId());
        this.deleteAd();
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Banner a Layer
    function BannerLayer() {
        Ad.call(this);
    }
    BannerLayer.prototype = ext(Ad.prototype);
    BannerLayer.prototype.constructor = BannerLayer;

    BannerLayer.prototype.adComplete = function () {
        console.log("anuncio Completo" + this.adType);
        this.isComplete = true;
        parent.eplAMB2LHideLayer(this.getBannerId(), 1);
    };
    BannerLayer.prototype.adClose = function () {
        console.log("cerrar anuncio " + this.adType);
        parent.eplAMB2LHideLayer(this.getBannerId());
    };
    BannerLayer.prototype.adExpand = function () {
        console.log("expandir anuncio " + this.adType);
        parent.eplAMB2LShowLayer(this.getBannerId());
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Layer a Boton
    /*-----------------------------------------------------------------------------------------------------------*/
    function LayerBoton() {
        Ad.call(this);
    }
    LayerBoton.prototype = ext(Ad.prototype);
    LayerBoton.prototype.constructor = LayerBoton;

    LayerBoton.prototype.adComplete = function () {
        console.log("anuncio Completo " + this.adType);
        this.isComplete = true;
        parent.eplSwapButton(this.getBannerId(), 1);
    };
    LayerBoton.prototype.adClose = function () {
        console.log("cerrar anuncio " + this.adType);
        parent.eplSwapButton(this.getBannerId());
    };
    /*-----------------------------------------------------------------------------------------------------------*/


    //Layer con Scroll
    /*-----------------------------------------------------------------------------------------------------------*/
    function LayerScroll() {
        LayerGenerico.call(this);
    }
    LayerScroll.prototype = ext(LayerGenerico.prototype);
    LayerScroll.prototype.constructor = LayerScroll;
    LayerScroll.prototype.adComplete = function () {
        console.log("anuncio Completo " + this.adType);
        this.isComplete = true;
        parent.eplDoc.eplTH.anuncioCompleto(this.getBannerId(), 1);
    };

    /*-----------------------------------------------------------------------------------------------------------*/

    //Anuncio Previo
    /*-----------------------------------------------------------------------------------------------------------*/
    function AnuncioPrevio() {
        LayerGenerico.call(this);
    }
    AnuncioPrevio.prototype = ext(LayerGenerico.prototype);
    AnuncioPrevio.prototype.constructor = AnuncioPrevio;

    AnuncioPrevio.prototype.adComplete = function () {
        console.log("anuncio Completo " + this.adType);
        this.isComplete = true;
        parent.eplHideLayer(this.getBannerId());
    };
    AnuncioPrevio.prototype.adClose = function () {
        console.log("cerrar anuncio " + this.adType);
        parent.eplPVExitLayer(this.getBannerId(), 1);
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Union de Layers
    /*-----------------------------------------------------------------------------------------------------------*/
    function UnionLayers() {
        Ad.call(this);
    }
    UnionLayers.prototype = ext(Ad.prototype);
    UnionLayers.prototype.constructor = UnionLayers;

    UnionLayers.prototype.adComplete = function () {
        console.log("anuncio Completo " + this.adType);
        this.isComplete = true;
        parent.eplHideCenterLayer(this.getBannerId(), 1);
    };
    UnionLayers.prototype.adJoin = function () {
        console.log("join layers " + this.adType);
        parent.eplJoinLayers(this.getBannerId());
    };
    UnionLayers.prototype.adClose = function () {
        console.log("cerrar anuncio " + this.adType);
        parent.eplHideLeftRightLayers(this.getBannerId());
        parent.eplHideCenterLayer(this.getBannerId());
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Expandible Multiple
    /*-----------------------------------------------------------------------------------------------------------*/
    function ExpandibleMultiple() {
        Ad.call(this);
    }
    ExpandibleMultiple.prototype = ext(Ad.prototype);
    ExpandibleMultiple.prototype.constructor = ExpandibleMultiple;

    ExpandibleMultiple.prototype.adComplete = function () {
        console.log("anuncio completo " + this.adType);
        this.isComplete = true;
        parent.eplHBVShrinkLayer(this.getBannerId(), 1);
    };
    ExpandibleMultiple.prototype.adShrink = function () {
        console.log("replegar anuncio " + this.adType);
        parent.eplHBVShrinkLayer(this.getBannerId());
    };
    ExpandibleMultiple.prototype.adExpand = function () {
        console.log("expandir anuncio " + this.adType);
        parent.eplHBVExpandLayer(this.getBannerId());
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Folding
    /*-----------------------------------------------------------------------------------------------------------*/
    function Folding() {
        this.isAnimating = false;
    }
    Folding.prototype = ext(ExpandibleMultiple.prototype);
    Folding.prototype.constructor = Folding;

    Folding.prototype.setImages = function (im1, im2, im3, im4, im5, im6) {
        Folding.prototype.img1 = document.getElementById(im1);
        Folding.prototype.img2 = document.getElementById(im2);
        Folding.prototype.img3 = document.getElementById(im3);
        Folding.prototype.img4 = document.getElementById(im4);
        Folding.prototype.img5 = document.getElementById(im5);
        Folding.prototype.img6 = document.getElementById(im6);

        Folding.prototype.img1.width = "0";
        Folding.prototype.img2.width = "0";
        Folding.prototype.img3.width = "0";
        Folding.prototype.img4.width = "0";
        Folding.prototype.img5.width = "0";
        Folding.prototype.img6.width = "0";
    };
    Folding.prototype.initAnimation = function (fps) {
        Folding.prototype.img1.style["display"] = "block";
        Folding.prototype.img2.style["display"] = "block";
        Folding.prototype.img3.style["display"] = "block";
        Folding.prototype.img4.style["display"] = "block";
        Folding.prototype.img5.style["display"] = "block";
        Folding.prototype.img6.style["display"] = "block";

        if (!Folding.prototype.isAnimating) {
            Folding.prototype.isAnimating = true;
            var v = (typeof fps !== "undefined") ? parseInt(1000 / fps) : 24;
            function an(o) {
                var q = parseInt(o.width);
                var f = setInterval(function () {
                    q = q + 10;
                    o.width = q;
                    //console.log(q);
                    if (q >= 300) {
                        console.log(o.id + " terminado");
                        clearInterval(f);
                        document.body.dispatchEvent(new Event(o.id + "initEnded"));
                        return;
                    }
                }, v);
            }
            an(Folding.prototype.img1);
            document.body.addEventListener(Folding.prototype.img1.id + "initEnded", function () {
                an(Folding.prototype.img2);
            });
            document.body.addEventListener(Folding.prototype.img2.id + "initEnded", function () {
                an(Folding.prototype.img3);
            });
            document.body.addEventListener(Folding.prototype.img3.id + "initEnded", function () {
                an(Folding.prototype.img4);
            });
            document.body.addEventListener(Folding.prototype.img4.id + "initEnded", function () {
                an(Folding.prototype.img5);
            });
            document.body.addEventListener(Folding.prototype.img5.id + "initEnded", function () {
                an(Folding.prototype.img6);
            });
            document.body.addEventListener(Folding.prototype.img6.id + "initEnded", function () {
                Folding.prototype.isAnimating = false;
                console.log(Folding.prototype.isAnimating);
            });
        } else {
            console.log("Animando Folding.....espere");
        }

    };
    Folding.prototype.endAnimation = function (fps) {
        console.log(Folding.prototype.isAnimating);
        if (!Folding.prototype.isAnimating) {
            Folding.prototype.isAnimating = true;
            Folding.prototype.img1.width = "300";
            Folding.prototype.img2.width = "300";
            Folding.prototype.img3.width = "300";
            Folding.prototype.img4.width = "300";
            Folding.prototype.img5.width = "300";
            Folding.prototype.img6.width = "300";
            var v = (typeof fps !== "undefined") ? parseInt(1000 / fps) : 24;
            function an(o) {
                var q = parseInt(o.width);
                var f = setInterval(function () {
                    q = q - 10;
                    o.width = q;
                    //console.log(q);
                    if (q <= 0) {
                        console.log(o.id + " terminado");
                        clearInterval(f);
                        document.body.dispatchEvent(new Event(o.id + "ended"));
                        return;
                    }
                }, v);
            }
            an(Folding.prototype.img6);
            document.body.addEventListener(Folding.prototype.img6.id + "ended", function () {
                an(Folding.prototype.img5);
            });
            document.body.addEventListener(Folding.prototype.img5.id + "ended", function () {
                an(Folding.prototype.img4);
            });
            document.body.addEventListener(Folding.prototype.img4.id + "ended", function () {
                an(Folding.prototype.img3);
            });
            document.body.addEventListener(Folding.prototype.img3.id + "ended", function () {
                an(Folding.prototype.img2);
            });
            document.body.addEventListener(Folding.prototype.img2.id + "ended", function () {
                an(Folding.prototype.img1);
            });
            document.body.addEventListener(Folding.prototype.img1.id + "ended", function () {
                Folding.prototype.isAnimating = false;
                Folding.prototype.adComplete();
            });
        } else {
            console.log("Animando Folding.....espere");
        }

    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Expandible Push
    /*-----------------------------------------------------------------------------------------------------------*/
    function ExpandiblePush() {
        Ad.call(this);
    }
    ExpandiblePush.prototype = ext(Ad.prototype);
    ExpandiblePush.prototype.constructor = ExpandiblePush;

    ExpandiblePush.prototype.initExpanded = function () {
        if (typeof eplEBExpanded !== "undefined") {
            return eplEBExpanded;
        } else {
            console.log("Error: la variable eplEBExpanded no esta definida");
            return;
        }
    };
    ExpandiblePush.prototype.adShrink = function () {
        console.log("replegar anuncio " + this.adType);
        this.videoController.stopAllVideos();
        this.videoControllerYoutube.stopAllVideos();
        parent.eplEBShrinkLayer(this.getBannerId());
    };
    ExpandiblePush.prototype.adExpand = function () {
        console.log("expandir anuncio " + this.adType);
        this.videoController.playAllVideos();
        this.videoControllerYoutube.playAllVideos();
        parent.eplEBExpandLayer(this.getBannerId());
    };
    ExpandiblePush.prototype.adComplete = function () {
        console.log("anuncio completo " + this.adType);
        this.isComplete = true;
        parent.eplDoc.eplTH.anuncioCompleto(this.getBannerId(), 1);
        parent.eplEBShrinkLayer(this.getBannerId());
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Expandible Rollover
    /*-----------------------------------------------------------------------------------------------------------*/
    function ExpandibleRollover() {
        Ad.call(this);
    }
    ExpandibleRollover.prototype = ext(Ad.prototype);
    ExpandibleRollover.prototype.constructor = ExpandibleRollover;

    ExpandibleRollover.prototype.adExpand = function () {
        console.log("expandir anuncio " + this.adType);
        this.videoController.playAllVideos();
        this.videoControllerYoutube.playAllVideos();
        parent.eplAMROExpandLayer(this.getBannerId());
    };
    ExpandibleRollover.prototype.adShrink = function () {
        console.log("replegar anuncio " + this.adType);
        this.videoController.stopAllVideos();
        this.videoControllerYoutube.stopAllVideos();
        parent.eplAMROShrinkLayer(this.getBannerId());
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Takeover
    /*-----------------------------------------------------------------------------------------------------------*/
    function Takeover() {
        Ad.call(this);
    }
    Takeover.prototype = ext(Ad.prototype);
    Takeover.prototype.constructor = Takeover;

    Takeover.prototype.adComplete = function () {
        console.log("anuncio completo " + this.adType);
        this.isComplete = true;
        parent.eplTOExitLayer(0);
    };
    Takeover.prototype.adClose = function () {
        console.log("cerrar anuncio " + this.adType);
        parent.eplTOExitLayer(1);
    };
    Takeover.prototype.adExpand = function () {
        console.log("expandir anuncio " + this.adType);
        parent.eplTORestartShow(this.getBannerId());
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Zocalo
    /*-----------------------------------------------------------------------------------------------------------*/
    function Zocalo() {
        Ad.call(this);
    }
    Zocalo.prototype = ext(Ad.prototype);
    Zocalo.prototype.constructor = Zocalo;

    Zocalo.prototype.adComplete = function () {
        console.log("anuncio completo " + this.adType);
        this.isComplete = true;
        parent.eplZocaloShrink(1);
    };
    Zocalo.prototype.adExpand = function () {
        console.log("expandir anuncio " + this.adType);
        parent.eplZocaloExpand(this.getBannerId());
    };
    Zocalo.prototype.adShrink = function () {
        console.log("replegar anuncio " + this.adType);
        parent.eplZocaloShrink(0);
    };
    Zocalo.prototype.adClose = function () {
        console.log("cerrar anuncio " + this.adType);
        parent.eplZocaloClose();
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Triple Impacto
    /*-----------------------------------------------------------------------------------------------------------*/
    function TripleImpacto() {
        Ad.call(this);
    }
    TripleImpacto.prototype = ext(Ad.prototype);
    TripleImpacto.prototype.constructor = TripleImpacto;

    TripleImpacto.prototype.adComplete = function () {
        console.log("anuncio completo " + this.adType);
        this.isComplete = true;
        parent.epl2BLHideLayer(this.getBannerId(), 1);
    };
    TripleImpacto.prototype.adShowLeft = function () {
        console.log("show left " + this.adType);
        parent.epl2BLShowButton(this.getBannerId(), null);
    };
    TripleImpacto.prototype.adShowRight = function () {
        console.log("show right " + this.adType);
        parent.epl2BLShowBanner(this.getBannerId(), null);
    };
    TripleImpacto.prototype.adShowLayer = function () {
        console.log("show layer " + this.adType);
        parent.epl2BLShowLayer(this.getBannerId(), null);
    };

    TripleImpacto.prototype.adHideLeft = function () {
        console.log("hide left " + this.adType);
        parent.epl2BLHideBanner(this.getBannerId(), null);
    };
    TripleImpacto.prototype.adHideRight = function () {
        console.log("hide right " + this.adType);
        parent.epl2BLHideButton(this.getBannerId(), null);
    };
    TripleImpacto.prototype.adHideLayer = function () {
        console.log("hide layer " + this.adType);
        parent.epl2BLHideLayer(this.getBannerId(), null);
    };
    /*-----------------------------------------------------------------------------------------------------------*/
    //Multiple Impacto
    function MultipleImpacto() {
        Ad.call(this);
    }
    MultipleImpacto.prototype = ext(Ad.prototype);
    MultipleImpacto.prototype.constructor = MultipleImpacto;

    MultipleImpacto.prototype.adComplete = function () {
        console.log("anuncio completo Multiple Impacto");
        this.isComplete = true;
        parent.eplMIHideLayer(this.getBannerId(), 1);
    };
    MultipleImpacto.prototype.adShowLeft = function () {
        console.log("show left Multiple Impacto");
        parent.eplMIShowButton(this.getBannerId(), null);
    };
    MultipleImpacto.prototype.adShowRight = function () {
        console.log("show right Multiple Impacto");
        parent.eplMIShowTop(this.getBannerId(), null);
    };
    MultipleImpacto.prototype.adShowTop = function () {
        console.log("show top Multiple Impacto");
        parent.eplMIShowBanner(this.getBannerId(), null);
    };
    MultipleImpacto.prototype.adShowLayer = function () {
        console.log("show layer Multiple Impacto");
        parent.eplMIShowLayer(this.getBannerId(), null);
    };
    //
    MultipleImpacto.prototype.adHideLeft = function () {
        console.log("hide left Multiple Impacto");
        parent.eplMIHideButton(this.getBannerId(), null);
    };
    MultipleImpacto.prototype.adHideRight = function () {
        console.log("hide right Multiple Impacto");
        parent.eplMIHideTop(this.getBannerId(), null);
    };
    MultipleImpacto.prototype.adHideTop = function () {
        console.log("hide top Multiple Impacto");
        parent.eplMIHideBanner(this.getBannerId(), null);
    };
    MultipleImpacto.prototype.adHideLayer = function () {
        console.log("hide layer Multiple Impacto");
        parent.eplMIHideLayer(this.getBannerId(), null);
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Quintuple Impacto
    /*-----------------------------------------------------------------------------------------------------------*/
    function QuintupleImpacto() {
        Ad.call(this);
    }
    QuintupleImpacto.prototype = ext(Ad.prototype);
    QuintupleImpacto.prototype.constructor = QuintupleImpacto;

    QuintupleImpacto.prototype.adComplete = function () {
        console.log("anuncio completo " + this.adType);
        this.isComplete = true;
        parent.eplMIHideLayer(this.getBannerId(), 1);
    };
    QuintupleImpacto.prototype.adShowLeft = function () {
        console.log("show left " + this.adType);
        parent.eplMI5ShowButton(this.getBannerId(), null);
    };
    QuintupleImpacto.prototype.adShowRight = function () {
        console.log("show right " + this.adType);
        parent.eplMI5ShowTop(this.getBannerId(), null);
    };
    QuintupleImpacto.prototype.adShowTop = function () {
        console.log("show top " + this.adType);
        parent.eplMI5ShowBanner(this.getBannerId(), null);
    };
    QuintupleImpacto.prototype.adShowBottom = function () {
        console.log("show bottom " + this.adType);
        parent.eplMI5ShowBox(this.getBannerId(), null);
    };
    QuintupleImpacto.prototype.adShowLayer = function () {
        console.log("show layer " + this.adType);
        parent.eplMI5ShowLayer(this.getBannerId(), null);
    };
    //
    QuintupleImpacto.prototype.adHideLeft = function () {
        console.log("hide left " + this.adType);
        parent.eplMI5HideButton(this.getBannerId(), null);
    };
    QuintupleImpacto.prototype.adHideRight = function () {
        console.log("hide right " + this.adType);
        parent.eplMI5HideTop(this.getBannerId(), null);
    };
    QuintupleImpacto.prototype.adHideTop = function () {
        console.log("hide top " + this.adType);
        parent.eplMI5HideBanner(this.getBannerId(), null);
    };
    QuintupleImpacto.prototype.adHideBottom = function () {
        console.log("hide bottom " + this.adType);
        parent.eplMI5HideBox(this.getBannerId(), null);
    };
    QuintupleImpacto.prototype.adHideLayer = function () {
        console.log("hide layer " + this.adType);
        parent.eplMI5HideLayer(this.getBannerId(), null);
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Inline
    /*-----------------------------------------------------------------------------------------------------------*/
    function Inline() {
        ExpandiblePush.call(this);
    }
    Inline.prototype = ext(ExpandiblePush.prototype);
    Inline.prototype.constructor = Inline;

    Inline.prototype.adComplete = function () {
        console.log("anuncio completo Inline");
        this.isComplete = true;
        parent.eplDoc.eplTH.anuncioCompleto(this.getBannerId(), 1);
        parent.eplEBShrinkLayer(this.getBannerId());
        var a = parent.document.getElementById(window.name);
        setTimeout(function () {
            a.parentElement.remove();
        }, 1500);
    };
    Inline.prototype.setVideoInline = function (vid) {
        this.setVideo(vid);
        var v2 = this.videoController.getVideo(0).video;

        var ct = document.createElement("a");
        ct.setAttribute("onclick", "window.open(window.clickTag); return false");
        ct.href = "#!";
        ct.style["width"] = v2.width + "px";
        ct.style["height"] = (v2.height - 25) + "px";
        ct.style["position"] = "absolute";
        ct.style["z-index"] = "9999";
        ct.style["left"] = "0px";
        ct.style["top"] = "0px";
        v2.parentNode.appendChild(ct);

        function eplSoundOn() {
            v2.muted = false;
            v2.volume = 1;
        }

        function eplSoundOff() {
            v2.volume = 0;
            v2.muted = true;
        }
        var w = this;
        v2.onended = function () {
            w.adComplete();
        };

        ct.onmouseover = function () {
            eplSoundOn();
        };

        ct.onmouseout = function () {
            eplSoundOff();
        };

    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //Inline Expandible
    /*-----------------------------------------------------------------------------------------------------------*/
    function InlineExpandible() {
        Inline.call(this);
        this.setResponsive();
    }
    InlineExpandible.prototype = ext(Inline.prototype);
    InlineExpandible.prototype.constructor = InlineExpandible;

    InlineExpandible.prototype.setVideoInline = function (vid) {
        this.setVideo(vid);
        var v2 = this.videoController.getVideo(0);

        function eplSoundOn() {
            v2.video.muted = false;
            v2.video.volume = 1;
        }

        function eplSoundOff() {
            v2.video.volume = 0;
            v2.video.muted = true;
        }
        var w = this;
        v2.video.onended = function () {
            // w.adComplete();
        };

        v2.ct.onmouseover = function () {
            eplSoundOn();
        };

        v2.ct.onmouseout = function () {
            eplSoundOff();
        };

    };
    InlineExpandible.prototype.setResponsive = function () {
        var ifrId = window.name;
        var ifr = window.parent.document.getElementById(ifrId);
        var ifrDiv = ifr.parentElement;
        var top = window.parent;

        var initialTopW = top.innerWidth;
        var initialTopH = top.innerHeight;

        var initialAdW = parseInt(ifr.style["width"].replace("px", ""));
        var initialAdH = parseInt(ifr.style["height"].replace("px", ""));

        function doResponsive() {
            var newTopW = top.innerWidth;
            var newTopH = top.innerHeight;

            var newAdW = (newTopW * initialAdW) / initialTopW;
            var newAdH = (newTopW * initialAdH) / initialTopW;

            ifr.style["width"] = ifrDiv.style["width"] = Math.round(newAdW) + "px";
            ifr.style["height"] = ifrDiv.style["height"] = Math.round(newAdH) + "px";
        }
        console.log("Ancho pantalla: " + top.innerWidth);
        if (initialAdW > top.innerWidth / 2) {
            var oldW = initialAdW;
            initialAdW = top.innerWidth;
            var r = (initialAdW * initialAdH) / oldW;
            initialAdH = r;
            doResponsive();
        }

        top.addEventListener("resize", function () {
            var oldW = initialAdW;
            doResponsive();
        });
    };

    //VideoCounter Expandible
    /*-----------------------------------------------------------------------------------------------------------*/
    function VideoCounterExpandible() {
        Ad.call(this);
        this.LAYER_CONTAINER_DIV_ID = "eplDivContainer_VideoCounterExpandible";
        this.adr = (typeof parent.eplDoc !== "undefined") ? parent.eplDoc.eplTH4.getAdR(window.getEplBannerId()) : "ADR";
        this.baseURL = document.getElementsByTagName("base")[0].baseURI;

        this.containerLayer = null;
        this.initialPLayer = (parent.window.innerHeight * 2);
        this.endPLayer = parent.window.scrollY;
        this.isSetLayerVideo = false;
    }
    VideoCounterExpandible.prototype = ext(Ad.prototype);
    VideoCounterExpandible.prototype.constructor = VideoCounterExpandible;
    VideoCounterExpandible.prototype.adClose = function () {
        parent.window.document.body.style["overflow"] = "auto";
        this.videoController.pauseAllVideos();
        new eplTween(this.containerLayer, "top", this.initialPLayer, 1000, eplTween.easeOutQuad, cerrar);
        var that = this;
        function cerrar() {
            var a = parent.document.getElementById(that.LAYER_CONTAINER_DIV_ID);
            a.parentNode.removeChild(a);
            parent.eplDoc.eplTH4.registrarAccion(that.adr, eplMetrics.CLOSE);
            that.videoController.reloadVideo(0);
        }
    };
    VideoCounterExpandible.prototype.adComplete = function () {
        var that = this;
        this.adClose();
        parent.eplDoc.eplTH4.registrarAccion(that.adr, eplMetrics.COMPLETE);
    };
    VideoCounterExpandible.prototype.adExpand = function () {
        this.videoController.stopAllVideos();
        console.log("expandir videocounter");
        var that = this;
        var top = window.parent.document;
        parent.clickTag = window.clickTag;

        this.containerLayer = document.createElement("div");
        this.containerLayer.id = this.LAYER_CONTAINER_DIV_ID;
        this.containerLayer.style["position"] = "absolute";
        this.containerLayer.style["left"] = "0px";
        this.containerLayer.style["top"] = this.initialPLayer + "px";
        this.containerLayer.style["width"] = "100%";
        this.containerLayer.style["height"] = "100%";
        this.containerLayer.style["background-color"] = "black";
        this.containerLayer.style["z-index"] = "100000";

        var videoLayer = document.createElement("video");
        videoLayer.id = "VIDEOCOUNTEREXPANDIBLE_videoEPLLayer";
        videoLayer.setAttribute("autoplay", "");
        //videoLayer.setAttribute("muted", "");
        //videoLayer.setAttribute("controls", "");
        videoLayer.style["width"] = "100%";
        videoLayer.style["height"] = "100%";
        videoLayer.style["object-fit"] = "cover";



        var videoSource = document.createElement("source");
        videoSource.src = this.baseURL + "video2.mp4";
        videoSource.type = "video/mp4";

        var btnClose = document.createElement("img");
        btnClose.width = 30;
        btnClose.height = 30;
        btnClose.src = this.baseURL + "botonCerrar.png";
        btnClose.style["position"] = "absolute";
        btnClose.style["width"] = "30px";
        btnClose.style["height"] = "30px";
        btnClose.style["right"] = "5%";
        btnClose.style["top"] = "5%";
        btnClose.style["cursor"] = "pointer";
        btnClose.style["z-index"] = "200000";

        btnClose.onclick = function () {
            EPL.adClose();
        };

        var textCounter = document.createElement("div");
        textCounter.style["position"] = "absolute";
        textCounter.style["color"] = "white";
        textCounter.style["bottom"] = "20px";
        textCounter.style["z-index"] = "200000";
        textCounter.style["font-family"] = "sans-serif";
        textCounter.style["font-size"] = "14px";
        textCounter.style["left"] = "0px";
        textCounter.style["width"] = "100%";
        textCounter.style["text-align"] = "center";
        
        parent.window.document.body.style["overflow"] = "hidden";
        
        videoLayer.appendChild(videoSource);
        this.containerLayer.appendChild(videoLayer);
        this.containerLayer.appendChild(btnClose);
        this.containerLayer.appendChild(textCounter);
        top.body.appendChild(this.containerLayer);

        if (this.isSetLayerVideo === true) {//si ya se seteo el video eliminamos y lo volvemos a cargar
            EPL.videoController.removeVideo(1);
        }
        EPL.setVideo("VIDEOCOUNTEREXPANDIBLE_videoEPLLayer", true, null);
        this.isSetLayerVideo = true;
        
        
        this.endPLayer = parent.window.scrollY;
        new eplTween(this.containerLayer, "top", this.endPLayer, 1000, eplTween.easeOutQuad, null);
        EPL.videoController.getVideo(1).video.oncanplay = cuentaRegresivaVideo;
        
        function cuentaRegresivaVideo(){
            var videoDuration = Math.round(EPL.videoController.getVideo(1).video.duration);
            var q = setInterval(function () {
                if (videoDuration <= 0) {
                    clearInterval(q);
                    return;
                }
                videoDuration--;
                textCounter.innerHTML = "El anuncio se cerrara en " + videoDuration + " segundos";
            }, 1000);
        }
        //emitimos la metrica de expandir
        parent.eplDoc.eplTH4.registrarAccion(that.adr, eplMetrics.EXPAND);

    };
    VideoCounterExpandible.prototype.init = function () {

        this.adStartTimer();
        //Agregar el video dinamicamente
        var v = document.createElement("video");
        var s = document.createElement("source");
        v.id = "videoEPLBanner";
        v.setAttribute("autoplay", "");
        v.setAttribute("muted", "");
        v.setAttribute("loop", "");
        v.style["width"] = "100%";
        v.style["height"] = "100%";
        s.src = "video.mp4";
        s.type = "video/mp4";
        v.appendChild(s);
        document.body.appendChild(v);

        //Agregar el contador dinamicamente
        var cd = document.createElement("div");
        cd.style["position"] = "absolute";
        cd.style["width"] = "40px";
        cd.style["height"] = "40px";
        cd.style["font-family"] = "sans-serif";
        cd.style["background-color"] = "black";
        cd.style["color"] = "white";
        cd.style["left"] = "0";
        cd.style["top"] = "0";
        cd.style["bottom"] = "0";
        cd.style["right"] = "0";
        cd.style["margin"] = "auto";
        cd.style["opacity"] = "0.8";
        cd.style["text-align"] = "center";
        cd.style["font-size"] = "30px";
        cd.style["border-radius"] = "50%";
        cd.style["border-color"] = "white";
        cd.style["border-style"] = "solid";
        cd.style["border-width"] = "2px";
        cd.style["display"] = "none";
        cd.style["line-height"] = "40px";
        document.body.appendChild(cd);

        this.setVideo(v.id, false, null);
        var v2 = this.videoController.getVideo(0);

        function eplSoundOn() {
            v2.video.muted = false;
            v2.video.volume = 1;
        }
        function eplSoundOff() {
            v2.video.volume = 0;
            v2.video.muted = true;
        }

        var counter = null;
        var i = 3;
        function initCounter() {
            cd.innerHTML = i;
            cd.style["display"] = "block";
            counter = setInterval(function () {
                if (i === 0) {
                    clearInterval(counter);
                    endCounter();
                    EPL.adExpand();
                    return;
                }
                i--;
                cd.innerHTML = i;
            }, 600);
        }
        function endCounter() {
            clearInterval(counter);
            cd.style["display"] = "none";
            i = 3;
        }

        var that = this;

        v2.video.onplay = null;
        v2.video.onpause = null;
        v2.video.onended = function(){
            v2.video.play();
            parent.eplDoc.eplTH4.registrarAccion(that.adr, eplMetrics.VIDEO_RESTART);
        };
        //v2.video.onvolumechange = null;
        v2.video.ontimeupdate = null;

        v2.ct.onmouseover = function () {
            initCounter();
            eplSoundOn();
        };
        v2.ct.onmouseout = function () {
            endCounter();
            eplSoundOff();
        };
        eplSoundOff();
    };

    /*-----------------------------------------------------------------------------------------------------------*/

    //VideoPreview Expandible
    /*-----------------------------------------------------------------------------------------------------------*/
    function VideoPreview() {
        Ad.call(this);
        this.direction = null;
        this.LAYER_CONTAINER_DIV_ID = "eplDivContainer_VideoPreview";
        this.adr = (typeof parent.eplDoc !== "undefined") ? parent.eplDoc.eplTH4.getAdR(window.getEplBannerId()) : "ADR";
        this.baseURL = document.getElementsByTagName("base")[0].baseURI;

        this.containerLayer = null;
        
    }
    VideoPreview.prototype = ext(Ad.prototype);
    VideoPreview.prototype.constructor = VideoPreview;
    VideoPreview.prototype.adComplete = function(){
        var that = this;
        this.adClose();
    };
    VideoPreview.prototype.adClose = function(){
        parent.window.document.body.style["overflow"] = "auto";
        this.videoController.pauseAllVideos();
        var that = this;
        function cerrar() {
            var q = new CustomEvent("cerrarAnuncio");
            document.dispatchEvent(q);
            var a = parent.document.getElementById(that.LAYER_CONTAINER_DIV_ID);
            a.parentNode.removeChild(a);
            parent.eplDoc.eplTH4.registrarAccion(that.adr, eplMetrics.CLOSE);
        }
        switch(this.direction){
            case "LR": 
                new eplTween(this.containerLayer, "left", -(parent.window.innerWidth*2), 1000, eplTween.easeOutQuad, cerrar);          
                break;
            case "RL": new eplTween(this.containerLayer, "left", (parent.window.innerWidth*2), 1000, eplTween.easeOutQuad, cerrar);    
                break;
            case "TB": new eplTween(this.containerLayer, "top", -(parent.window.innerHeight*2), 1000, eplTween.easeOutQuad, cerrar);
                break;
            case "BT": new eplTween(this.containerLayer, "top", (parent.window.innerHeight*2), 1000, eplTween.easeOutQuad, cerrar);
                break;
            case null: cerrar();
                break;
            default: cerrar();
                break;
        }
    };
    //Directions - LR (left to right) / RL (right to lef) / TB (top to bottom) / BT (bottom to top)
    VideoPreview.prototype.init = function (_direction) {
        
        if(typeof _direction !== "undefined" && _direction !== null){
            if(_direction === "LR" || _direction === "RL" || _direction === "TB" || _direction === "BT"){
                this.direction = _direction;
            }
        }
        
        var that = this;
        var top = window.parent.document;
        parent.clickTag = window.clickTag;

        this.containerLayer = document.createElement("div");
        this.containerLayer.id = this.LAYER_CONTAINER_DIV_ID;
        this.containerLayer.style["position"] = "absolute";
        this.containerLayer.style["width"] = "100%";
        this.containerLayer.style["height"] = "100%";
        this.containerLayer.style["background-color"] = "black";
        this.containerLayer.style["z-index"] = "100000";

        var videoLayer = document.createElement("video");
        videoLayer.id = "VIDEOPREVIEW_videoEPLLayer";
        videoLayer.setAttribute("autoplay", "");
        //videoLayer.setAttribute("muted", "");
        videoLayer.setAttribute("controls", "");
        videoLayer.style["width"] = "100%";
        videoLayer.style["height"] = "100%";
        videoLayer.style["object-fit"] = "cover";

        var videoSource = document.createElement("source");
        videoSource.src = this.baseURL + "video.mp4";
        videoSource.type = "video/mp4";
        
        var btnClose = document.createElement("img");
        btnClose.width = 30;
        btnClose.height = 30;
        btnClose.src = this.baseURL + "botonCerrar.png";
        btnClose.style["position"] = "absolute";
        btnClose.style["width"] = "30px";
        btnClose.style["height"] = "30px";
        btnClose.style["right"] = "5%";
        btnClose.style["top"] = "5%";
        btnClose.style["cursor"] = "pointer";
        btnClose.style["z-index"] = "200000";

        btnClose.onclick = function () {
            EPL.adClose();
        };
        
        parent.window.document.body.style["overflow"] = "hidden";

        videoLayer.appendChild(videoSource);
        this.containerLayer.appendChild(btnClose);
        this.containerLayer.appendChild(videoLayer);
        
        switch(this.direction){
            case "LR":
                
                this.containerLayer.style["left"] = - (parent.window.innerWidth*2) + "px";
                this.containerLayer.style["top"] = parent.window.scrollY + "px";
                top.body.appendChild(this.containerLayer);
                new eplTween(this.containerLayer, "left", 0, 1000, eplTween.easeOutQuad, null);
                
                break;
                
            case "RL":
                
                this.containerLayer.style["left"] = (parent.window.innerWidth*2) + "px";
                this.containerLayer.style["top"] = parent.window.scrollY + "px";
                top.body.appendChild(this.containerLayer);
                new eplTween(this.containerLayer, "left", 0, 1000, eplTween.easeOutQuad, null);
                
                break;
                
            case "TB":
                
                this.containerLayer.style["top"] = -(parent.window.innerHeight*2) + "px";
                this.containerLayer.style["left"] = "0px";
                top.body.appendChild(this.containerLayer);
                new eplTween(this.containerLayer, "top", parent.window.scrollY, 1000, eplTween.easeOutQuad, null);
                
                break;
                
            case "BT":
                
                this.containerLayer.style["top"] = (parent.window.innerHeight*2) + "px";
                this.containerLayer.style["left"] = "0px";
                top.body.appendChild(this.containerLayer);
                new eplTween(this.containerLayer, "top", parent.window.scrollY, 1000, eplTween.easeOutQuad, null);
                
                break;
                
            case null:
                
                this.containerLayer.style["top"] = parent.window.scrollY + "px";
                this.containerLayer.style["left"] = "0px";
                top.body.appendChild(this.containerLayer);
                
                break;
                
            default:
                
                this.containerLayer.style["top"] = parent.window.scrollY + "px";
                this.containerLayer.style["left"] = "0px";
                top.body.appendChild(this.containerLayer);
                
                break;
        }

        this.adStartTimer();
        EPL.setVideo("VIDEOPREVIEW_videoEPLLayer", true, null);

    };

    //Filmstrip
    /*-----------------------------------------------------------------------------------------------------------*/
    function Filmstrip() {
        Ad.call(this);
    }
    Filmstrip.prototype = ext(Ad.prototype);
    Filmstrip.prototype.constructor = Filmstrip;

    Filmstrip.prototype.setContent = function (divContenedor, divContenido) {
        var a = document.getElementById(divContenedor);
        var b = document.getElementById(divContenido);

        //Esta funcionalidad es para no perder la zona activa en el scroll sobre el video de youtube ya que al ser un iframe no se detecta el onmousemove del window
        //agregamos una zona activa por cada video para que perteneza al window original y pueda realizar el scroll
        //se deja sin zona activa unicamente a los controles del reproductor
        if (EPL.videoControllerYoutube.videoCount > 0) {
            var c = EPL.videoControllerYoutube.videoCount;
            for (var i = 0; i < c; i++) {
                var z = document.createElement("div");
                var v = EPL.videoControllerYoutube.getVideo(i);
                var where = document.getElementById(v.idDiv);
                z.style["position"] = "relative";
                z.style["margin-top"] = (-v.alto) + "px";
                z.style["width"] = v.ancho + "px";
                z.style["height"] = (v.alto - 30) + "px";//alto de los controles del video de youtube 30px, es lo que se resta
                where.parentElement.appendChild(z);
            }
        }

        window.onmousemove = function (e) {
            var pX = e.x || e.clientX;
            var pY = e.y || e.clientY;
            var aAlto = parseInt(a.style.height.replace("px", ""));
            var aAncho = parseInt(a.style.width.replace("px", ""));
            var bAlto = parseInt(b.style.height.replace("px", ""));

            if (pX < aAncho && pX > 0 && pY < aAlto && pY > 0) {
                var r = (bAlto - aAlto) / aAlto;
                var r2 = -e.clientY * r;
                b.style["margin-top"] = r2 + "px";
            }
        };
    };
    /*-----------------------------------------------------------------------------------------------------------*/

    //FORMATOS - fin




    //FACTORY - comienzo
    function adFactory() {
        this.formatosRegistrados = [];
    }
    adFactory.prototype.registrarFormato = function (id, formato) {
        this.formatosRegistrados[id] = formato;
    };
    adFactory.prototype.create = function (type) {
        return new this.formatosRegistrados[type];
    };

    //registro de clases de formatos al factory
    var factory = new adFactory();
    factory.registrarFormato(eplFormats.ad, Ad);
    factory.registrarFormato(eplFormats.bannerGenerico, BannerGenerico);
    factory.registrarFormato(eplFormats.bannerSkin, BannerSkin);
    factory.registrarFormato(eplFormats.layerGenerico, LayerGenerico);
    factory.registrarFormato(eplFormats.bannerLayer, BannerLayer);
    factory.registrarFormato(eplFormats.layerBoton, LayerBoton);
    factory.registrarFormato(eplFormats.layerScroll, LayerScroll);
    factory.registrarFormato(eplFormats.anuncioPrevio, AnuncioPrevio);
    factory.registrarFormato(eplFormats.unionLayers, UnionLayers);
    factory.registrarFormato(eplFormats.expandibleMultiple, ExpandibleMultiple);
    factory.registrarFormato(eplFormats.folding, Folding);
    factory.registrarFormato(eplFormats.expandiblePush, ExpandiblePush);
    factory.registrarFormato(eplFormats.expandibleRollover, ExpandibleRollover);
    factory.registrarFormato(eplFormats.takeover, Takeover);
    factory.registrarFormato(eplFormats.zocalo, Zocalo);
    factory.registrarFormato(eplFormats.tripleImpacto, TripleImpacto);
    factory.registrarFormato(eplFormats.multipleImpacto, MultipleImpacto);
    factory.registrarFormato(eplFormats.quintupleImpacto, QuintupleImpacto);
    factory.registrarFormato(eplFormats.inline, Inline);
    factory.registrarFormato(eplFormats.inlineExpandible, InlineExpandible);
    factory.registrarFormato(eplFormats.filmstrip, Filmstrip);
    factory.registrarFormato(eplFormats.videoCounterExpandible, VideoCounterExpandible);
    factory.registrarFormato(eplFormats.videoPreview, VideoPreview);
    //FACTORY - fin
    this.create = function (type) {
        return factory.create(type);
    };
}