onmessage = (e) => {
    console.log("Worker: Message received from main script");

    //[firstHalf, exposureV, filter, noiseIntenseV, highlightsV, shadowsV]
    var data = e.data[0];
    const exposureS = e.data[1];
    var filter = e.data[2];
    const noiseIntenseS = e.data[3];
    const highlightsS = e.data[4];
    const shadowsS = e.data[5];
    const sparksIntenseV = e.data[6];
    const canvasW = e.data[7];

    //console.log("e:",exposureS);
    //console.log("f:",filter);
    //console.log("n:",noiseIntenseS);
    //console.log("h:",highlightsS);
    //console.log("s:",shadowsS);
    


    // Filters
    switch (filter){
        case "BN":
            for (let i = 0; i < data.length; i += 4) {
                let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
            }
            break;

        case "red":
            for (let i = 0; i < data.length; i += 4) {
                data[i + 1] = data[i + 2] = 0;
            }
            break;

        case "blue":
            for (let i = 0; i < data.length; i += 4) {
                data[i] = data[i + 1] = 0;
            }
            break;

        case "green":
            for (let i = 0; i < data.length; i += 4) {
                data[i] = data[i + 2] = 0;
            }
            break;

        case "crazy":
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] > data[i+1] && data[i] > data[i+2]){
                    data[i + 1] = data[i + 2] = 0;
                } else if (data[i+1] > data[i] && data[i+1] > data[i+2]){
                    data[i] = data[i + 2] = 0;
                } else if (data[i+2] > data[i] && data[i+2] > data[i+1]){
                    data[i] = data[i + 1] = 0;
                }
            }
            break;

        default:
            data = e.data[0];
    }

    const sparkIntenseLimit = 100000;
    const sparkLength = 3000;
    // render
    for (let i = 0; i < data.length; i += 4) {
        // sparks
        if (sparksIntenseV != 0 && Math.floor(Math.random() * sparkIntenseLimit) < sparksIntenseV){
            if (Math.round(Math.random()) == 0){
                // Dots
                let index = i;
                let last = 4;
                for (var j=0; j<Math.floor(Math.random() * sparkLength); j++){
                    if (index <= data.length){
                        path = generateDirection();
                        data[index] = 255;
                        data[index+1] = 255;
                        data[index+2] = 255;
                        
                        if (path == 0){
                            //Up
                            if (last == 1){
                                index -= 4*canvasW;
                                path = last;
                            } else {
                                index += 4*canvasW;
                            }

                        } else if (path == 1){
                            //Down
                            if (last == 0){
                                index += 4*canvasW;
                                path = last;
                            } else {
                                index -= 4*canvasW;
                            }

                        } else if (path == 2){
                            //Left
                            if (last == 3){
                                index += 4;
                                path = last;
                            } else {
                                index -= 4;
                            }

                        }else if (path == 3){
                            //Rigth
                            if (last == 2){
                                index -= 4;
                                path = last;
                            } else {
                                index += 4;
                            }
                        }
                        last = path;
                    }
                }
            } else{
                // Dots
                let index = i;
                let last = 4;
                dir = Math.round(Math.random());
                dirSide = Math.round(Math.random());
                for (var j=0; j<Math.floor(Math.random() * (sparkLength*1.5)); j++){
                    if (Math.floor(Math.random() * 50) == 1){
                        dir = Math.round(Math.random());
                    }
                    if (index <= data.length){
                        path = generateDirection();
                        data[index] = 255;
                        data[index+1] = 255;
                        data[index+2] = 255;
                        if (dir == 0){
                            // UP
                            index += 4*canvasW;
                        } else {
                            // Down
                            index -= 4*canvasW;
                        }   
                        
                        if (path == dirSide == 1){
                            //Left
                            index -= 4;

                        }else if (path == dirSide == 0){
                            //Rigth
                            index += 4;
                        }else if (path == 2 && dir == 0){
                            //Up
                            index += 4*canvasW;

                        }else if (path == 3 && dir == 1){
                            //Down
                            index -= 4*canvasW;
                        }


                        last = path;
                    }
                }
            }
        }


        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

        data[i] = data[i] - (-exposureS - (Math.floor(Math.random() * noiseIntenseS) - noiseIntenseS/2) - highlightsCurve(avg, highlightsS) - shadowCurve(avg, shadowsS));
        data[i+1] = data[i+1] - (-exposureS - (Math.floor(Math.random() * noiseIntenseS) - noiseIntenseS/2) - highlightsCurve(avg, highlightsS) - shadowCurve(avg, shadowsS));
        data[i+2] = data[i+2] - (-exposureS - (Math.floor(Math.random() * noiseIntenseS) - noiseIntenseS/2) - highlightsCurve(avg, highlightsS) - shadowCurve(avg, shadowsS));
        
    }
    console.log("Worker: Posting message back to main script");
    //console.log("Worker data:",data);
    postMessage(data);
    self.close();
};

function shadowCurve(x, b){
    return Math.floor(b*1/(Math.sqrt(2.0*3.14))*Math.exp(-(1/2)*((x-0)/42)*((x-0)/42))); //Lets hope this works bby
}
function highlightsCurve(x, b){
    return Math.floor(b*1/(Math.sqrt(2.0*3.14))*Math.exp(-(1/2)*((x-255)/64)*((x-255)/64)));
}

function generateDirection(){
    return Math.floor(Math.random()*4);
}