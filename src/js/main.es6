(function(){
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

   $("#goBtn").on('click',()=>{
       var dfd  =$.Deferred();
       setTimeout(()=>{
           dfd.resolve("-200%");
       },10*1000)
       animate($("#prize"),"top","-500%",2*1000,dfd.promise());
   })
    // animate($("#floatTop"),"margin-left","-100%",2*1000);
    // animate($("#floatBottom"),"margin-left","-100%",2*1000);
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
