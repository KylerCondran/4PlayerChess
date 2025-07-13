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
    const board = document.getElementById('chessboard');
    const pieces = getInitialPieces();
    renderBoard(board);
    placePieces(board, pieces);
    enableDragAndDrop();
}1

function getInitialPieces() {
    return [
        { type: 'rook', color: 'white', position: 'd1' },
        { type: 'knight', color: 'white', position: 'e1' },
        { type: 'bishop', color: 'white', position: 'f1' },
        { type: 'queen', color: 'white', position: 'g1' },
        { type: 'king', color: 'white', position: 'h1' },
        { type: 'bishop', color: 'white', position: 'i1' },
        { type: 'knight', color: 'white', position: 'j1' },
        { type: 'rook', color: 'white', position: 'k1' },
        { type: 'rook', color: 'black', position: 'd14' },
        { type: 'knight', color: 'black', position: 'e14' },
        { type: 'bishop', color: 'black', position: 'f14' },
        { type: 'queen', color: 'black', position: 'g14' },
        { type: 'king', color: 'black', position: 'h14' },
        { type: 'bishop', color: 'black', position: 'i14' },
        { type: 'knight', color: 'black', position: 'j14' },
        { type: 'rook', color: 'black', position: 'k14' },
    ];
}

function renderBoard(board) {
    // Clear previous board if any
    board.innerHTML = '';
    for (let i = 0; i < 14; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 14; j++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((i + j) % 2 === 0 ? 'light' : 'dark');
            square.dataset.position = String.fromCharCode(97 + j) + (14 - i);
            // Deactivate 9 squares in each corner
            if (
                (i < 3 && j < 3) || // top-left
                (i < 3 && j > 10) || // top-right
                (i > 10 && j < 3) || // bottom-left
                (i > 10 && j > 10)   // bottom-right
            ) {
                square.classList.add('inactive');
                square.style.pointerEvents = 'none';
                square.style.opacity = '0';
            }
            row.appendChild(square);
        }
        board.appendChild(row);
    }
}

function placePieces(board, pieceList) {
    pieceList.forEach(piece => {
        const square = board.querySelector(`[data-position="${piece.position}"]`);
        const pieceElement = document.createElement('div');
        pieceElement.className = `piece ${piece.color} ${piece.type}`;
        // Use global 'pieces' variable for symbol
        if (piece.color === 'white') {
            pieceElement.innerText = pieces.white[piece.type];
        } else {
            pieceElement.innerText = pieces[piece.type];
        }
        pieceElement.draggable = true;
        pieceElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', piece.position);
        });
        square.appendChild(pieceElement);
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