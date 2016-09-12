(function () {
    var basePath = window.basePath || "./";
    var delay = 1000;//毫秒
    var soltNum = 10;
    var webApi = (()=> {
        var noPrize = ()=> {
                return $.ajax({url: "/user/decrease", type: "GET"});
            },
            loadPrize = ()=> {
                return $.ajax({url: "/user/lucky", type: "GET"});
            },
            commitInfo = (name, phone, idNo)=> {
                let data = {
                    name: name,
                    phone: phone,
                    idNo: idNo
                }
                return $.ajax({url: "/user/accept", type: "GET"});
            }, helpTa = ()=> {
                // TODO: 需要得到ID
                return $.ajax({url: "/user/vote/2", type: "GET"});
            }
        return {
            noPrize: noPrize,
            loadPrize: loadPrize,
            commitInfo: commitInfo,
            helpTa: helpTa
        }
    })();
    var animate = ($dom, dir, top, time, dfd)=> {
            if (!$dom)return;
            // dir=dir=='margin-left'?"margin-left":"top";
            var defer = $.Deferred()
            time = time || 1000;
            let flag = false;
            let moveObj = {};
            moveObj[dir] = top;
            let run = (cb)=> {
                $dom.animate(moveObj, time, "linear", cb)
            }
            dfd && dfd.done((newTop, newTime)=> {
                time = newTime || time;
                top = newTop || top;
                flag = true;
            });
            let cb = ()=> {
                $dom.css(dir, 0);
                if (flag) {
                    moveObj[dir] = top;
                    $dom.animate(moveObj, time, "linear");
                    defer.resolve();
                } else {
                    run(cb)
                }
            };
            run(cb);
            return defer.promise();
        },
        isHavePrize = (prize)=> {
            var random = Math.random();
            if (random < prize.odds) {//中奖
                return true;
            } else {
                //未中
                return false;
            }
        }
    var prize5 = {
        top: "-600%",
        odds: 0.5,//中奖率
        0: {//未中奖
            pos: "-500%",
            index: 0
            // img:
        },
        1: {
            pos: "-400%",
            img: "interest.png",
            index: 1
        },
        2: {
            pos: "-300%",
            img: "korea.png",
            index: 2
        },
        3: {
            pos: "-200%",
            img: "disney.png",
            index: 3
        },
        4: {
            pos: "-100%",
            img: "redbag.png",
            index: 4
        },
        5: {
            pos: "0",
            img: "oilCard.png",
            index: 5
        }
    }, prize4 = {
        odds: 1,//中奖率
        top: "-600%",
        0: {
            pos: '-400%',
            index: 0
            // img:
        },
        1: {
            pos: '-300%',
            img: "travel.png",
            index: 1
        },
        2: {
            pos: '-200%',
            img: "iphone.png",
            index: 2
        },
        3: {
            pos: '-100%',
            img: 'ticket.png',
            index: 3
        },
        4: {
            pos: '0',
            img: 'oilCard.png',
            index: 4
        }
    }
    var prize = window.prizeType == "prize5" ? prize5 : prize4;
    var lock = false;
    var runTime = ()=> {
        var dfd = $.Deferred();
        setTimeout(()=> {
            dfd.resolve();
        }, delay * 3);
        return dfd.promise();
    }, loadImg = (src)=> {
        var img = new Image();
        var dfd = $.Deferred();
        img.onload = ()=> {
            dfd.resolve();
        };
        img.onerror = ()=> {
            dfd.reject();
        }
        img.src = src;
        return dfd.promise();
    }
    var runSlot = ()=> {
        if (lock)return;
        if (soltNum < 1) {
            showShare();
            return;
        }
        lock = true;
        soltNum--;
        var dfd = $.Deferred();
        var finish = animate($("#prize"), "top", prize.top, delay, dfd.promise());
        var item, timer = runTime();
        var noprize = ()=> {
            item = prize[0];
            timer.done(()=> {
                dfd.resolve(item);
            })
        }
        if (isHavePrize(prize)) {
            webApi.loadPrize().done((res)=> {
                item = prize[res.data.prizeId];//todo奖品的id;
                loadImg(basePath + "/img/" + item.img).done(()=> {
                    timer.done(()=> {
                        dfd.resolve(item);
                    })
                }).fail(noprize);
            }).fail(noprize)
        } else {
            webApi.noPrize().always(noprize);
        }
        finish.done(()=> {
            showResult(item);
            lock = false;
        })
    };
    var $underlay = $("#underlay"), $sharePage = $("#sharePage"),$slotPage=$("#slotPage");
    var showTip = ($dom)=> {
        $dom.removeClass("hidden").siblings().addClass("hidden");
    }
    var showResult = (item)=> {
            if (item.index) {//有奖品
                showPrize(item);
            } else {
                showNoPrize(item);
            }
        },
        showRule = (noClose)=> {
            var $rule = $("#rule");
            showTip($rule);
            if (noClose===true) {
                $rule.addClass("noClose");
            } else {
                $rule.removeClass("noClose");
            }
            $underlay.removeClass("hidden");
        },
        showShare = ()=> {
            $("#shareTip").removeClass('hidden');
        },
        showPrize = (item,got)=> {//got ,已经领取过的为true
            var img = basePath + "/img/" + item.img;
            var $gotPrize = $("#gotPrize");
            if(got){
                $gotPrize.addClass("got");
            }else{
                $gotPrize.removeClass('got');
            }
            showTip($gotPrize);;
            $underlay.removeClass("hidden");
        },
        showNoPrize = (item)=> {
            var img = basePath + "/img/" + item.img;
            showTip($("#noPrize"));
            $underlay.removeClass("hidden");
        },
        showCommit = ()=> {
            showTip($("#commitTim"));
            $underlay.removeClass("hidden");
        },
        showFriendsList = ()=> {
            showTip($("#frendList"));
            $sharePage.removeClass("hidden");
        },
        commitLock = false,
        commitHandler = ()=> {
            if (commitLock)return;
            commitLock = true;
            var name = $("#nameInput").val(),
                phone = $("#phoneInput").val(),
                idNo = $("#idCardInput").val(),
                ok = false;
            if (!name || name.length < 2) {
                alert("请输入正确的姓名！");
            } else if (!phone || !/^1(3[0-9]|4[57]|5[0-35-9]|7[01678]|8[0-9])\d{8}$/.test(phone)) {
                alert("请输入正确的手机号");
            } else if (!idNo || idNo.length != 18) {
                alert("请输入正确的身份证号！");
            } else {
                ok = true;
            }
            if (ok) {
                webApi.commitInfo(name, phone, idNo).done(()=> {
                    //todo 提交成功之后如何？
                }).fail(()=> {
                    alert("提交失败，请重试!");
                }).always(()=> {
                    commitLock = false;
                })
            }else{
                commitLock = false;
            }
        }

    $("#goBtn").on('click', runSlot);
    $("#ruleBtn").on("click", showRule);
    $("#invite,#goMoreBtn,#btn").on("click", showShare);
    $("#btn2").on("click", showCommit);
    $("#showFriendsBtn,#btn3").on("click", showFriendsList);
    $("#closeList").on("click", ()=>$sharePage.addClass("hidden"));
    $("#rule .close").on('click', ()=>$underlay.addClass("hidden"));
    $("#commitBtn").on("click", commitHandler);
    $("#shareTip").on('click',()=> $("#shareTip").addClass("hidden"));

    // 好友打开部分
    // showRule(true);//背景为规则;
    var showNeedHelp = ()=> {
            showTip($("#needHelp"));
            $sharePage.removeClass("hidden");
        },
        showHelped = ()=> {
            showTip($("#helped"));
            $sharePage.removeClass("hidden");
        },
        helpLock = false,
        helpBtnHandler = ()=> {
            if (helpLock)return;
            helpLock = true;
            webApi.helpTa().done(showHelped).fail(()=> {
                alert("请重试！")
            }).always(()=>helpLock = false);

        },
        noHelpBtnHandler = ()=> {
            //todo;
            showRule(true);
            $sharePage.addClass("hidden");
        },
        joinBtnHandler = ()=> {
            //todo
        },
        noJoinBtnHandler = ()=> {
            //todo;
            showRule(true);
            $sharePage.addClass("hidden");
        };
    $("#helpBtn").on('click', helpBtnHandler);
    $("#noHelpBtn").on('click', noHelpBtnHandler);
    $("#joinBtn").on("click", joinBtnHandler);
    $("#noJoinBtn").on('click', noJoinBtnHandler);


    $(function () {







        $(window).on('load',function(){
        var $cBody = $slotPage;
        var allH = $(window).height(), allW = $(window).width(), sh = $cBody.height();
        // console.log(sh/allH);
        if (allH > allW) {
            var scale = allH / sh;
            $("#slotPage").css({
                "-webkit-transform": "scaleY(" + scale + ")", "-webkit-transform-origin": "0 0 0",
                "-ms-transform": "scaleY(" + scale + ")", "-ms-transform-origin": "0 0 0",
                "-moz-transform": "scaleY(" + scale + ")", "-moz-transform-origin": "0 0 0",
                "transform": "scaleY(" + scale + ")", "transform-origin": "0 0 0",
            });
        } else {

        }
            //后续会加一个加载中的loading页。

            var $mainPage = $("#slotPage");//根据不同的状态选取mainPage

            $mainPage.siblings().addClass("hidden");

            // showNeedHelp();
            //var item  =prize[prize_id];
            // showPrize(item);showPrize(item,true);//已领取
            // $("#loading").hide();
        })

    })

})();
