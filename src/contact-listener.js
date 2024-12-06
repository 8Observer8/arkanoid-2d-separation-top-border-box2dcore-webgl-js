import { b2ContactListener, b2WorldManifold, b2Vec2 } from "@box2d/core";

export default class ContactListener extends b2ContactListener {

    constructor(world, rocketHalfWidth, ballVelocity, pixelsPerMeter) {
        super();
        this.world = world;
        this.rocketHalfWidth = rocketHalfWidth;
        this.ballVelocity = ballVelocity;
        this.pixelsPerMeter = pixelsPerMeter;

        this.topBorder0 = document.getElementById("topBorder0");
        this.topBorder1 = document.getElementById("topBorder1");

        this.block0 = document.getElementById("block0");
        this.block1 = document.getElementById("block1");

        this.racket0 = document.getElementById("racket0");
        this.racket1 = document.getElementById("racket1");
    }

    hitFactor(ballPosX, racketPosX) {
        // ascii art:
        //
        // -1  -0.5  0  0.5   1  <- x value
        //  ===================  <- racket
        //
        return (ballPosX - racketPosX) / this.rocketHalfWidth;
    }

    BeginContact(contact) {
        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();
        const nameA = fixtureA.GetUserData().name;
        const nameB = fixtureB.GetUserData().name;

        let ballBody;

        let racketBody;
        if (nameA === "ball" && nameB === "racket") {
            ballBody = fixtureA.GetBody();
            racketBody = fixtureA.GetBody();
            // console.log(fixtureA.GetBody().GetLinearVelocity().y);
        } else if (nameA === "racket" && nameB === "ball") {
            ballBody = fixtureB.GetBody();
            racketBody = fixtureA.GetBody();
        }
        if (ballBody && racketBody) {
            const ballPosX = ballBody.GetPosition().x * this.pixelsPerMeter;
            const racketPosX = racketBody.GetPosition().x * this.pixelsPerMeter;
            const hf = this.hitFactor(ballPosX, racketPosX);
            const dir = new b2Vec2(hf, 1);
            dir.Normalize();
            ballBody.SetLinearVelocity(new b2Vec2(dir.x * this.ballVelocity,
                dir.y * this.ballVelocity));
        }

        let leftBorderBody;
        if (nameA === "ball" && nameB === "leftBorder") {
            ballBody = fixtureA.GetBody();
            leftBorderBody = fixtureB.GetBody();
        } else if (nameA === "leftBorder" && nameB === "ball") {
            ballBody = fixtureB.GetBody();
            leftBorderBody = fixtureA.GetBody();
        }
        if (ballBody && leftBorderBody) {
            const vel = ballBody.GetLinearVelocity();
            vel.x = (-1) * vel.x;
        }

        let rightBorderBody;
        if (nameA === "ball" && nameB === "rightBorder") {
            ballBody = fixtureA.GetBody();
            rightBorderBody = fixtureB.GetBody();
        } else if (nameA === "rightBorder" && nameB === "ball") {
            ballBody = fixtureB.GetBody();
            rightBorderBody = fixtureA.GetBody();
        }
        if (ballBody && rightBorderBody) {
            const vel = ballBody.GetLinearVelocity();
            vel.x = (-1) * vel.x;
        }

        let topBorderBody;
        if (nameA === "ball" && nameB === "topBorder") {
            ballBody = fixtureA.GetBody();
            topBorderBody = fixtureB.GetBody();
        } else if (nameA === "topBorder" && nameB === "ball") {
            ballBody = fixtureB.GetBody();
            topBorderBody = fixtureA.GetBody();
        }
        if (ballBody && topBorderBody) {
            const vel = ballBody.GetLinearVelocity();
            vel.y = (-1) * vel.y;
        }

        let blockBody;
        if (nameA === "ball" && nameB === "block") {
            // ballBody = fixtureA.GetBody();
            // blockBody = fixtureB.GetBody();
            // metaData[getPointer(fixtureB)].isVisible = false;
            // console.log("ball <---> block");
        } else if (nameA === "block" && nameB === "ball") {
            // ballBody = fixtureB.GetBody();
            // blockBody = fixtureA.GetBody();
            // metaData[getPointer(fixtureA)].isVisible = false;
            // console.log("ball <---> block");
        }
        // if (ballBody && blockBody) {
        //     setTimeout(() => self.world.DestroyBody(blockBody), 0);
        // }
    }

    EndContact(contact) {}

    PreSolve(contact, oldManifold) {
        const worldManifold = new b2WorldManifold();
        contact.GetWorldManifold(worldManifold);
        // const numPoints = worldManifold.pointCount;
        const points = worldManifold.points;
        // console.log(points.length);

        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();
        const nameA = fixtureA.GetUserData().name;
        const nameB = fixtureB.GetUserData().name;
        // console.log(nameA, nameB);

        let ballBody;

        let topBorderBody;
        if (nameA === "ball" && nameB === "topBorder") {
            ballBody = fixtureA.GetBody();
            topBorderBody = fixtureB.GetBody();
        } else if (nameA === "topBorder" && nameB === "ball") {
            ballBody = fixtureB.GetBody();
            topBorderBody = fixtureA.GetBody();
        }
        if (ballBody && topBorderBody) {
            this.topBorder0.innerText = worldManifold.separations[0];
            this.topBorder1.innerText = worldManifold.separations[1];
        }

        let blockBody;
        if (nameA === "ball" && nameB === "block") {
            ballBody = fixtureA.GetBody();
            blockBody = fixtureB.GetBody();
        } else if (nameA === "block" && nameB === "ball") {
            ballBody = fixtureB.GetBody();
            blockBody = fixtureA.GetBody();
        }
        if (ballBody && blockBody) {
            this.block0.innerText = worldManifold.separations[0];
            this.block1.innerText = worldManifold.separations[1];
        }

        let racketBody;
        if (nameA === "ball" && nameB === "racket") {
            ballBody = fixtureA.GetBody();
            racketBody = fixtureA.GetBody();
        } else if (nameA === "racket" && nameB === "ball") {
            ballBody = fixtureB.GetBody();
            racketBody = fixtureA.GetBody();
        }
        if (ballBody && racketBody) {
            this.racket0.innerText = worldManifold.separations[0];
            this.racket1.innerText = worldManifold.separations[1];
        }

        // for (let i = 0; i < points.length; ++i) {
        //     const separation = worldManifold.separations[i];
        //     console.log(separation);
        //     // -0.01499
        //     // -0.0033333
        //     // -0.00019531
        //     // -0.0031380208333543214
        //     if (separation > -0.0032)
        //         console.log("collision");
        // }
    }

    PostSolve(contact) {}
}
