function randomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true,
        };
        this.visited = false;
        this.emoji = null; // Will hold emoji if cell has one
        this.backgroundColor = null; // Optional background color
    }

    draw(ctx, cellWidth) {
        const px = this.x * cellWidth;
        const py = this.y * cellWidth;

        // Draw background color if set
        if (this.backgroundColor) {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(px, py, cellWidth, cellWidth);
        }

        // Draw walls
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();

        ctx.moveTo(px, py);

        if (this.walls.left) {
            ctx.lineTo(px, py + cellWidth);
        } else {
            ctx.moveTo(px, py + cellWidth);
        }

        if (this.walls.bottom) {
            ctx.lineTo(px + cellWidth, py + cellWidth);
        } else {
            ctx.moveTo(px + cellWidth, py + cellWidth);
        }

        if (this.walls.right) {
            ctx.lineTo(px + cellWidth, py);
        } else {
            ctx.moveTo(px + cellWidth, py);
        }

        if (this.walls.top) {
            ctx.lineTo(px, py);
        } else {
            ctx.moveTo(px, py);
        }

        ctx.stroke();

        // Draw emoji if set
        if (this.emoji) {
            ctx.font = `${cellWidth * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(this.emoji, px + cellWidth / 2, py + cellWidth / 2);
        }
    }

    // find naboerne i grid vha. this.x og this.y
    unvisitedNeighbors(grid) {
        let neighbors = [];

        // Vi er ikke den nordligste celle
        if (this.y > 0) {
            const nord_x = this.x;
            const nord_y = this.y - 1;
            const nord_nabo = grid[nord_x][nord_y];
            if (!nord_nabo.visited) {
                neighbors.push(nord_nabo);
            }
        }

        // Vi er ikke cellen mest til venstre
        if (this.x > 0) {
            const venstre_x = this.x - 1;
            const venstre_y = this.y;
            const venstre_nabo = grid[venstre_x][venstre_y];
            if (!venstre_nabo.visited) {
                neighbors.push(venstre_nabo);
            }
        }

        // Vi er ikke den sydligste celle
        if (this.y < grid[0].length - 1) {
            const syd_x = this.x;
            const syd_y = this.y + 1;
            const syd_nabo = grid[syd_x][syd_y];
            if (!syd_nabo.visited) {
                neighbors.push(syd_nabo);
            }
        }

        // Vi er ikke cellen mest til højre
        if (this.x < grid.length - 1) {
            const højre_x = this.x + 1;
            const højre_y = this.y;
            const højre_nabo = grid[højre_x][højre_y];
            if (!højre_nabo.visited) {
                neighbors.push(højre_nabo);
            }
        }

        return neighbors;
    }

    punchWallDown(otherCell) {
        const dx = this.x - otherCell.x;
        const dy = this.y - otherCell.y;

        if (dx === 1) {
            // otherCell er til venstre for this
            this.walls.left = false;
            otherCell.walls.right = false;
        } else if (dx === -1) {
            // otherCell er til højre for this
            this.walls.right = false;
            otherCell.walls.left = false;
        } else if (dy === 1) {
            // otherCell er over this
            this.walls.top = false;
            otherCell.walls.bottom = false;
        } else if (dy === -1) {
            // otherCell er under this
            this.walls.bottom = false;
            otherCell.walls.top = false;
        }
    }
}

class Maze {
    constructor(cols, rows, canvas) {
        this.grid = [];
        this.cols = cols;
        this.rows = rows;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellWidth = canvas.width / cols;
        this.initializeGrid();

        // Emoji themes - collections of related emojis
        this.emojiThemes = {
            treasure: ['💎', '👑', '🏆', '💰', '🗝️'],
            nature: ['🌸', '🌺', '🌻', '🌹', '🍄'],
            food: ['🍕', '🍔', '🍰', '🍪', '🍩'],
            animals: ['🐱', '🐶', '🐸', '🦊', '🐼'],
            space: ['🌟', '⭐', '🌙', '☀️', '🪐'],
            spooky: ['👻', '🎃', '🦇', '🕷️', '💀']
        };
    }

    initializeGrid() {
        for (let i = 0; i < this.rows; i += 1) {
            this.grid.push([]);
            for (let j = 0; j < this.cols; j += 1) {
                this.grid[i].push(new Cell(i, j));
            }
        }
    }

    draw() {
        for (let i = 0; i < this.rows; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                this.grid[i][j].draw(this.ctx, this.cellWidth);
            }
        }
    }

    // Add emojis to random cells
    decorateWithEmojis(theme = 'treasure', density = 0.15) {
        const themeEmojis = this.emojiThemes[theme] || this.emojiThemes.treasure;
        const totalCells = this.cols * this.rows;
        const numberOfEmojis = Math.floor(totalCells * density);

        for (let i = 0; i < numberOfEmojis; i++) {
            const randomX = randomInteger(0, this.cols);
            const randomY = randomInteger(0, this.rows);
            const cell = this.grid[randomX][randomY];

            // Pick random emoji from theme
            const randomEmoji = themeEmojis[randomInteger(0, themeEmojis.length)];
            cell.emoji = randomEmoji;

            // Optionally add subtle background color
            if (Math.random() > 0.5) {
                cell.backgroundColor = `rgba(255, 255, 200, 0.3)`;
            }
        }
    }

    generate() {
        const start_x = randomInteger(0, this.cols);
        const start_y = randomInteger(0, this.rows);
        let currentCell = this.grid[start_x][start_y];
        let stack = [];

        currentCell.visited = true;

        // Get unvisited neighbors
        // If there are unvisited neighbors:
        // - pick a random one of them
        // - carve a hole through the wall
        // - push current cell on stack
        // - make that neighbor the current cell
        // If not, make the top of stack the current cell
        // If still not, you're done

        while (currentCell != null) {
            let unvisitedNeighbors = currentCell.unvisitedNeighbors(this.grid);
            if (unvisitedNeighbors.length > 0) {
                const randomNeighborCell = unvisitedNeighbors[randomInteger(0, unvisitedNeighbors.length)];
                currentCell.punchWallDown(randomNeighborCell);
                stack.push(currentCell);
                currentCell = randomNeighborCell;
                currentCell.visited = true;
            } else {
                let randomInt = randomInteger(1,4); 
                  if(randomInt === 1){
                     let randomLocation = randomInteger(0, stack.length);
                     currentCell = stack[randomLocation];
                     //stack.splice(randomLocation);
                     currentCell = stack.pop();
                  }
                currentCell = stack.pop();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const themeSelect = document.getElementById('theme');
    const densitySlider = document.getElementById('density');
    const densityValue = document.getElementById('densityValue');
    const regenerateBtn = document.getElementById('regenerate');
    const currentThemeDisplay = document.getElementById('currentTheme');

    const themes = ['treasure', 'nature', 'food', 'animals', 'space', 'spooky'];

    // Update density display
    densitySlider.addEventListener('input', (e) => {
        const value = (parseFloat(e.target.value) * 100).toFixed(0);
        densityValue.textContent = `${value}%`;
    });

    // Function to generate maze
    function generateMaze() {
        // Clear canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create new maze
        const maze = new Maze(20, 20, canvas);
        maze.generate();

        // Get selected theme or random
        let selectedTheme = themeSelect.value;
        if (selectedTheme === 'random') {
            selectedTheme = themes[randomInteger(0, themes.length)];
        }

        // Get density
        const density = parseFloat(densitySlider.value);

        // Decorate with emojis
        maze.decorateWithEmojis(selectedTheme, density);

        // Draw the maze
        maze.draw();

        // Update theme display
        const themeEmoji = {
            treasure: '💎',
            nature: '🌸',
            food: '🍕',
            animals: '🐱',
            space: '🌟',
            spooky: '👻'
        };
        currentThemeDisplay.textContent = `Nuværende tema: ${themeEmoji[selectedTheme]} ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}`;

        console.log(`Generated maze with theme: ${selectedTheme}, density: ${density}`);
    }

    // Generate initial maze
    generateMaze();

    // Regenerate on button click
    regenerateBtn.addEventListener('click', generateMaze);
})
