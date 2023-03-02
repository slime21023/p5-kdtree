
class KDtree {

    static computeEdges(dataPoints, axis, {minX, maxX, minY, maxY}, leafsize=10) {
        let edges = []
        if (dataPoints.length < leafsize) {
            return edges
        }
        
        const { median, left, right } = KDtree.partition(dataPoints, axis)
        if (axis==0) {
            edges = [{ 
                startX: median.x,
                startY: minY,
                endX: median.x,
                endY: maxY
            }]
        } else {
            edges = [{ 
                startX: minX,
                startY: median.y,
                endX: maxX,
                endY: median.y
            }]
        }

        // compute subtree edges
        if (left.length >= leafsize) {
            const  leftBound = { 
                minX, 
                maxX: (axis==0) ? median.x : maxX,
                minY,
                maxY: (axis==0) ? maxY: median.y
            }
            edges = edges.concat(KDtree.computeEdges(left, (axis +1)%2, leftBound, leafsize))
        }

        if (right.length >= leafsize) {
            const rightBound = {
                minX: (axis == 0) ? median.x : minX,
                maxX,
                minY: (axis == 0) ? minY : median.y,
                maxY 
            }
            edges = edges.concat(KDtree.computeEdges(right, (axis +1)%2, rightBound, leafsize))
        }

        return edges
    }

    static partition(datapoints, axis) {
        const comparer = (a, b) => {
            if(axis == 0) {
                return a.x - b.x;
            }
            return a.y - b.y;
        }

        let sortedPoints = datapoints.sort(comparer)
        let mid = Math.floor(datapoints.length / 2)

        return {
            median: sortedPoints[mid],
            left: sortedPoints.slice(0, mid),
            right: sortedPoints.slice(mid, datapoints.length)
        }
    }

    static getTotalDepth(tree) {
        if(tree.median == null) {
            return 0
        }

        let leftDepth = KDtree.getTotalDepth(tree.left)
        let rightDepth = KDtree.getTotalDepth(tree.right)

        let depth = (leftDepth >= rightDepth) ? leftDepth : rightDepth
        return depth + 1  
    }

    static filteByDepth(depth) {
        
    }

    constructor(datapoints,  leafsize=10, depth=0) {
        this.axis = depth % 2
        this.depth = depth
        if (datapoints.length >= leafsize) {
            const { median, left, right } = KDtree.partition(datapoints, (depth+1) %2)
            this.median = median
            this.left = new KDtree(left, leafsize, depth+1)
            this.right = new KDtree(right, leafsize, depth+1)
        } else {
            this.datapoints = datapoints
            this.left = null
            this.right = null
            this.median = null
        }
    }
}



let dataPoints = [];
let pointNum = 200; 
let edges = []
let tree;
let totalDepth = 0;

function setup() {
    let leafsize = 4
    createCanvas(400, 400)
    for(i = 0; i < pointNum; i++) {
        dataPoints[i] = { x: random(10, 390), y: random(10, 390) }
    }

    edges = KDtree.computeEdges(dataPoints, 0, {
        minX: 0, maxX: 400, minY: 0, maxY: 400
    }, leafsize)

    tree = new KDtree(dataPoints, leafsize)
    totalDepth = KDtree.getTotalDepth(tree)
    console.log(totalDepth)
}


function draw() {
    background(220);
    stroke('purple');
    strokeWeight(5);

    for(i = 0; i < pointNum; i++) {
        point(dataPoints[i].x, dataPoints[i].y);
    }


    stroke('green');
    for(edge of edges) {
        const { startX, startY, endX, endY } = edge
        line(startX, startY, endX, endY)
    }
    // point(30, 20);
    // point(85, 20);
}