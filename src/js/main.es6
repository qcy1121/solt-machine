(function(){
    var animate = ($dom,top,time,dfd)=>{
        if(!$dom)return;
        time = time||1000;
        let flag = false;
        let run = (cb)=>{
            $dom.animate({"top":top},time,"linear",cb)
        }
        dfd&&dfd.done((newTop,newTime)=>{
            time = newTime||time;
            top = newTop||top;
            flag = true;
        });
        let cb =()=>{
            $dom.css("top",0);
            if(flag){
                $dom.animate({top:top},time,"linear");
            }else{
                run(cb)
            }
        };
        run(cb);

    }

   $("#goBtn").on('click',()=>{
       var dfd  =$.Deferred();
       setTimeout(()=>{
           dfd.resolve("-200%")
       },10*1000)
       animate($("#prize"),"-500%",2*1000,dfd.promise());
   })
    $(function(){
        var allH=$(window).height(),sh= $("#slotPage").height();
        console.log(sh/allH);
        //todo 压缩
    })

})();
