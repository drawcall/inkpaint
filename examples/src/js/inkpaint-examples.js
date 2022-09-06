$(document).ready(function($) {
    var bpc = bpc || {};
    bpc.allowedVersions = [4];
    bpc.pixiVersionString = "v4.x";
    bpc.majorPixiVersion = 4;

    bpc.exampleUrl = "";
    bpc.exampleFilename = "";
    bpc.exampleTitle = "";
    bpc.exampleSourceCode = "";
    bpc.exampleRequiredPlugins = [];
    bpc.exampleValidVersions = [];

    bpc.editorOptions = {
        mode: "javascript",
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        viewportMargin: Infinity,
        lineWrapping: true
    };

    bpc.clickType = "click";
    bpc.animTime = 0.15;
    bpc.resize = function() {};
    bpc.scriptsToLoad = ["https://cdnjs.cloudflare.com/ajax/libs/gsap/2.0.2/TweenMax.min.js"];
    bpc.scriptsLoaded = 0;
    bpc.loadScriptsAsync = function() {
        for (var i = 0; i < bpc.scriptsToLoad.length; i++) {
            $.ajax({
                url: bpc.scriptsToLoad[i],
                dataType: "script",
                cache: true,
                async: true,
                success: bpc.fileLoaded
            });
        }

        if (bpc.scriptsToLoad.length === 0) {
            bpc.loadComplete();
        }
    };

    bpc.fileLoaded = function() {
        bpc.scriptsLoaded++;
        if (bpc.scriptsLoaded === bpc.scriptsToLoad.length) {
            bpc.loadComplete();
        }
    };

    bpc.loadComplete = function() {
        $.getJSON("source/manifest.json", function(data) {
            var sections = Object.keys(data);
            for (var i = 0; i < sections.length; i++) {
                var html =
                    '<span class="section" data-section="' +
                    sections[i] +
                    '">' +
                    sections[i] +
                    '</span><ul data-section="' +
                    sections[i] +
                    '">';
                var items = data[sections[i]];

                for (var j = 0; j < items.length; j++) {
                    var plugins = typeof items[j].plugins !== "undefined" ? items[j].plugins.join(",") : "";
                    var validVersions =
                        typeof items[j].validVersions !== "undefined" ? items[j].validVersions.join(",") : "";
                    html +=
                        '<li data-src="' +
                        items[j].entry +
                        '" data-plugins="' +
                        plugins +
                        '" data-validVersions="' +
                        validVersions +
                        '">' +
                        items[j].title +
                        "</li>";
                }
                html += "</ul>";

                $(".main-menu").append(html);
            }

            bpc.initNav();
        });
    };

    bpc.initNav = function() {
        $(".main-menu .section").on(bpc.clickType, function() {
            $(this)
                .next("ul")
                .slideToggle(250);
            $(this).toggleClass("open");
        });

        $(".main-menu li").on(bpc.clickType, function() {
            if (!$(this).hasClass("selected")) {
                $(".main-menu li.selected").removeClass("selected");
                $(this).addClass("selected");
                // load data
                bpc.closeMobileNav();

                var page =
                    "/" +
                    $(this)
                        .parent()
                        .attr("data-section") +
                    "/" +
                    $(this).attr("data-src");
                bpc.exampleTitle = $(this).text();

                window.location.hash = page;
                document.title = bpc.exampleTitle + " - InkPaint Web Examples";

                bpc.exampleUrl =
                    "source/js/" +
                    $(this)
                        .parent()
                        .attr("data-section") +
                    "/" +
                    $(this).attr("data-src");
                bpc.exampleFilename = $(this).attr("data-src");

                var plugins = $(this).attr("data-plugins");
                bpc.exampleRequiredPlugins = plugins === "" ? [] : plugins.split(",");

                var validVersions = $(this).attr("data-validVersions");
                bpc.exampleValidVersions =
                    validVersions === ""
                        ? [4]
                        : validVersions.split(",").map(function(v) {
                              return parseInt(v, 10);
                          });

                $.ajax({
                    url:
                        "source/js/" +
                        $(this)
                            .parent()
                            .attr("data-section") +
                        "/" +
                        $(this).attr("data-src"),
                    dataType: "text",
                    success: function(data) {
                        bpc.exampleSourceCode = data;

                        bpc.generateIFrameContent();
                    }
                });
            }
        });

        bpc.generateIFrameContent = function() {
            // Remove all iFrames and content
            var iframes = document.querySelectorAll("iframe");
            for (var i = 0; i < iframes.length; i++) {
                iframes[i].parentNode.removeChild(iframes[i]);
            }
            $("#example").html('<iframe id="preview" src="blank.html"></iframe>');

            $(".CodeMirror").remove();
            $(".main-content #code").html(bpc.exampleSourceCode);

            // Generate HTML and insert into iFrame
            var pixiUrl = "../dist/inkpaint.js";
            var html = "<!DOCTYPE html><html><head><style>";
            html += "body,html{margin:0px;height:100%;overflow:hidden;}canvas{width:100%;height:100%;}";
            html += "</style></head><body>";
            html += '<script src="vendor/jquery-3.3.1.min.js"></script>';
            html += '<script src="vendor/tween.umd.js"></script>';
            html += '<script src="vendor/Stats.min.js"></script>';
            html += '<script src="' + pixiUrl + '"></script>';

            bpc.editor = CodeMirror.fromTextArea(document.getElementById("code"), bpc.editorOptions);

            if (bpc.exampleRequiredPlugins.length) {
                $("#code-header").text("Example Code (plugins used: " + bpc.exampleRequiredPlugins.toString() + ")");
            } else {
                $("#code-header").text("Example Code");
            }

            var screenshotsScript = `
            var removed = true;
            var img = new Image();
            img.style.width= "100%";
            img.style.height= "100%";

            document.body.onclick = function(){
                if(document.body.noclick) return;

                var dataURL = app.view.toDataURL('image/png');
                img.src = dataURL;
                img.width = app.view.width;
                img.height = app.view.height;

                if(removed){
                    document.body.removeChild(app.view);
                    document.body.appendChild(img);
                }else{
                    document.body.appendChild(app.view);
                    document.body.removeChild(img);
                }
                removed = !removed;
            }
            `;

            if (!bpc.exampleValidVersions.length || bpc.exampleValidVersions.indexOf(bpc.majorPixiVersion) > -1) {
                $("#example-title").html(bpc.exampleTitle);
                html += `<script>window.onload = function(){
                    ${bpc.exampleSourceCode}
                    ${screenshotsScript}
                    }</script></body></html>`;

                $(".example-frame").show();
            } else {
                $("#example-title").html(
                    bpc.exampleTitle +
                        "<br><br><br><br><br><br><br>" +
                        "The selected version of PixiJS does not work with this example." +
                        "<br><br>" +
                        "Selected version: v" +
                        bpc.majorPixiVersion +
                        "<br><br>" +
                        "Required version: v" +
                        bpc.exampleValidVersions.toString() +
                        "<br><br><br><br><br>"
                );

                $(".example-frame").hide();
            }

            var iframe = document.getElementById("preview");
            var frameDoc = iframe.contentDocument || iframe.contentWindow.document;

            frameDoc.open();
            frameDoc.write(html);
            frameDoc.close();
        };

        bpc.openMobileNav = function() {
            TweenMax.to("#line1", bpc.animTime, {
                y: 0,
                ease: Linear.easeNone
            });
            TweenMax.to("#line2", 0, {
                alpha: 0,
                ease: Linear.easeNone,
                delay: bpc.animTime
            });
            TweenMax.to("#line3", bpc.animTime, {
                y: 0,
                ease: Linear.easeNone
            });

            TweenMax.to("#line1", bpc.animTime, {
                rotation: 45,
                ease: Quart.easeOut,
                delay: bpc.animTime
            });
            TweenMax.to("#line3", bpc.animTime, {
                rotation: -45,
                ease: Quart.easeOut,
                delay: bpc.animTime
            });

            $(".main-nav").addClass("mobile-open");
        };

        bpc.closeMobileNav = function() {
            TweenMax.to("#line1", bpc.animTime, {
                rotation: 0,
                ease: Linear.easeNone,
                delay: 0
            });
            TweenMax.to("#line3", bpc.animTime, {
                rotation: 0,
                ease: Linear.easeNone,
                delay: 0
            });

            TweenMax.to("#line2", 0, {
                alpha: 1,
                ease: Quart.easeOut,
                delay: bpc.animTime
            });
            TweenMax.to("#line1", bpc.animTime, {
                y: -8,
                ease: Quart.easeOut,
                delay: bpc.animTime
            });
            TweenMax.to("#line3", bpc.animTime, {
                y: 8,
                ease: Quart.easeOut,
                delay: bpc.animTime
            });

            $(".main-nav").removeClass("mobile-open");
        };

        bpc.updateMenu = function() {
            $(".main-nav .main-menu ul li").each(function() {
                var validVersions = $(this).attr("data-validVersions");
                var exampleValidVersions =
                    validVersions === ""
                        ? [4]
                        : validVersions.split(",").map(function(v) {
                              return parseInt(v, 10);
                          });
                if (exampleValidVersions.indexOf(bpc.majorPixiVersion) === -1) {
                    $(this).addClass("invalid");
                } else {
                    $(this).removeClass("invalid");
                }
            });
        };

        bpc.updateMenu();

        $(".main-header .hamburger").on(bpc.clickType, function(e) {
            e.preventDefault();
            if ($(".main-nav").hasClass("mobile-open")) {
                bpc.closeMobileNav();
            } else {
                bpc.openMobileNav();
            }
            return false;
        });

        // Deep link
        if (window.location.hash !== "") {
            var hash = window.location.hash.replace("#/", "");
            var arr = hash.split("/");
            var dom = '.main-menu .section[data-section="' + arr[0] + '"]';
            if (arr.length > 1) {
                if ($(dom).length > 0) {
                    $(dom).trigger(bpc.clickType);
                    if (
                        $(dom)
                            .next()
                            .find('li[data-src="' + arr[1] + '"]').length > 0
                    ) {
                        $(dom)
                            .next()
                            .find('li[data-src="' + arr[1] + '"]')
                            .trigger(bpc.clickType);
                    }
                }
            }
        } else {
            $(".main-menu .section")
                .eq(0)
                .trigger(bpc.clickType);
            $(".main-menu li")
                .eq(0)
                .trigger(bpc.clickType);
        }

        // Refresh Button
        $(".reload").on(bpc.clickType, function() {
            bpc.exampleSourceCode = bpc.editor.getValue();
            bpc.generateIFrameContent();
        });
    };

    bpc.init = function() {
        $(window).resize(bpc.resize);
        bpc.loadScriptsAsync();
    };

    bpc.init();
});
