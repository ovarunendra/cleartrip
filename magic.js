var app = angular.module('clearTrip', ['angularAwesomeSlider']);

app.factory('gameService', ['$rootScope', function ($rootScope) {
    isNS4 = (document.layers) ? true : false;
    isIE4 = (document.all && !document.getElementById) ? true : false;
    isIE5 = (document.all && document.getElementById) ? true : false;
    isNS6 = (!document.all && document.getElementById) ? true : false;

    var curX, curY, curX2, curY2, boxX, boxY, moving = 0, touch = 0;
    var gametime = 0, started = 0, speed;
    var pauseStartTime = 0, pauseEndTime = 0, paused, pauseTime = 0;
    var starttime, endtime, finaltime = 0; //pass finaltime to popup window to ask for initials
    var enemyxdir = new Array(1, 1, 1, 1);
    var enemyydir = new Array(1, 1, 1, 1);

    if (isNS4 || isNS6) {
        document.captureEvents(Event.MOUSEUP | Event.MOUSEDOWN | Event.MOUSEMOVE);
    }
    var gameService = {
        startclock: function () {
            var today = new Date();
            starttime = today.getTime();
        },
        endclock: function () {
            var today = new Date();
            endtime = today.getTime();
        },
        calctime: function () {
            var time = (endtime - starttime - 0) / 1000 - pauseTime;
            return time.toFixed(2);
        },
        giveposX: function (divname) {
            if (isNS4) var posLeft = document.layers[divname].left;
            else if (isIE4 || isIE5) var posLeft = document.all(divname).style.pixelLeft;
            else if (isNS6) var posLeft = parseInt(document.getElementById(divname).style.left + "");
            return posLeft;
        },
        giveposY: function (divname) {
            if (isNS4) var posTop = document.layers[divname].top;
            else if (isIE4 || isIE5) var posTop = document.all(divname).style.pixelTop;
            else if (isNS6) var posTop = parseInt(document.getElementById(divname).style.top + "");
            return posTop;
        },
        setposX: function (divname, xpos) {
            if (isNS4) document.layers[divname].left = xpos;
            else if (isIE4 || isIE5) document.all(divname).style.pixelLeft = xpos;
            else if (isNS6) document.getElementById(divname).style.left = xpos;
        },
        setposY: function (divname, ypos) {
            if (isNS4) document.layers[divname].top = ypos;
            else if (isIE4 || isIE5) document.all(divname).style.pixelTop = ypos;
            else if (isNS6) document.getElementById(divname).style.top = ypos;
        },
        givesize: function (divname, dimension) {
            var divsize = 0;
            if (dimension == 'y') {
                if (isNS4) divsize = document.layers[divname].clip.height;
                else if (isIE4 || isIE5) divsize = document.all(divname).style.pixelHeight;
                else if (isNS6) divsize = parseInt(document.getElementById(divname).style.height + "");
            }
            else if (dimension == 'x') {
                if (isNS4) divsize = document.layers[divname].clip.width;
                else if (isIE4 || isIE5) divsize = document.all(divname).style.pixelWidth;
                else if (isNS6) divsize = parseInt(document.getElementById(divname).style.width + "");
            }

            return divsize;
        },
        checktouching: function (num) {
            var enemy = "enemy" + num + "";
            var difX = gameService.giveposX('box') - gameService.giveposX(enemy) - 0; // -0 converts to integer
            var difY = gameService.giveposY('box') - gameService.giveposY(enemy) - 0;

            // set touch = 1 if it is touching an enemy
            if (difX > (-1 * gameService.givesize('box', 'x')) && difX < gameService.givesize(enemy, 'x') && difY > (-1 * gameService.givesize('box', 'y')) && difY < gameService.givesize(enemy, 'y')) {
                touch = 1;
            }
            else touch = 0;
        },
        movenemy: function (num, step_x, step_y) {
            var enemy = "enemy" + num + "";
            var enemyx = gameService.givesize(enemy, 'x');
            var enemyy = gameService.givesize(enemy, 'y');

            if (gameService.giveposX(enemy) >= (450 - enemyx) || gameService.giveposX(enemy) <= 0) {
                enemyxdir[num] = -1 * enemyxdir[num];
            }
            if (gameService.giveposY(enemy) >= (450 - enemyy) || gameService.giveposY(enemy) <= 0) {
                enemyydir[num] = -1 * enemyydir[num];
            }

            var newposx = gameService.giveposX(enemy) + (step_x * enemyxdir[num]) + 0;
            var newposy = gameService.giveposY(enemy) + (step_y * enemyydir[num]) + 0;

            gameService.setposX(enemy, newposx);
            gameService.setposY(enemy, newposy);

            gameService.checktouching(num + "");
            if (touch == 1) {
                gameService.stop();
                gameService.reset();
            }
        },
        movenemies: function () {
            gametime = gametime + 1;
            if (gametime >= 0 && gametime < 100) speed = parseInt(speed);
            else if (gametime >= 100 && gametime < 200) speed = 60;
            else if (gametime >= 200 && gametime < 300) speed = 50;
            else if (gametime >= 300 && gametime < 400) speed = 40;
            else if (gametime >= 400 && gametime < 500) speed = 30;
            else speed = 20;
            // window.status = "speed:  " + speed + "   gametime: " + gametime;
            gameService.movenemy(0, -10, 12);
            gameService.movenemy(1, -12, -20);
            gameService.movenemy(2, 15, -13);
            gameService.movenemy(3, 17, 11);
            if (!paused) {
                setTimeout(gameService.movenemies, speed);
            }
        },
        resume: function () {
            if (started) {
                paused = !paused;
                gameService.movenemies();
                if (paused) {
                    pauseStartTime = new Date().getTime();
                } else {
                    pauseEndTime = new Date().getTime();
                }
                pauseTime = pauseTime + (pauseEndTime - pauseStartTime - 0 ) / 1000;
                pauseStartTime = 0;
                pauseEndTime = 0;
            }
        },
        checkStatus: function () {
            return paused;
        },
        start: function (e) {
            if (!gameService.checkStatus()) {
                if (started == 0) {
                    gameService.movenemies();
                    gameService.startclock();
                    started = 1;
                }

                curX = (isNS4 || isNS6) ? e.pageX : window.event.x;
                curY = (isNS4 || isNS6) ? e.pageY : window.event.y;

                curX2 = eval(curX - 40);
                curY2 = eval(curY - 40);

                boxX = eval(curX - 20);
                boxY = eval(curY - 20);

                var boxleft = gameService.giveposX('box');
                var boxtop = gameService.giveposY('box');

                if (curX > boxleft && curX2 < boxleft && curY > boxtop && curY2 < boxtop) {

                    moving = 1;
                    gameService.setposX('box', boxX);
                    gameService.setposY('box', boxY);

                    if (isNS4 || isNS6) {
                        document.captureEvents(Event.MOUSEMOVE);
                    }
                }
            }

        },
        stop: function (e) {
            moving = 0;
            if (isNS4 || isNS6) {
                document.releaseEvents(Event.MOUSEMOVE);
            }
        },
        reset: function (e) {
            gameService.endclock();
            moving = 0;
            if (isNS4 || isNS6) {
                document.releaseEvents(Event.MOUSEMOVE);
            }
            if (finaltime == 0) {
                finaltime = gameService.calctime();
                $rootScope.$broadcast('result', finaltime);
                window.alert('You survived ' + finaltime + ' seconds !');
                //		var entername = window.confirm('Enter your name?');
                //			if (entername) {
                //			window.open("?" + finaltime,'winwin','width=300,height=500,left=40,top=40,status=1,resizable');
                //			document.location.reload();
                //			}
                //			else document.location.reload();
                document.location.reload();
            }
        },
        checkLocation: function (e) {
            if (!gameService.checkStatus()) {
                curX = (isNS4 || isNS6) ? e.pageX : window.event.x;
                curY = (isNS4 || isNS6) ? e.pageY : window.event.y;

                boxX = eval(curX - 20);
                boxY = eval(curY - 20);

                gameService.checktouching('1');

                if (moving == 1 && touch == 0) {

                    gameService.setposX('box', boxX);
                    gameService.setposY('box', boxY);

                    if (curY > 69 && curX > 69 && curY < 381 && curX < 381) return false;
                    else gameService.stop();
                    gameService.reset();
                }

                else if (touch == 1) {
                    gameService.stop();
                    gameService.reset();
                }
            }

        },
        setSpeed: function (data) {
            speed = data;
        }
    };
    return gameService;
}]);

app.directive('enemy', [function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            height: '@',
            width: '@'
        },
        template: '<table height="{{height}}" width="{{width}}">\
                        <tbody>\
                            <tr>\
                                <td>&nbsp;</td>\
                            </tr>\
                        </tbody>\
                    </table>'
    };
}]);

app.directive('emptyTable', [function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<table>\
                        <tbody>\
                            <tr>\
                                <td></td>\
                            </tr>\
                        </tbody>\
                    </table>'
    };
}]);

app.directive('redBox', ['gameService', function (gameService) {
    return {
        restrict: 'A',
        template: '<table height="40" width="40">\
                        <tbody>\
                            <tr>\
                                <td>&nbsp;</td>\
                            </tr>\
                        </tbody>\
                    </table>',
        link: function (scope, element, attrs) {
            element.bind('mousedown', function (event) {
                gameService.start(event);
            });
            element.bind('mousemove', function (event) {
                gameService.checkLocation(event);
            });
            element.bind('onmouseup', function (event) {
                gameService.stop(event);
            });
        }
    };
}]);

app.directive('bestScore', [function () {
    return {
        restrict: 'E',
        template: '<span>Best Score:  {{bestScore}}</span>',
        link: function (scope) {
            if (typeof(Storage) != "undefined") {
                scope.bestScore = localStorage.getItem("bestScore") || 0;
                scope.bestScore = scope.bestScore + ' seconds'
            } else {
                scope.bestScore = "Sorry, your browser does not support Web Storage...";
            }
            scope.$on('result', function (event, data) {
                if (typeof(Storage) != "undefined") {
                    if (!localStorage.getItem("bestScore") || (parseFloat(data) > parseFloat(localStorage.getItem("bestScore")))) {
                        localStorage.setItem("bestScore", data);
                    }
                }
            })
        }
    };
}]);

app.directive('pauseResume', ['gameService', function (gameService) {
    return function (scope, element) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 32) {
                gameService.resume();
                event.preventDefault();
            }
        });
    };
}]);

app.controller('MainController', ['$scope', 'gameService', function ($scope, gameService) {
    var ctrl = this;
    ctrl.speedValue = 80;
    ctrl.speedOptions = {
        from: 100,
        to: 40,
        step: 5,
        css: {
            background: {"background-color": "silver"},
            before: {"background-color": "purple"},
            default: {"background-color": "white"},
            after: {"background-color": "green"},
            pointer: {"background-color": "red"}
        }
    };
    $scope.$watch('ctrl.speedValue', function (newval) {
        if (newval) {
            gameService.setSpeed(newval);
        }
    })
}]);
