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
            if(flag){
                $dom.animate({top:top},time,"linear");
            }else{
                run(cb)
            }
        };
        run(cb);

    }

    animate();

})();