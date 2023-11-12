function approx_fraction(number) {
    floating = number % 1;
    var nearest_dist = 99999;
    var nearest = -1;
    for (var i = 1; i < 1000;i++){
        var unit = floating * i;
        var frac = unit % 1;
        if (Math.abs(frac) > 0.5) var dist = 1 - Math.abs(frac);
        else var dist = Math.abs(frac);
        if (nearest_dist > dist){
            nearest_dist = dist;
            nearest = i;
        }
    }
    if (nearest_dist > 0.00001) return [number, 1];
    return [Math.round(number * nearest), nearest]
}

function fraction2str(fraction) {
    if (fraction[1] == 1) return '' + fraction[0];
    return fraction[0] + "/" + fraction[1];
}