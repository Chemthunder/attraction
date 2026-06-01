enablePrint()

module Attraction { /// Primary Source
    export const entries = Entries.create();
    export const pack = new DataCompound("Attraction");

    export const MAIN = new Game(
        "Attraction",
        {
            author: "Chemthunder",
            version: 1.0,
            license: "ARR",
            desc: "Finding the mysteries of gravity..."
        }
    );
}

namespace Attraction.Maps {
    export const playerSpawnerTile = createImage(
        16,
        16,
        game.Color.Red
    );
    export const levelCallTile = createImage(
        16,
        16,
        game.Color.Yellow
    );
    export const flipTile = createImage(
        16,
        16,
        game.Color.LightBlue
    );
    export const killTile = createImage(
        16,
        16,
        game.Color.Purple
    );
    export const emptyTile = image.create(
        16,
        16
    );

    export let currentLevel = 0;

    export let spawnLocationR = 0;
    export let spawnLocationC = 0;

    /**
     * Loads a map from an id.
     * @param id The numeric id of the map.
     * @param target The player.
     */
    export function load(id: number, target: Sprite) {
        switch (id) {
            case 0: {
                tiles.setCurrentTilemap(tilemap`level1`);
                break;
            }
            case 1: {
                tiles.setCurrentTilemap(tilemap`level2`);
                break;
            }
            case 2: {
                tiles.setCurrentTilemap(tilemap`level3`);
                break;
            }
            case 3: {
              tiles.setCurrentTilemap(tilemap`level4`);
                break;
            }
            case 4: {
                tiles.setCurrentTilemap(tilemap`level5`);
                break;
            }

            default: {
                throw Exception.of("Unable to load non-existing level!");
            }
        }

        const points: tiles.Location[] = tiles.getTilesByType(playerSpawnerTile);
        const potentialWalls: tiles.Location[] = tiles.getTilesByType(createImage(16, 16, 1));

        for (let i of points) {
            tiles.placeOnTile(
                target,
                i
            );

            spawnLocationR = i.row;
            spawnLocationC = i.col;

            tiles.setTileAt(
                i,
                emptyTile
            );
        }

        for (let i of potentialWalls) {
            tiles.setWallAt(
                i,
                true
            );
        }

        currentLevel = id;

        Anchor.setAnchor(Anchor.AnchorDirection.DOWN);
        Anchor.applyGravity(target);
    }
}

namespace Attraction.Lang {
    /**
     * Gets the level name as a string.
     * @param id The id of the level.
     */
    export function getLevelName(id: number): string {
        switch (id) {
            case 0: {
                return "Welcome";
            }
            case 1: {
                return "Slates";
            }
            case 2: {
                return "Up & Down";
            }
            case 3: {
                return "Finding Roots";
            }
            case 4: {
                return "Around & Around";
            }
        }

        return "level name";
    }
}

/**
 * The game-wide gravity engine.
 */
namespace Attraction.Anchor {
    export const jumpY = 210;
    export const jumpX = 210;

    export let currentAnchor = Anchor.AnchorDirection.DOWN;

    export let canFlip = true;
    export let flipCooldown = 20;

    export enum AnchorDirection {
        DOWN,
        UP,
        LEFT,
        RIGHT
    }

    export const Directions = [
        AnchorDirection.DOWN,
        AnchorDirection.UP,
        AnchorDirection.LEFT,
        AnchorDirection.RIGHT
    ];

    export const Colliders = [
        CollisionDirection.Bottom,
        CollisionDirection.Top,
        CollisionDirection.Left,
        CollisionDirection.Right
    ];

    /**
     * Sets the current anchor.
     * @param a The anchor to set to.
     */
    export function setAnchor(a: AnchorDirection) {
        currentAnchor = a;
    }

    /**
     * Gets the current anchor.
     */
    export function getAnchor(): AnchorDirection {
        return currentAnchor;
    }

    /**
     * Parses an anchor to a collision direction.
     * @param anchor The anchor to convert.
     */
    export function anchorToColDirection(anchor: AnchorDirection): CollisionDirection {
        switch (anchor) {
            case (AnchorDirection.DOWN): {
                return CollisionDirection.Bottom;
            }
            case (AnchorDirection.UP): {
                return CollisionDirection.Top;
            }
            case (AnchorDirection.LEFT): {
                return CollisionDirection.Left;
            }
            case (AnchorDirection.RIGHT): {
                return CollisionDirection.Right;
            }
        }

        return null;
    }

    /**
     * Parses a collision direction into an Anchor.
     * @param col The collision direction to convert.
     */
    export function colToAnchor(col: CollisionDirection): AnchorDirection {
        switch (col) {
            case (CollisionDirection.Bottom): {
                return AnchorDirection.DOWN;
            }
            case (CollisionDirection.Top): {
                return AnchorDirection.UP;
            }
            case (CollisionDirection.Left): {
                return AnchorDirection.LEFT;
            }
            case (CollisionDirection.Right): {
                return AnchorDirection.RIGHT;
            }
        }
        return null;
    }

    /**
     * Has the targeted sprite jump according to the current gravity anchor.
     * @param target The target to apply to.
     */
    export function jumpAsGravity(target: Sprite) {
        switch (currentAnchor) {
            case (AnchorDirection.DOWN): {
                target.vy = -jumpY;
                break;
            }
            case (AnchorDirection.UP): {
                target.vy = jumpY;
                break;
            }
            case (AnchorDirection.LEFT): {
                target.vx = jumpX;
                break;
            }
            case (AnchorDirection.RIGHT): {
                target.vx = -jumpX;
                break;
            }
        }
    }

    /**
     * Applies and syncs gravity.
     * @param target The sprite to target.
     */
    export function applyGravity(target: Sprite) {
        /// Syncs gravity
        target.ay = 0;
        target.ax = 0;

        /// Applies gravity
        switch (currentAnchor) {
            case (AnchorDirection.DOWN): {
                target.ay = 650;
                break;
            }
            case (AnchorDirection.UP): {
                target.ay = -650;
                break;
            }
            case (AnchorDirection.LEFT): {
                target.ax = -650;
                break;
            }
            case (AnchorDirection.RIGHT): {
                target.ax = 650;
                break;
            }
        }

        /// Adjusts controls to account for new gravity
        if ((getAnchor() == AnchorDirection.UP) || (getAnchor() == AnchorDirection.DOWN)) {
            controller.moveSprite(
                target,
                150,
                0
            );
        } else {
            controller.moveSprite(
                target,
                0,
                150
            );
        }
    }

    /**
     * Gets the current Collision Direction the target is colliding with.
     * @param target The sprite to target.
     */
    export function getCollider(target: Sprite): CollisionDirection {
        let collider = null;

        if (target.isHittingTile(CollisionDirection.Left)) {
            collider = CollisionDirection.Left;
        }
        if (target.isHittingTile(CollisionDirection.Right)) {
            collider = CollisionDirection.Right;
        }
        if (target.isHittingTile(CollisionDirection.Top)) {
            collider = CollisionDirection.Top;
        }
        if (target.isHittingTile(CollisionDirection.Bottom)) {
            collider = CollisionDirection.Bottom;
        }

        return collider;
    }

    /**
     * Gets and returns the arrow image for gravity.
     */
    export function getGravImage(): Image {
        switch (getAnchor()) {
            case (AnchorDirection.DOWN): {
                return img`
                    . . f . .
                    . . f . .
                    . . f . .
                    f . f . f
                    . f f f .
                `;
            }
            case (AnchorDirection.UP): {
                return img`
                    . f f f .
                    f . f . f
                    . . f . .
                    . . f . .
                    . . f . .
                `;
            }
            case (AnchorDirection.LEFT): {
                return img`
                    . f . . .
                    f . . . .
                    f f f f f
                    f . . . .
                    . f . . .
                `;
            }
            case (AnchorDirection.RIGHT): {
                return img`
                    . . . f .
                    . . . . f
                    f f f f f
                    . . . . f
                    . . . f .
                `;
            }
        }

        return null;
    }

    /**
     * Flips the player's gravity.
     * @param target The player to flip.
     */
    export function flipGravity(target: Sprite) {
        let c = getAnchor();
        let d = null;

        if (canFlip) {
            switch (c) {
                case (AnchorDirection.DOWN): {
                    d = AnchorDirection.UP;
                    break;
                }
                case (AnchorDirection.UP): {
                    d = AnchorDirection.DOWN;
                    break;
                }
                case (AnchorDirection.LEFT): {
                    d = AnchorDirection.RIGHT;
                    break;
                }
                case (AnchorDirection.RIGHT): {
                    d = AnchorDirection.LEFT;
                    break;
                }
            }

            setAnchor(d);
            applyGravity(target);
            flipCooldown = 20;
            canFlip = false;
        }
    }

    forever(function () {
        if (flipCooldown > 0) {
            flipCooldown--;
            if (flipCooldown == 0) {
                canFlip = true;
            }
        }
    });
}

/**
 * The game (post)
 */
namespace Attraction.GameInit {
    export function bootstrap() {
        /// THREADS
        GameBeginPayload.deploy();
        GameRenderPayload.deploy();
    }

    /// OTHER DATA
    export let PlayerImg = createImage(
        8,
        8,
        game.Color.Yellow
    );

    /// PAYLOADS
    export const GameBeginPayload = new Payload();
    export const GameRenderPayload = new Payload();

    /// PACKETS
    GameBeginPayload.attach(function primaryGameThread() {
        const Player = entries.sprite(
            "Player",
            PlayerImg,
            SpriteKind.Player
        );

        Maps.load(
            0,
            Player
        );

        new Runnable(function playerControlsSetup() {
            controller.A.onEvent(ControllerButtonEvent.Pressed, function jumpWithA() {
                if (Anchor.getAnchor() == Anchor.AnchorDirection.DOWN) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.getAnchor()))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });

            controller.up.onEvent(ControllerButtonEvent.Pressed, function jumpWithA() {
                if (Anchor.getAnchor() == Anchor.AnchorDirection.DOWN) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.getAnchor()))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });

            controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
                if (Anchor.getAnchor() == Anchor.AnchorDirection.LEFT) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.getAnchor()))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });

            controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
                if (Anchor.getAnchor() == Anchor.AnchorDirection.RIGHT) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.getAnchor()))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });

            controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
                if (Anchor.getAnchor() == Anchor.AnchorDirection.UP) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.getAnchor()))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });
        }).run();

        forever(function gravitySync() {
            Anchor.applyGravity(Player);
        });
    });
    GameBeginPayload.attach(function secondaryGameThread() {
        new Runnable(function playerChangeGravity() {
            scene.onHitWall(SpriteKind.Player, (handler, location) => {
                Anchor.setAnchor(
                    Anchor.colToAnchor(
                        Anchor.getCollider(handler)
                    )
                );

                Anchor.applyGravity(handler);
            });
        }).run();

        new Runnable(function nextLevelWhenTouchYellow() {
            scene.onOverlapTile(SpriteKind.Player, Maps.levelCallTile, (target, location) => {
                Maps.load(
                    Maps.currentLevel += 1,
                    target
                );
            });
        }).run();

        new Runnable(function flipGravity() {
            scene.onOverlapTile(SpriteKind.Player, Maps.flipTile, (target, location) => {
                Anchor.flipGravity(target);
            });
        }).run();

        new Runnable(function killPlayer() {
            scene.onOverlapTile(SpriteKind.Player, Maps.killTile, (target, location) => {
                tiles.placeOnTile(
                    target,
                    tiles.getTileLocation(
                        Maps.spawnLocationC,
                        Maps.spawnLocationR
                    )
                );
            });
        }).run();
    });

    GameRenderPayload.attach(function primaryRenderThread() {
        new Runnable(function gravityDisplay() {
            const gravDisplay = entries.sprite(
                "Gravity Display",
                Anchor.getGravImage(),
                SpriteKind.GuiElement
            );

            gravDisplay.setPosition(
                153,
                10
            );

            gravDisplay.changeScale(1.10);

            forever(function imageSync() {
                gravDisplay.setImage(Anchor.getGravImage());
            });
        }).run();

        const displayLevelName = scene.createRenderable(2, (handler) => {
            handler.printCenter(
                Lang.getLevelName(
                    Maps.currentLevel
                ),
                3,
                game.Color.Black,
                image.font8
            );
        }, () => true);
    });
}

/**
 * The game (pre)
 */
namespace Attraction.ScreenInit {
    // title screen and more
}

namespace Attraction {

}