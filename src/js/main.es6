(function () {
    var basePath = window.basePath || "./";
    var delay = 1000;//毫秒
    var soltNum = 10;
    // 仅供调试
    var baseUrl = "http://mothersday.tangguo360.com";
    var scope = "/user"; // 会有2种：user 或者 member

    var webApi = (()=> {
        var noPrize = ()=> {
                return $.ajax({url: baseUrl + scope + "/decrease", type: "GET"});
            },
            loadPrize = ()=> {
                return $.ajax({url: baseUrl + scope + "/lucky", type: "GET"});
            },
            commitInfo = (name, phone, idNo)=> {
                let data = {
                    name: name,
                    phone: phone,
                    idNo: idNo
                }
                return $.ajax({
                    url: baseUrl + scope + "/accept",
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]')
                            .attr('content'))},
                    data: data,
                    type: "POST"
                });
            }, helpTa = ()=> {
                let user_id = window.voteUserId;
                return $.ajax({url: baseUrl + scope + "/vote/" + user_id, type: "GET"});
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
        odds: 1,//中奖率
        0: {//未中奖
            pos: "-500%",
            index: 0
            // img:
        },
        6: {
            pos: "-400%",
            img: "interest.png",
            index: 1
        },
        7: {
            pos: "-300%",
            img: "korea.png",
            index: 2
        },
        8: {
            pos: "-200%",
            img: "disney.png",
            index: 3
        },
        9: {
            pos: "-100%",
            img: "redbag.png",
            index: 4
        },
        10: {
            pos: "0",
            img: "oilCard.png",
            index: 5
        }
    }, prize4 = {
        odds: 1,//中奖率，缺未中奖
        top: "-600%",
        0: {//未中奖
            pos: '-400%',
            index: 0
            // img:
        },
        2: {
            pos: '-300%',
            img: "travel.png",
            index: 1
        },
        1: {
            pos: '-200%',
            img: "iphone.png",
            index: 2
        },
        4: {
            pos: '-100%',
            img: 'ticket.png',
            index: 3
        },
        3: {
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
                // 返回格式为 {"error": 0, "prize_id": prize_id}
                // 或者错误 {"error": 1, "message": 没有可用次数 }
                // 如果返回 prize_id 为 0， 则表示未中奖
                // 奖品ID 是存在同一个表中的，所以ID是从1 -> 9

                // 有错误就直接返回
                if (res.error == 1) {
                    alert(res.message);
                    noprize()
                    return
                }
                if (res.prize_id == 0) {
                    noprize()
                    return
                }

                item = prize[res.prize_id];//todo奖品的id;
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
        var $mainPage ;
            if( window.hasVoted!=0){//已抽过
                var prizeId =  window.userPrizeId||0,item = prize[prizeId]||prize[0];
                if(item.index==0){
                    showNoPrize(item);
                }else{
                    let got = window.userPrizeAccepted==0?false:true;
                    showPrize(item,got);
                }
                $mainPage = $underlay;
            }else{
                $mainPage = $("#slotPage");//根据不同的状态选取mainPage
            }

            $mainPage.siblings().addClass("hidden");

            // showNeedHelp();
            //var item  =prize[prize_id];
            // showPrize(item);showPrize(item,true);//已领取
            // $("#loading").hide();
        })

    })

})();
