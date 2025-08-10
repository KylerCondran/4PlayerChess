// Board state and move tracking
let validMoves = [];
const boardSize = { width: 14, height: 14 };
let boardRotation = 0;

function initGame() {
    // Initialize board rotation
    const chessboard = document.getElementById('chessboard');
    chessboard.classList.add('rotate-0');

    // Set initial rotation for pieces
    document.querySelectorAll('.piece').forEach(piece => {
        piece.style.transform = 'rotate(0deg)';
    });

    // Make all pieces draggable and set up dragstart listeners
    setDraggablePieces();
    enableDragAndDrop();
}

const turnOrder = ['red', 'blue', 'yellow', 'green'];
let currentTurnIndex = 0;
let currentTurn = turnOrder[currentTurnIndex];

function updateTurnIndicator() {
    const indicator = document.getElementById('tip');
    const color = currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1);
    indicator.src = `img/${currentTurn}/pawn.svg`;
}

function getPosition(square) {
    const pos = square.dataset.position;
    return {
        x: pos.charCodeAt(0) - 'a'.charCodeAt(0),
        y: parseInt(pos.slice(1)) - 1
    };
}

function getSquareAt(x, y) {
    if (x < 0 || x >= boardSize.width || y < 0 || y >= boardSize.height) return null;
    const pos = String.fromCharCode('a'.charCodeAt(0) + x) + (y + 1);
    return document.querySelector(`[data-position="${pos}"]`);
}

function isValidSquare(square) {
    return square && !square.classList.contains('inactive');
}

function getPieceType(piece) {
    const classes = Array.from(piece.classList);
    return classes.find(c => ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'].includes(c));
}

function calculateValidMoves(piece) {
    const square = piece.parentElement;
    const pos = getPosition(square);
    const pieceType = getPieceType(piece);
    const color = turnOrder.find(c => piece.classList.contains(c));
    validMoves = [];

    switch (pieceType) {
        case 'pawn':
            calculatePawnMoves(pos, color, piece);
            break;
        case 'rook':
            calculateRookMoves(pos, color);
            break;
        case 'knight':
            calculateKnightMoves(pos, color);
            break;
        case 'bishop':
            calculateBishopMoves(pos, color);
            break;
        case 'queen':
            calculateQueenMoves(pos, color);
            break;
        case 'king':
            calculateKingMoves(pos, color);
            break;
    }

    return validMoves;
}

function calculatePawnMoves(pos, color, piece) {
    let direction;
    switch (color) {
        case 'red': direction = { x: -1, y: 0 }; break;     // left
        case 'blue': direction = { x: 0, y: -1 }; break;    // up
        case 'yellow': direction = { x: 1, y: 0 }; break;   // right
        case 'green': direction = { x: 0, y: 1 }; break;    // down
    }

    // Forward move (one square only)
    let newPos = { x: pos.x + direction.x, y: pos.y + direction.y };
    let square = getSquareAt(newPos.x, newPos.y);
    if (isValidSquare(square) && !square.querySelector('.piece')) {
        validMoves.push(square);

        // Two-square move if pawn hasn't moved yet
        if (piece && piece.classList.contains('first-move')) {
            let twoSquarePos = { x: pos.x + direction.x * 2, y: pos.y + direction.y * 2 };
            let twoSquare = getSquareAt(twoSquarePos.x, twoSquarePos.y);
            if (isValidSquare(twoSquare) && !twoSquare.querySelector('.piece')) {
                validMoves.push(twoSquare);
            }
        }
    }

    // Capture moves (diagonally, rotated)
    const captureMoves = [];
    switch (color) {
        case 'red':
            captureMoves.push({ x: -1, y: -1 }, { x: -1, y: 1 });
            break;
        case 'blue':
            captureMoves.push({ x: -1, y: -1 }, { x: 1, y: -1 });
            break;
        case 'yellow':
            captureMoves.push({ x: 1, y: -1 }, { x: 1, y: 1 });
            break;
        case 'green':
            captureMoves.push({ x: -1, y: 1 }, { x: 1, y: 1 });
            break;
    }

    captureMoves.forEach(move => {
        const capturePos = { x: pos.x + move.x, y: pos.y + move.y };
        const square = getSquareAt(capturePos.x, capturePos.y);
        if (isValidSquare(square)) {
            const pieceOnSquare = square.querySelector('.piece');
            if (pieceOnSquare && !pieceOnSquare.classList.contains(color)) {
                validMoves.push(square);
            }
        }
    });

    // En passant logic (unchanged)
    if (lastMove && lastMove.pieceType === 'pawn' && lastMove.twoSquare) {
        let adjMoves = [];
        switch (color) {
            case 'red': adjMoves = [{ x: 0, y: -1 }, { x: 0, y: 1 }]; break;
            case 'blue': adjMoves = [{ x: -1, y: 0 }, { x: 1, y: 0 }]; break;
            case 'yellow': adjMoves = [{ x: 0, y: -1 }, { x: 0, y: 1 }]; break;
            case 'green': adjMoves = [{ x: -1, y: 0 }, { x: 1, y: 0 }]; break;
        }
        adjMoves.forEach(adj => {
            let adjPos = { x: pos.x + adj.x, y: pos.y + adj.y };
            if (adjPos.x === lastMove.to.x && adjPos.y === lastMove.to.y) {
                let epSquare = getSquareAt(lastMove.from.x + direction.x, lastMove.from.y + direction.y);
                if (isValidSquare(epSquare) && !epSquare.querySelector('.piece')) {
                    validMoves.push(epSquare);
                }
            }
        });
    }
}

function calculateStraightLine(pos, color, directions) {
    directions.forEach(dir => {
        let currentPos = { x: pos.x + dir.x, y: pos.y + dir.y };
        while (true) {
            const square = getSquareAt(currentPos.x, currentPos.y);
            if (!isValidSquare(square)) break;

            const pieceOnSquare = square.querySelector('.piece');
            if (pieceOnSquare) {
                if (!pieceOnSquare.classList.contains(color)) {
                    validMoves.push(square);
                }
                break;
            }

            validMoves.push(square);
            currentPos = { x: currentPos.x + dir.x, y: currentPos.y + dir.y };
        }
    });
}

function calculateRookMoves(pos, color) {
    const directions = [
        { x: 0, y: 1 },  // up
        { x: 0, y: -1 }, // down
        { x: 1, y: 0 },  // right
        { x: -1, y: 0 }  // left
    ];
    calculateStraightLine(pos, color, directions);
}

function calculateBishopMoves(pos, color) {
    const directions = [
        { x: 1, y: 1 },   // up-right
        { x: 1, y: -1 },  // down-right
        { x: -1, y: 1 },  // up-left
        { x: -1, y: -1 }  // down-left
    ];
    calculateStraightLine(pos, color, directions);
}

function calculateQueenMoves(pos, color) {
    calculateRookMoves(pos, color);
    calculateBishopMoves(pos, color);
}

function calculateKnightMoves(pos, color) {
    const moves = [
        { x: 2, y: 1 }, { x: 2, y: -1 },
        { x: -2, y: 1 }, { x: -2, y: -1 },
        { x: 1, y: 2 }, { x: 1, y: -2 },
        { x: -1, y: 2 }, { x: -1, y: -2 }
    ];

    moves.forEach(move => {
        const newPos = { x: pos.x + move.x, y: pos.y + move.y };
        const square = getSquareAt(newPos.x, newPos.y);
        if (isValidSquare(square)) {
            const pieceOnSquare = square.querySelector('.piece');
            if (!pieceOnSquare || !pieceOnSquare.classList.contains(color)) {
                validMoves.push(square);
            }
        }
    });
}

function calculateKingMoves(pos, color) {
    const moves = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
    ];

    moves.forEach(move => {
        const newPos = { x: pos.x + move.x, y: pos.y + move.y };
        const square = getSquareAt(newPos.x, newPos.y);
        if (isValidSquare(square)) {
            const pieceOnSquare = square.querySelector('.piece');
            if (!pieceOnSquare || !pieceOnSquare.classList.contains(color)) {
                validMoves.push(square);
            }
        }
    });
}

let resignedPlayers = [];

function setResignedGrey(color) {
    document.querySelectorAll('.piece.' + color).forEach(piece => {
        piece.classList.add('resigned-grey');
        piece.setAttribute('draggable', 'false');
    });
}

function skipResignedTurns() {
    // If current player is resigned, skip to next and rotate board for each skip
    let skipped = false;
    while (resignedPlayers.includes(currentTurn)) {
        currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
        currentTurn = turnOrder[currentTurnIndex];
        rotateBoardForNextPlayer();
        skipped = true;
    }
    if (skipped) setDraggablePieces();
}

function setDraggablePieces() {
    updateTurnIndicator();
    document.querySelectorAll('.piece').forEach(piece => {
        // Get color from classList (red, blue, yellow, green)
        const colors = ['red', 'blue', 'yellow', 'green'];
        const pieceColor = colors.find(c => piece.classList.contains(c));
        if (pieceColor === currentTurn && !resignedPlayers.includes(pieceColor)) {
            piece.setAttribute('draggable', 'true');
        } else {
            piece.setAttribute('draggable', 'false');
        }
        // If resigned, add grey filter
        if (resignedPlayers.includes(pieceColor)) {
            piece.classList.add('resigned-grey');
        } else {
            piece.classList.remove('resigned-grey');
        }
    });

    // Set dragstart only for current player's pieces
    document.querySelectorAll('.piece').forEach(piece => {
        piece.removeEventListener('dragstart', piece._dragHandler);
        piece.removeEventListener('mousedown', piece._mouseHandler);
        
        const colors = ['red', 'blue', 'yellow', 'green'];
        const pieceColor = colors.find(c => piece.classList.contains(c));
        
        if (pieceColor === currentTurn) {
            // Dragstart handler
            const dragHandler = function(e) {
                const parentSquare = piece.parentElement;
                if (parentSquare && parentSquare.dataset.position) {
                    e.dataTransfer.setData('text/plain', parentSquare.dataset.position);
                    validMoves = calculateValidMoves(piece);
                    // Highlight valid moves
                    validMoves.forEach(square => {
                        square.classList.add('valid-move');
                    });

                    // Use a wrapper div and rotate by CSS for drag preview
                    const dragImgWrapper = document.createElement('div');
                    dragImgWrapper.style.position = 'absolute';
                    dragImgWrapper.style.left = '-1000px';
                    dragImgWrapper.style.top = '-1000px';
                    dragImgWrapper.style.pointerEvents = 'none';
                    dragImgWrapper.style.zIndex = '9999';
                    dragImgWrapper.style.width = (piece.width || 50) + 'px';
                    dragImgWrapper.style.height = (piece.height || 50) + 'px';
                    dragImgWrapper.style.display = 'flex';
                    dragImgWrapper.style.alignItems = 'center';
                    dragImgWrapper.style.justifyContent = 'center';

                    // Set rotation based on player color
                    let rotation = '0deg';
                    if (pieceColor === 'blue') rotation = '-90deg';
                    else if (pieceColor === 'yellow') rotation = '-180deg';
                    else if (pieceColor === 'green') rotation = '-270deg';
                    dragImgWrapper.style.transform = `rotate(${rotation})`;

                    const dragImg = piece.cloneNode(true);
                    dragImg.style.width = (piece.width || 50) + 'px';
                    dragImg.style.height = (piece.height || 50) + 'px';
                    dragImgWrapper.appendChild(dragImg);
                    document.body.appendChild(dragImgWrapper);
                    e.dataTransfer.setDragImage(dragImgWrapper, dragImgWrapper.offsetWidth / 2, dragImgWrapper.offsetHeight / 2);
                    setTimeout(() => {
                        if (dragImgWrapper.parentNode) dragImgWrapper.parentNode.removeChild(dragImgWrapper);
                    }, 50);
                }
            };
            piece._dragHandler = dragHandler;
            piece.addEventListener('dragstart', dragHandler);

            // Mouse down handler for mobile/touch devices
            const mouseHandler = function() {
                validMoves = calculateValidMoves(piece);
                validMoves.forEach(square => {
                    square.classList.add('valid-move');
                });
            };
            piece._mouseHandler = mouseHandler;
            piece.addEventListener('mousedown', mouseHandler);
        }
    });
}

// Enable dropping on squares
function enableDragAndDrop() {
    document.querySelectorAll('.square').forEach(square => {
        square.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (validMoves.includes(square)) {
                e.dataTransfer.dropEffect = 'move';
            } else {
                e.dataTransfer.dropEffect = 'none';
            }
        });

        square.addEventListener('drop', (e) => {
            e.preventDefault();
            // Remove highlight from all squares
            document.querySelectorAll('.valid-move').forEach(s => {
                s.classList.remove('valid-move');
            });

            if (!validMoves.includes(square)) return;

            const fromPos = e.dataTransfer.getData('text/plain');
            const fromSquare = document.querySelector(`[data-position="${fromPos}"]`);
            let pieceElement = fromSquare.querySelector('.piece');
            
            if (pieceElement && pieceElement.getAttribute('draggable') === 'true') {
                // Check if there's a piece to capture
                const capturedPiece = square.querySelector('.piece');
                if (capturedPiece) {
                    // Remove the captured piece
                    square.removeChild(capturedPiece);
                }

                // Move the attacking piece
                fromSquare.removeChild(pieceElement);
                
                // Remove first-move class if it's a pawn
                if (pieceElement.classList.contains('pawn')) {
                    pieceElement.classList.remove('first-move');
                }
                
                square.appendChild(pieceElement);

                // Pawn move count logic
                if (pieceElement.classList.contains('pawn')) {
                    // Find current move count class
                    let moveCount = 2;
                    pieceElement.classList.forEach(cls => {
                        if (cls.startsWith('move-')) {
                            moveCount = parseInt(cls.split('-')[1]);
                        }
                    });
                    // Remove old move count class
                    pieceElement.classList.remove(`move-${moveCount}`);
                    // Determine if this is a double move
                    const from = getPosition(fromSquare);
                    const to = getPosition(square);
                    let increment = 1;
                    if (Math.abs(from.x - to.x) === 2 || Math.abs(from.y - to.y) === 2) {
                        increment = 2;
                    }
                    // Increment move count
                    moveCount += increment;
                    pieceElement.classList.add(`move-${moveCount}`);
                    // If move count is 8, promote to queen
                    if (moveCount === 8) {
                        const color = turnOrder.find(c => pieceElement.classList.contains(c));
                        const queen = document.createElement('img');
                        queen.className = `piece ${color} queen`;
                        queen.src = `img/${color}/queen.svg`;
                        queen.setAttribute('draggable', color === currentTurn ? 'true' : 'false');
                        queen.style.transform = pieceElement.style.transform;
                        square.removeChild(pieceElement);
                        square.appendChild(queen);
                        pieceElement = queen;
                    }
                }

                // Track last move for en passant
                const isTwoSquareMove = pieceElement.classList.contains('pawn') && (
                    Math.abs(getPosition(square).x - getPosition(fromSquare).x) === 2 ||
                    Math.abs(getPosition(square).y - getPosition(fromSquare).y) === 2
                );

                lastMove = {
                    pieceType: getPieceType(pieceElement),
                    color: turnOrder.find(c => pieceElement.classList.contains(c)),
                    from: getPosition(fromSquare),
                    to: getPosition(square),
                    twoSquare: isTwoSquareMove
                };

                // Clear valid moves array
                validMoves = [];
                // Next player's turn
                currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
                currentTurn = turnOrder[currentTurnIndex];
                skipResignedTurns();
                // Rotate board for next player
                rotateBoardForNextPlayer();
                // Update draggable pieces
                setDraggablePieces();
            }
        });
    });

    // Add dragend handler to remove highlights when drag is cancelled
    document.addEventListener('dragend', () => {
        document.querySelectorAll('.valid-move').forEach(square => {
            square.classList.remove('valid-move');
        });
        validMoves = [];
    });
}

function rotateBoardForNextPlayer() {
    const chessboard = document.getElementById('chessboard');
    boardRotation = (boardRotation - 90) % 360;
    chessboard.style.transform = `rotate(${boardRotation}deg)`;

    // Counter-rotate all SVG pieces to stay upright
    document.querySelectorAll('.piece').forEach(piece => {
        piece.style.transform = `rotate(${-boardRotation}deg)`;
    });

    // Remove unused rotation classes
    chessboard.classList.remove('rotate-0', 'rotate-90', 'rotate-180', 'rotate-270');
    chessboard.classList.add(`rotate-${boardRotation}`);
}

document.addEventListener('DOMContentLoaded', () => {
    // Add first-move class to all pawns initially
    document.querySelectorAll('.piece.pawn').forEach(pawn => {
        pawn.classList.add('first-move');
        pawn.classList.add('move-2'); // Start move count at 2
    });
    initGame();

    // Resign button
    const resignBtn = document.getElementById('resign-btn');
    if (resignBtn) {
        resignBtn.addEventListener('click', function() {
            if (!resignedPlayers.includes(currentTurn)) {
                resignedPlayers.push(currentTurn);
                setResignedGrey(currentTurn);
                // Skip turn immediately if it's the current player
                currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
                currentTurn = turnOrder[currentTurnIndex];
                skipResignedTurns();
                rotateBoardForNextPlayer();
                setDraggablePieces();
            }
        });
    }
});