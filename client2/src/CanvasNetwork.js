/*
done by pradeep using github copilot 2222dfgdfg
*/
import React, { useEffect, useRef } from 'react';

const API_URL = 'http://localhost:5000/api/records';



const imageSize = 50;
const xSpacing = 50;
const ySpacing = 100;

const imageTypes = ['s1', 's2', 's3', 's4'];
let networkObj = [];

function loadImages(types) {
    const cache = {};
    return Promise.all(
        types.map(type => {
            return new Promise(resolve => {
                const img = new window.Image();
                img.src = process.env.PUBLIC_URL + `/${type}.svg`;
                img.onload = () => {
                    cache[type] = img;
                    resolve();
                };
            });
        })
    ).then(() => cache);
}

function drawNode(ctx, imgCache, type, label, x, y, label2) {
    const img = imgCache[type];
    if (img) {
        ctx.drawImage(img, x, y, imageSize, imageSize);
        ctx.fillStyle = 'black';
        ctx.font = '9px Arial';
        ctx.fillText(label, x + 10, y + 30);
        if (label2) {
            ctx.fillText(label2, x , y + 60);
        }
    }
}

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawLineShape1(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, y2 + imageSize / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1, y2 + imageSize / 2);
    ctx.lineTo(x1 - imageSize / 2, y2 + imageSize / 2);
    ctx.stroke();
}

function drawLineShape3(ctx, x1, x2, y1) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y1);
    ctx.stroke();
}


function traverseLeafToRoot(networkObj) {
  if (!networkObj || !networkObj.network) return;

  networkObj.network.forEach(site => {
    const siteName = site["s1-site"];
    // let siteQty = 0;
    site["s2-products"].forEach(product => {
      const productId = product["s2-product"].id;
      const productName = product["s2-product"].name;
    //   let productQty = 0;
      product["s3-activities"].forEach(activity => {
        const activityId = activity["s3-activity"].id;
        const activityName = activity["s3-activity"].name;
        // let activityQty = 0;
        activity["s4-resources"].forEach(resource => {
          const resourceId = resource["s4-resource"].id;
          const resourceName = resource["s4-resource"].name;


        //   let resourceQty = resource["s4-resource"].consumedQty;
        //   resource.total = resourceQty;

        //   activityQty += resourceQty * activity["s3-activity"].consumedQty;
        //   activity["s3-activity"].total = activityQty;

        //   productQty += activityQty * product["s2-product"].consumedQty;
        //   product["s2-product"].total = productQty;

        //   siteQty += resourceQty * site["s1-site"].consumedQty;
        //   site["s1-site"].total = siteQty;

          // Display from leaf to root
          console.log(
            `Resource: ${resourceName} (${resourceId}) -> Activity: ${activityName} (${activityId}) -> Product: ${productName} (${productId}) -> Site: ${siteName}`
          );
        });
      });
    });
  });
  return networkObj
}

const createNetworkDataObject = (rows) => {

    const network = [];
    const siteMap = {};

    for (var i = 0; i < rows.length; i++) {
        
        const componentId = rows[i].componentId;

        if (rows[i].level == 0) {
            const siteKey = rows[i].componentUuid;
            siteMap[siteKey] = {
                "s1-site":  { id: rows[i].componentUuid, name: componentId, consumedQty: rows[i].consumedQty, total: rows[i].total },
                "s2-products": []
            };
            network.push(siteMap[siteKey]);
        }


        if (rows[i].level == 1 ) {
            let siteObj = siteMap[rows[i].parentUuid];
            if (siteObj) {
                siteObj["s2-products"].push({
                    "s2-product": { id: rows[i].componentUuid, name: componentId, consumedQty: rows[i].consumedQty, total: rows[i].total },
                    "s3-activities": []
                });
            }
        }


        if (rows[i].level == 2 ) {
            let product = rows.find(r => r.componentUuid === rows[i].parentUuid);
            let site = product ? rows.find(r => r.componentUuid === product.parentUuid) : null;
            let productObj = siteMap[site.componentUuid]["s2-products"].find(p => p["s2-product"].id === product.componentUuid);
            if (productObj) {
                
                productObj["s3-activities"].push({
                    "s3-activity": { id: rows[i].componentUuid, name: componentId , consumedQty: rows[i].consumedQty, total: rows[i].total },
                    "s4-resources": []
                });
                
            }
        }


        if (rows[i].level == 3 ) {
            let activity = rows.find(r => r.componentUuid === rows[i].parentUuid);
            let product = activity ? rows.find(r => r.componentUuid === activity.parentUuid) : null;
            let site = product ? siteMap[product.parentUuid] : null;
            let productObj = site ? site["s2-products"].find(p => p["s2-product"].id === product.componentUuid) : null;
            let activityObj = productObj ? productObj["s3-activities"].find(a => a["s3-activity"].id === activity.componentUuid) : null;
            
            if (activityObj) {
                const resourceObj = rows[i];
                let resourceTotal = activityObj["s3-activity"].consumedQty * resourceObj.consumedQty;
                
                activityObj["s3-activity"].total += resourceTotal;
                productObj["s2-product"].total += activityObj["s3-activity"].total;
                activityObj["s4-resources"].push({
                    "s4-resource": { id: rows[i].componentUuid, name: componentId , consumedQty: rows[i].consumedQty, total: resourceTotal },
                });
            }
        }

    }

    console.log("Network Data Object:", { "network": network });

    return network;

};

const CanvasNetwork = () => {
    const canvasRef = useRef(null);


    useEffect(() => {

        fetch(API_URL)
            .then(response => response.json())
            .then(data => {                
                data.sort((a, b) => a.level - b.level);
                let networkObj1 = {'network':createNetworkDataObject(data)};
                networkObj = traverseLeafToRoot(networkObj1);

                
            })
            .catch(error => console.error('Error fetching data:', error));


        let imgCache = {};
        let isMounted = true;
        loadImages(imageTypes).then(cache => {
            if (!isMounted) return;
            imgCache = cache;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Set canvas background to white
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = '9px Arial';
            ctx.fillStyle = 'black';

            // Drawing logic
            const startX = 650;
            const startY = 40;
            const site = networkObj.network[0];
            const s1Label = site["s1-site"].name;
            const s1X = startX;
            const s1Y = startY;
            let loop4X = 660;
            let loop3X = 600;
            drawNode(ctx, imgCache, 's1', s1Label, s1X, s1Y);
            site["s2-products"].forEach((product, pIdx) => {
                const s2Label = product["s2-product"].name;
                const productTotal = product["s2-product"].total;
                const s2X = s1X - xSpacing;
                const s2Y = s1Y + ySpacing;
                drawNode(ctx, imgCache, 's2', s2Label, s2X, s2Y, productTotal);
                drawLineShape1(ctx, s1X + imageSize / 2, s1Y + imageSize, s2X + imageSize / 2, s2Y);
                product["s3-activities"].forEach((activity, aIdx) => {
                    const s3Label = activity["s3-activity"].name;
                    const s3Y = s2Y + ySpacing;
                    const s3LineX2 = loop3X - imageSize * activity["s4-resources"].length;
                    drawNode(ctx, imgCache, 's3', s3Label, loop3X, s3Y, activity["s3-activity"].total);
                    if (product["s3-activities"].length - 1 !== aIdx) {
                        drawLineShape3(ctx, loop3X, s3LineX2, s3Y + 25);
                    }
                    if (aIdx === 0) drawLine(ctx, loop3X + 25, s3Y, loop3X + 25, s2Y + 45);
                    activity["s4-resources"].forEach((resource, rIdx) => {
                        const s4Label = resource["s4-resource"].name;
                        const resourceTotal = resource["s4-resource"].total;
                        const s4Y = s3Y + ySpacing;
                        loop4X -= imageSize + 10;
                        loop3X -= imageSize + 10;
                        drawNode(ctx, imgCache, 's4', s4Label, loop4X, s4Y, resourceTotal);
                        if (activity["s4-resources"].length - 1 !== rIdx)
                            drawLineShape3(ctx, loop4X - imageSize, loop4X, s4Y + 25);
                        if (rIdx === 0)
                            drawLine(ctx, loop4X + 25, s4Y, loop4X + 25, s3Y + 45);
                    });
                });
            });
        });
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
            <h2>Transport Network </h2>
            <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid #ccc', borderRadius: 16 }} />
            
        </div>
    );
};

export default CanvasNetwork;
