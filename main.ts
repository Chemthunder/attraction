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
    export const playerSpawnerTile = createImage(16, 16, game.Color.Red);
    export const levelCallTile = createImage(16, 16, game.Color.Yellow);
    export const emptyTile = image.create(16, 16);

    export let currentLevel = 0;

    /**
     * Loads a map from an id.
     * @param id The numeric id of the map.
     * @param target The player.
     */
    export function load(id: number, target: Sprite) {
        switch (id) {
            case (0): {
                tiles.setCurrentTilemap(tilemap`level1`);
                break;
            };
            case (1): {
              tiles.setCurrentTilemap(tilemap`level2`);
                break;
            };

            default: {
                throw Exception.of("Unable to load non-existing level!");
            };
        }

        const points: tiles.Location[] = tiles.getTilesByType(playerSpawnerTile);
        const potentialWalls: tiles.Location[] = tiles.getTilesByType(createImage(16, 16, 1));

        for (let i of points) {
            tiles.placeOnTile(
                target,
                i
            );

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

        Anchor.currentAnchor = Anchor.AnchorDirection.DOWN;
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
                return "Welcome.";
            }
            case 1: {
                return "Hello !!!";
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
        if ((currentAnchor == AnchorDirection.UP) || (currentAnchor == AnchorDirection.DOWN)) {
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
}

namespace Attraction.GameInit {
    export function bootstrap() {
        /// LOADS THREADS
        GameBeginPayload.deploy();
    }

    /// OTHER DATA
    export let PlayerImg = createImage(
        8,
        8,
        game.Color.Yellow
    );

    /// PAYLOADS
    export const GameBeginPayload = new Payload();

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
                if (Anchor.currentAnchor == Anchor.AnchorDirection.DOWN) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.currentAnchor))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });

            controller.up.onEvent(ControllerButtonEvent.Pressed, function jumpWithA() {
                if (Anchor.currentAnchor == Anchor.AnchorDirection.DOWN) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.currentAnchor))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });

            controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
                if (Anchor.currentAnchor == Anchor.AnchorDirection.LEFT) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.currentAnchor))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });

            controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
                if (Anchor.currentAnchor == Anchor.AnchorDirection.RIGHT) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.currentAnchor))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });

            controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
                if (Anchor.currentAnchor == Anchor.AnchorDirection.UP) {
                    if (Player.isHittingTile(Anchor.anchorToColDirection(Anchor.currentAnchor))) {
                        Anchor.jumpAsGravity(Player);
                    }
                }
            });
        }).run();

        new Runnable(function playerChangeGravity() {
            scene.onHitWall(SpriteKind.Player, (handler, location) => {
                Anchor.currentAnchor = Anchor.colToAnchor(
                    Anchor.getCollider(
                        Player
                    )
                );

                Anchor.applyGravity(Player);
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

        const display = scene.createRenderable(2, (handler) => {
            handler.printCenter(
                Lang.getLevelName(
                    Maps.currentLevel
                ),
                screen.height / 2,
                game.Color.Tan,
                image.font8
            );
        }, () => true);

        forever(function gravitySync() {
            Anchor.applyGravity(Player);
        });
    });

    /// HELPERS
    export function resetPlayerControls(target: Sprite) {
        Anchor.applyGravity(target);
    }
}

Attraction.GameInit.bootstrap();