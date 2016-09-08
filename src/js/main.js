"use strict";

(function () {
    var animate = function animate($dom, top, time, dfd) {
        if (!$dom) return;
        time = time || 1000;
        var flag = false;
        var run = function run(cb) {
            $dom.animate({ "top": top }, time, "linear", cb);
        };
        dfd && dfd.done(function (newTop, newTime) {
            time = newTime || time;
            top = newTop || top;
            flag = true;
        });
        var cb = function cb() {
            if (flag) {
                $dom.animate({ top: top }, time, "linear");
            } else {
                run(cb);
            }
        };
        run(cb);
    };

    animate();
})();

//# sourceMappingURL=main.js.map