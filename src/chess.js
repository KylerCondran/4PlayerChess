const pieces = {
    pawn: '♟',
    rook: '♜',
    knight: '♞',
    bishop: '♝',
    queen: '♛',
    king: '♚',
    white: {
        pawn: '♙',
        rook: '♖',
        knight: '♘',
        bishop: '♗',
        queen: '♕',
        king: '♔'
    }
};

function initGame() {
    enableDragAndDrop();
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
            if (pieceElement) {
                fromSquare.removeChild(pieceElement);
                square.appendChild(pieceElement);
                // Update the piece's position attribute for future drags
                pieceElement.addEventListener('dragstart', (ev) => {
                    ev.dataTransfer.setData('text/plain', square.dataset.position);
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initGame);