function initGame() {
    // Make all pieces draggable and set up dragstart listeners
    setDraggablePieces();
    enableDragAndDrop();
}

const turnOrder = ['red', 'blue', 'yellow', 'green'];
let currentTurnIndex = 0;
let currentTurn = turnOrder[currentTurnIndex];

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    const color = currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1);
    indicator.textContent = `${color}'s Move`;
    indicator.style.color = currentTurn;
}

function setDraggablePieces() {
    updateTurnIndicator();
    document.querySelectorAll('.piece').forEach(piece => {
        // Get color from classList (red, blue, yellow, green)
        const colors = ['red', 'blue', 'yellow', 'green'];
        const pieceColor = colors.find(c => piece.classList.contains(c));
        if (pieceColor === currentTurn) {
            piece.setAttribute('draggable', 'true');
        } else {
            piece.setAttribute('draggable', 'false');
        }
    });
    // Set dragstart only for current player's pieces
    document.querySelectorAll('.piece').forEach(piece => {
        piece.removeEventListener('dragstart', piece._dragHandler);
        const colors = ['red', 'blue', 'yellow', 'green'];
        const pieceColor = colors.find(c => piece.classList.contains(c));
        if (pieceColor === currentTurn) {
            const handler = function(e) {
                const parentSquare = piece.parentElement;
                if (parentSquare && parentSquare.dataset.position) {
                    e.dataTransfer.setData('text/plain', parentSquare.dataset.position);
                }
            };
            piece._dragHandler = handler;
            piece.addEventListener('dragstart', handler);
        }
    });
}

// Enable dropping on squares
function enableDragAndDrop() {
    document.querySelectorAll('.square').forEach(square => {
        square.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        square.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromPos = e.dataTransfer.getData('text/plain');
            const fromSquare = document.querySelector(`[data-position="${fromPos}"]`);
            const pieceElement = fromSquare.querySelector('.piece');
            if (pieceElement && pieceElement.getAttribute('draggable') === 'true') {
                // Check if there's a piece to capture
                const capturedPiece = square.querySelector('.piece');
                if (capturedPiece) {
                    // Remove the captured piece
                    square.removeChild(capturedPiece);
                }
                // Move the attacking piece
                fromSquare.removeChild(pieceElement);
                square.appendChild(pieceElement);
                // Next player's turn
                currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
                currentTurn = turnOrder[currentTurnIndex];
                setDraggablePieces();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initGame);