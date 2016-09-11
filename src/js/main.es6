(function(){
    var basePath =window.basePath||"./";
    var delay=1000;//毫秒
    var webApi =(()=>{
        var noPrize=()=>{
            return $.ajax();
        },
            loadPrize=()=>{
                return $.ajax();
            },
            commitInfo=(name,phone,idNo)=>{
                let data ={
                    name:name,
                    phone:phone,
                    idNo:idNo
                }
                return $.ajax();
            }
            return{
                noPrize:noPrize,
                loadPrize:loadPrize,
                commitInfo:commitInfo
            }
    })();
    var animate = ($dom,dir,top,time,dfd)=>{
        if(!$dom)return;
        // dir=dir=='margin-left'?"margin-left":"top";
        var defer=$.Deferred()
        time = time||1000;
        let flag = false;
        let moveObj={};
        moveObj[dir]=top;
        let run = (cb)=>{
            $dom.animate(moveObj,time,"linear",cb)
        }
        dfd&&dfd.done((newTop,newTime)=>{
            time = newTime||time;
            top = newTop||top;
            flag = true;
        });
        let cb =()=>{
            $dom.css(dir,0);
            if(flag){
                moveObj[dir]=top;
                $dom.animate(moveObj,time,"linear");
                defer.resolve();
            }else{
                run(cb)
            }
        };
        run(cb);
        return defer.promise();
    },
        isHavePrize=(prize)=>{
            var random=Math.random();
            if(random<prize.odds){//中奖
                return true;
            }else{
                //未中
                return false;
            }
        }
    var prize5={
        top:"-600%",
        odds:0.5,//中奖率
        0:{//未中奖
            pos:"-500%",
            index:0
            // img:
        },
        1:{
            pos:"-400%",
            img:"interest.png",
            index:1
        },
        2:{
            pos:"-300%",
            img:"korea.png",
            index:2
        },
        3:{
            pos:"-200%",
            img:"disney.png",
            index:3
        },
        4:{
            pos:"-100%",
            img:"redbag.png",
            index:4
        },
        5:{
            pos:"0",
            img:"oilCard.png",
            index:5
        }
    },prize4={
        odds:1,//中奖率
        top:"-600%",
        0:{
            pos:'-400%',
            index:0
            // img:
        },
        1:{
            pos:'-300%',
            img:"travel.png",
            index:1
        },
        2:{
            pos:'-200%',
            img:"iphone.png",
            index:2
        },
        3:{
            pos:'-100%',
            img:'ticket.png',
            index:3
        },
        4:{
            pos:'0',
            img:'oilCard.png',
            index:4
        }
    }
    var prize=window.prizeType=="prize5"?prize5:prize4;
    var lock =false;
    var runSlot =()=>{
        if(lock)return;
        lock=true;
        var dfd  =$.Deferred();
        var finish =animate($("#prize"),"top",prize.top,delay,dfd.promise());
        var noprize=()=>{
            var item =prize[0];;
            dfd.resolve(item);
        }
        if(isHavePrize(prize)){
            webApi.loadPrize().done((res)=>{
                var item =prize[ res.data.prizeId];
                dfd.resolve(item);
            }).fail(noprize)
        }else{
            webApi.noPrize().always(noprize);
        }
        finish.done(()=>{
            lock=false;
        })
    }

   $("#goBtn").on('click',runSlot);
    // $("#floatTop")
    // $("#floatBottom")
    // $(function(){
    //     var $cBody = $("#slotPage");
    //     var allH=$(window).height(),allW=$(window).width(),sh= $cBody.height();
    //     // console.log(sh/allH);
    //     if(allH>allW) {
    //         var scale = allH / sh;
    //         $cBody.css({
    //             "-webkit-transform": "scaleY(" + scale + ")", "-webkit-transform-origin": "0 0 0",
    //             "-ms-transform": "scaleY(" + scale + ")", "-ms-transform-origin": "0 0 0",
    //             "-moz-transform": "scaleY(" + scale + ")", "-moz-transform-origin": "0 0 0",
    //             "transform": "scaleY(" + scale + ")", "transform-origin": "0 0 0",
    //         });
    //     }else{
    //
    //     }
    // })

})();
