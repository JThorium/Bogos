export function projectAndDrawWireframe(model, x, y, size, angles, color, lineWidth) {
    if (!model || color === 'transparent') return;
    const projected = [];
    const { vertices, edges } = model;

    vertices.forEach(v => {
        let rotX = v.y * Math.cos(angles.x) - v.z * Math.sin(angles.x);
        let rotZ = v.y * Math.sin(angles.x) + v.z * Math.cos(angles.x);

        let rotY = v.x * Math.cos(angles.y) + rotZ * Math.sin(angles.y);
        rotZ = -v.x * Math.sin(angles.y) + rotZ * Math.cos(angles.y);

        let rotX2 = rotY * Math.cos(angles.z) - rotX * Math.sin(angles.z);
        let rotY2 = rotY * Math.sin(angles.z) + rotX * Math.cos(angles.z);

        projected.push({ x: rotX2 * size / 20 + x, y: rotY2 * size / 20 + y });
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    edges.forEach(edge => {
        const p1 = projected[edge[0]];
        const p2 = projected[edge[1]];
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    });
    ctx.stroke();
}
