(async () => {
  const I = __rwI, R = I.renderer, sc = I.scene, sl = ms => new Promise(r => setTimeout(r, ms));
  const o = R.__o || (R.__o = R.setPixelRatio.bind(R)); R.setPixelRatio = () => {}; o(1); I.composer.setPixelRatio(1); I.composer.setSize(I.root.clientWidth, I.root.clientHeight);
  const lights = []; sc.traverse(x => { if (x.isLight) lights.push(x); });
  const info = lights.map(l => l.type + (l.castShadow ? '*' : '') + ':' + l.intensity.toFixed(1));
  let floor = null; sc.traverse(x => { if (x.isMesh && x.material && x.material.clearcoat > 0) floor = x; });
  const meas = async lab => { R.shadowMap.needsUpdate = true; await sl(900); const r = await __gpuT(I.composer, R, 2000, lab); return lab + ' => ' + r['0:RenderPass'] + ' ms (total ' + r.total + ')'; };
  const out = [JSON.stringify(info)];
  out.push(await meas('base'));
  const rects = lights.filter(l => l.isRectAreaLight);
  rects.forEach(l => sc.remove(l)); out.push(await meas('no rect')); rects.forEach(l => sc.add(l));
  const sh = lights.filter(l => l.castShadow); sh.forEach(l => l.castShadow = false); out.push(await meas('no shadows')); sh.forEach(l => l.castShadow = true);
  if (floor) { const cc = floor.material.clearcoat; floor.material.clearcoat = 0; floor.material.needsUpdate = true; out.push(await meas('floor no clearcoat')); floor.material.clearcoat = cc; floor.material.needsUpdate = true; }
  const spots = lights.filter(l => l.isSpotLight && !l.castShadow); spots.forEach(l => l.parent && (l.__p = l.parent, l.parent.remove(l))); out.push(await meas('no head spots')); spots.forEach(l => l.__p.add(l));
  rects.forEach(l => sc.remove(l)); sh.forEach(l => l.castShadow = false); spots.forEach(l => l.parent && l.parent.remove(l)); out.push(await meas('no rect+shadow+heads')); rects.forEach(l => sc.add(l)); sh.forEach(l => l.castShadow = true); spots.forEach(l => l.__p.add(l));
  R.setPixelRatio = o;
  return out.join('\n');
})()
