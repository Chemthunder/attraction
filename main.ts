enablePrint()

/**
 * Running details and primary source.
 */
module Attraction {
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

/**
 * Controls the current level and level data.
 */
namespace Attraction.Maps {
    export const playerSpawnerTile = entries.register("tiles#playerSpawnerTile", createImage(
        16,
        16,
        game.Color.Red
    ));
    export const levelCallTile = entries.register("tiles#levelCallTile", createImage(
        16,
        16,
        game.Color.Yellow
    ));
    export const flipTile = entries.register("tiles#flipTile", createImage(
        16,
        16,
        game.Color.LightBlue
    ));
    export const killTile = entries.register("tiles#killTile", createImage(
        16,
        16,
        game.Color.Purple
    ));
    export const emptyTile = entries.register("tiles#emptyTile", image.create(
        16,
        16
    ));

    export let currentLevel = 0;

    export let spawnLocationR = 0;
    export let spawnLocationC = 0;

    /**
     * Loads a map from an id.
     * @param id The numeric id of the map.
     * @param target The player.
     */
    export function load(id: number, target?: Sprite) {
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
            case 5: {
                tiles.setCurrentTilemap(tilemap`level6`);
                break;
            }
            case 6: {
                tiles.setCurrentTilemap(tilemap`level7`);
                PostPipeline.EndOfDemoPayload.deploy();
                break;
            }

            default: {
                throw Exception.of("Unable to load non-existing level!");
            }
        }

        const points: tiles.Location[] = tiles.getTilesByType(playerSpawnerTile);
        const potentialWalls: tiles.Location[] = tiles.getTilesByType(createImage(16, 16, 1));

        for (let i of points) {
            if (target != null) {
                tiles.placeOnTile(
                    target,
                    i
                );
            } else {
                sprites.allOfKind(SpriteKind.Player).forEach(sprite => {
                    tiles.placeOnTile(
                        sprite,
                        i
                    );
                });
            }

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

/**
 * Fetches and dispatches text.
 */
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
            case 5: {
                return "Amaze";
            }
            case 6: {
                return "End of Demo";
            }
        }

        return "level name";
    }

    export function getWidgetName(id: number): string {
        switch (id) {
            case 0: {
                return "Begin Game"
            }
            case 1: {
                return "Level Selector"
            }
            case 2: {
                return "Credits"
            }
        }
        return "";
    }
}

/**
 * The game-wide gravity engine.
 */
namespace Attraction.Anchor {
    export const jumpY = 210; /// Jump height when in the DOWN or UP orientations.
    export const jumpX = 210; /// Jump height when in the LEFT or RIGHT orientations.

    export let currentAnchor = Anchor.AnchorDirection.DOWN; /// The current gravity anchor.

    export let canFlip = true; /// If the player can flip gravity or not.
    export let flipCooldown = 20; /// Number used to control the cooldown for flipping.
    export let flipDelay = 20; /// The number the cooldown sets to or sumth idk

    /**
     * The directions gravity can pull from.
     */
    export enum AnchorDirection {
        DOWN, /// Pulls DOWN (normal gravity)
        UP, /// Pulls UP (reversed gravity on y-axis)
        LEFT, /// Pulls LEFT
        RIGHT /// Pulls RIGHT
    }

    /**
     * AnchorDirection as a list.
     */
    export const Directions = [
        AnchorDirection.DOWN,
        AnchorDirection.UP,
        AnchorDirection.LEFT,
        AnchorDirection.RIGHT
    ];

    /**
     * All possible wall hitting collision directions.
     */
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
            flipCooldown = flipDelay;
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
namespace Attraction.PostPipeline {
    /// DEPLOY DEPO
    export function bootstrap() {
        GameBeginPayload.deploy();
        GameRenderPayload.deploy();
    }

    /// OTHER DATA
    export let PlayerImg = createImage(
        8,
        8,
        game.Color.Yellow
    );
    export let PlayerInstance: Sprite = null;

    /// PAYLOADS
    export const GameBeginPayload = new Payload();
    export const GameRenderPayload = new Payload();
    export const EndOfDemoPayload = new Payload();

    /// PACKETS
    GameBeginPayload.attach(function primaryGameThread() {
        /// Creates player
        const Player = entries.sprite(
            "Player",
            PlayerImg,
            SpriteKind.Player
        );

        PlayerInstance = Player; /// Syncs player

        /// Loads first level
        Maps.load(
            0,
            Player
        );

        /// Sets up the player controls in all orientations
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

        /// Permanent clock to sync gravity every game tick
        forever(function gravitySync() {
            Anchor.applyGravity(Player);
        });
    });
    GameBeginPayload.attach(function secondaryGameThread() {
        /// Controls the player changing gravity when touching a wall
        new Runnable(function playerChangeGravity() {
            scene.onHitWall(SpriteKind.Player, (handler, location) => {
                Anchor.setAnchor(
                    Anchor.colToAnchor(Anchor.getCollider(handler))
                );

                Anchor.applyGravity(handler);
            });
        }).run();

        /// Progresses the level to the next when touching a yellow block
        new Runnable(function nextLevelWhenTouchYellow() {
            scene.onOverlapTile(SpriteKind.Player, Maps.levelCallTile, (target, location) => {
                Maps.load(
                    Maps.currentLevel += 1,
                    target
                );
            });
        }).run();

        /// Flips gravity when touching a cyan block
        new Runnable(function flipGravity() {
            scene.onOverlapTile(SpriteKind.Player, Maps.flipTile, (target, location) => {
                Anchor.flipGravity(target);
            });
        }).run();

        /// Kills the player when touching a purple block
        new Runnable(function killPlayer() {
            scene.onOverlapTile(SpriteKind.Player, Maps.killTile, (target, location) => {
                tiles.placeOnTile(
                    target,
                    tiles.getTileLocation(
                        Maps.spawnLocationC,
                        Maps.spawnLocationR
                    )
                );

                Anchor.setAnchor(Anchor.AnchorDirection.DOWN);
            });
        }).run();
    });

    GameRenderPayload.attach(function primaryRenderThread() {
        /// Creates the gravity arrow thing
        new Runnable(function gravityDisplay() {
            const gravDisplay = entries.sprite(
                "Gui#GravityDisplay",
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

        /// Creates the level name display
        const displayLevelName = entries.register("Gui#LevelNameDisplay", scene.createRenderable(2, (handler) => {
            handler.printCenter(
                Lang.getLevelName(
                    Maps.currentLevel
                ),
                3,
                game.Color.Black,
                image.font8
            );
        }, () => true));
    });

    EndOfDemoPayload.attach(function primaryThread() {
        //
        print("demo concluded");
    });
}

/**
 * The game (pre)
 */
namespace Attraction.PrePipeline {
    /// DEPLOY DEPO
    export function bootstrap() {
        PreScreenPayload.deploy();
        TitleScreenPayload.deploy();
        TitleWidgetsPayload.deploy();
        TitleCursorPayload.deploy();
    }

    /// OTHER DATA
    export let Widgets: Sprite[] = [];
    export let inCredits = false;
    export let inGame = false;

    /// PAYLOADS
    export const PreScreenPayload = new Payload();
    export const TitleScreenPayload = new Payload();
    export const TitleWidgetsPayload = new Payload();
    export const TitleCursorPayload = new Payload();

    /// PACKETS
    PreScreenPayload.attach(function primaryThread() {
        color.setPalette(color.Black);
        color.startFadeFromCurrent(color.originalPalette);
    });
    TitleScreenPayload.attach(function primaryThread() {
        /// Creates the "Attraction" title text
        const titleScreen = entries.register(
            "Title#Text",
            new ScreenImage(
                screen.width,
                screen.height
            )
        );
        const handler = titleScreen.extract();
        const core = titleScreen.access();

        handler.printCenter(
            "Attraction",
            screen.height / 2,
            1,
            image.font12
        );

        handler.print(
            `Version ${MAIN.getMetaData().getVersion()}`,
            0,
            0,
            1,
            image.font5
        );
    });
    TitleWidgetsPayload.attach(function primaryThread() {
        /// Creates the title screen widgets
        const nameSetter = entries.sprite("Title#NameSetter", img`
            1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
            1 f f f f f f f f f f f f f f 1
            1 f f f f f f f f f f f f f f 1
            1 f f f f f 1 1 f f f f f f f 1
            1 f f f 1 1 f f f f f f f f f 1
            1 f f 1 f f f f f f f f f f f 1
            1 f f f 1 1 1 1 1 1 f f f f f 1
            1 f f f f f f f f 1 1 f f f f 1
            1 f f f f f f f f f 1 f f f f 1
            1 f f f f f f f f f 1 f f f f 1
            1 f f f f f f f f 1 f f f f f 1
            1 f f f f f f f 1 f f f f f f 1
            1 f f f f f f 1 f f f f f f f 1
            1 f f f f f f f f f f f f f f 1
            1 f f f f f f f f f f f f f f 1
            1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        `, SpriteKind.GuiElement);

        nameSetter.setPosition(
            40,
            105
        );

        const levelSelector = entries.sprite("Title#LevelSelector", img`
            2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
            2 f f f f f f f f f f f f f f 2
            2 f f f f 2 f f f f f f f f f 2
            2 f f f f 2 f f f f f f f f f 2
            2 f f f 2 f f f f f f f f f f 2
            2 f f f 2 f f f f f f f f f f 2
            2 f f f 2 f f f f f f f f f f 2
            2 f f f 2 f f f f f f f f f f 2
            2 f f f 2 f f f f f f f f f f 2
            2 f f f 2 f f f f f f f f f f 2
            2 f f f 2 f f f f f f f f f f 2
            2 f f f 2 f f f f f f f f f f 2
            2 f f f 2 f f f f 2 2 f f f f 2
            2 f f f 2 2 2 2 2 2 f f f f f 2
            2 f f f f f f f f f f f f f f 2
            2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
        `, SpriteKind.GuiElement);

        levelSelector.setPosition(
            nameSetter.x + (nameSetter.x),
            nameSetter.y
        );

        const credits = entries.sprite("Title#Credits", img`
            1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
            1 f f f f f f f f f f f f f f 1
            1 f f f f f f f f 1 f f f f f 1
            1 f f f f f 1 1 1 1 f f f f f 1
            1 f f f 1 1 f f f f f f f f f 1
            1 f f f 1 f f f f f f f f f f 1
            1 f f f 1 f f f f f f f f f f 1
            1 f f f 1 f f f f f f f f f f 1
            1 f f f 1 f f f f f f f f f f 1
            1 f f f 1 f f f f f f f f f f 1
            1 f f f f 1 f f f f f f f f f 1
            1 f f f f f 1 1 f 1 f f f f f 1
            1 f f f f f f f 1 f f f f f f 1
            1 f f f f f f f f f f f f f f 1
            1 f f f f f f f f f f f f f f 1
            1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        `, SpriteKind.GuiElement);

        credits.setPosition(
            levelSelector.x + (nameSetter.x),
            levelSelector.y
        );

        Widgets.push(nameSetter);
        Widgets.push(levelSelector);
        Widgets.push(credits);
    });
    TitleCursorPayload.attach(function primaryThread() {
        /// Creates the cursor blah blah blah
        let cursorPos = 0;

        const cursor = entries.sprite(
            "Title#Cursor",
            createImage(
                4,
                4,
                game.Color.Yellow
            ),
            SpriteKind.GuiElement
        );

        forever(function cursorPositioner() {
            if (cursor != null) {
                if (!inCredits || !inGame) {
                    cursor.setPosition(
                        Widgets[cursorPos].x,
                        Widgets[cursorPos].y - 20
                    );
                }
            }
        });

        /// Cursor Inputs
        new Runnable(function inputs() {
            controller.right.onEvent(ControllerButtonEvent.Pressed, function cycleRight() {
                if (!inCredits || !inGame) {
                    if (cursorPos < Widgets.length - 1) {
                        cursorPos++;
                    } else {
                        cursorPos = 0;
                    }
                }
            });

            controller.left.onEvent(ControllerButtonEvent.Pressed, function cycleRight() {
                if (!inCredits || !inGame) {
                    if (cursorPos > 0) {
                        cursorPos--;
                    } else {
                        cursorPos = Widgets.length - 1;
                    }
                }
            });

            controller.A.onEvent(ControllerButtonEvent.Pressed, function click() {
                if (!inCredits || !inGame) {
                    input(cursorPos);
                } else {
                    print("No input")
                }
            });
        }).run();

        new Runnable(function textReadoutForWidgets() {
            const readout = entries.register(
                "Title#WidgetReadout",
                new ScreenImage(
                    screen.width,
                    screen.height
                )
            );
            
            readout.extract().printCenter(
                Lang.getWidgetName(cursorPos),
                40,
                1
            );
        }).run();
    });

    /**
     * Title screen inputs
     * @param id The button id.
     */
    export function input(id: number) {
        if (!inCredits || !inGame) {
            switch (id) {
                case 0: {
                    inGame = true;
                    color.startFade(
                        color.White,
                        color.Black,
                        500
                    );

                    pause(500);

                    sprites.destroyAllSpritesOfKind(SpriteKind.GuiElement);
                    sprites.destroyAllSpritesOfKind(SpriteKind.RenderElement);

                    PostPipeline.bootstrap();

                    color.startFadeFromCurrent(color.originalPalette);
                    break;
                }
                case 1: {
                    print("This feature is currently innaccessible, see in future updates!");
                    break;
                }
                case 2: {
                    inCredits = true;
                    sprites.destroyAllSpritesOfKind(SpriteKind.GuiElement);
                    sprites.destroyAllSpritesOfKind(SpriteKind.RenderElement);

                    pause(350);

                    color.setPalette(color.Black);

                    game.consoleOverlay.clear();

                    let strings = [
                        MAIN.getName(),
                        `Developed by ${MAIN.getMetaData().getAuthor()}`,
                        `Version ${MAIN.getMetaData().getVersion()}`,
                        `Thank you so much for`,
                        `playing!`
                    ];

                    let display = entries.register("Credits#Display", scene.createRenderable(5, (handler) => {
                        for (let i of strings) {
                            handler.printCenter(
                                i,
                                (screen.height / 2 - 40) + (strings.indexOf(i) * 10),
                                1
                            );
                        }

                        handler.drawImage(img`
                        ........................................................................................................................
                        ........................................................................................................................
                        ........................................................................................................................
                        ........................................................................................................................
                        ..............................................................................................................1111......
                        ...........................................................................................................111..........
                        ............11.............................................1.............................................11.............
                        ............1......1................................1......1............................1...............1...............
                        ...........1.......1................................1......1............................1...............1...............
                        ..........1........1.......................11.......1......1............................1..............1................
                        ..........1.........1.........111......11.1.1.......1......1............................1..............1................
                        .........1..........1.11......1..1.....111..1.......1......1..................1.........1...11.........1................
                        .........1..........11..1....1...1.....11...1.....111111...1.1...............1.1....111.1...11..........1...............
                        .........1..........11...1...1..1.....1.....1.......1......11.1......1.....1.1.1....1..11...11..........1...............
                        .........1...........1...1...1..1.....1.....1.......1......11.1......1......1..1....1...11.1.1..........1...............
                        .........1...........1....1...11......11....1.......1......1..1......11.....1..1....1....1.1.1..........1...............
                        ..........1..........1.....111.1.......1....1.......1......1...1.....11.....1..1....1....1..1...........11..............
                        ..........1.....................1....................1.....1...1.....11.....1..1....1......1.1...........1..............
                        ...........1.....................111.................1.....1...1.....1.1....1..1.....1.....1.1...........1..............
                        ...........1....................................................1...1..1.......1.....1...11...1..........1..............
                        ............11...................................................1111...11..1...1.....111......1........111.............
                        ..............11..1.......................................................11....................11.....1..............1.
                        ................11................................................................................11111.............11..
                        ...................................................................................................................1....
                        ..................................................................................................................1.....
                        ...........11....................................................................................................1......
                        .............1......................................................................11111111111.............11111.......
                        ..............1111..................................................1111111111111111...........1111111111111............
                        ..................11111111111111111111111111111111111111111111111111....................................................
                        ........................................................................................................................
                        ........................................................................................................................
                        ........................................................................................................................
                    `, 20, 80);
                    }));

                    color.startFadeFromCurrent(
                        color.originalPalette,
                        500
                    );

                    controller.A.onEvent(ControllerButtonEvent.Pressed, function click() {
                        game.reset();
                    });
                    break;
                }
            }
        }
    }
}

/**
 * Start Point.
 */
namespace Attraction {
    /// DEV CONFIG
    export const CONFIG = new Config();
    CONFIG.writeEntries(
        [
            Property.of("JumpStart", false)
        ]
    );
    CONFIG.sync();
    /// END

    if (CONFIG.fetch("JumpStart")) {
        PostPipeline.bootstrap();
    } else {
        PrePipeline.bootstrap();
    }
}