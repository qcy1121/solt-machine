(function(){
    var basePath =window.basePath||"./";
    var animate = ($dom,dir,top,time,dfd)=>{
        if(!$dom)return;
        // dir=dir=='margin-left'?"margin-left":"top";
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
            }else{
                run(cb)
            }
        };
        run(cb);

    }
    var prize5={
        top:"-600%",
        odds:0.5,//中奖率
        0:{//未中奖
            pos:"-500%",
            // img:
        },
        1:{
            pos:"-400%",
            img:"interest.png"
        },
        2:{
            pos:"-300%",
            img:"korea.png"
        },
        3:{
            pos:"-200%",
            img:"disney.png"
        },
        4:{
            pos:"-100%",
            img:"redbag.png"
        },
        5:{
            pos:"0",
            img:"oilCard.png"
        }
    },prize4={
        odds:1,//中奖率
        top:"-600%",
        0:{
            pos:'-400%',
            // img:
        },
        1:{
            pos:'-300%',
            img:"travel.png"
        },
        2:{
            pos:'-200%',
            img:"iphone.png"
        },
        3:{
            pos:'-100%',
            img:'ticket.png'
        },
        4:{
            pos:'0',
            img:'oilCard.png'
        }
    }
    var runSlot =()=>{
        var dfd  =$.Deferred();
        animate($("#prize"),"top","-600%",1000,dfd.promise());

    }

   $("#goBtn").on('click',runSlot)
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
