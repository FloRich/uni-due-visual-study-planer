function wheel() {  // mousewheel
    var dz, newZ;
    var slow = d3.event.altKey ? 0.25 : 1;
    if (d3.event.wheelDeltaY !== 0) {  // up-down
        dz = Math.pow(1.2, d3.event.wheelDeltaY * 0.001 * slow);
        newZ = limitZ(curZ * dz);
        dz = newZ / curZ;
        curZ = newZ;

        curX -= (d3.event.clientX - curX) * (dz - 1);
        curY -= (d3.event.clientY - curY) * (dz - 1);
        setview();
    }
    if (d3.event.wheelDeltaX !== 0) {  // left-right
        curR = limitR(curR + d3.event.wheelDeltaX * 0.01 * slow);
        update(root);
    }
}
