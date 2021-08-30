const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

let userImage = new Image();
userImage.src = "./test.png"


// 조작키 wsad
let up = false,
    right = false,
    down = false,
    left = false

document.addEventListener('keydown', press)
function press(e){
    if (e.keyCode === 87) {
        up = true
    }
    if (e.keyCode === 68) {
        right = true
    }
    if (e.keyCode === 83) {
        down = true
    }
    if (e.keyCode === 65) {
        left = true
    }
    // 키보드 방향키 위 버튼 (발사)
    if (e.keyCode === 38) {
        shootingUp = true
    }
}

document.addEventListener('keyup', release)
function release(e){
    if (e.keyCode === 87) {
        up = false
    }
    if (e.keyCode === 68) {
        right = false
    }
    if (e.keyCode === 83) {
        down = false
    }
    if (e.keyCode === 65) {
        left = false
    }
    
    // 키보드 방향키 위 버튼 (발사)
    if (e.keyCode === 38) {
        shootingUp = false
    }
}


class Player {
    constructor(x, y, radius, color, character) {
        this.x = x;
        this.y = y;
        // player의 모양은 원
        this.radius = radius;
        this.color = color;
        this.character = character;
    }

    draw() {
        if (up) {
            this.y = this.y - 4
        }
        if (right) {
            this.x = this.x + 4
        }
        if (down) {
            this.y = this.y + 4
        }
        if (left) {
            this.x = this.x - 4
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        // ctx.fillStyle = this.color;
        // 이미지 위치 조절하기
        ctx.drawImage(userImage, this.x-16, this.y-16);
        ctx.fill();
    }
}

// 발사체 클래스
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        if (up) {
            this.y = this.y - 4
        }
        if (right) {
            this.x = this.x + 4
        }
        if (down) {
            this.y = this.y + 4
        }
        if (left) {
            this.x = this.x - 4
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99
// 뚱뚱이 적이 한대 맞으면 팡팡 튀는 효과 만들기 위한 입자 객체
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

// x좌표 값을 원래 캔버스의 반으로 설정해 플레이어가 정중앙에 위치하게 만듦
const x = canvas.width / 2; 
const y = canvas.height / 2;

let player = new Player(x, y, 15, 'red', userImage);
let projectiles = [];
let enemies = [];
let particles = [];

// 스피드 업 함수 밖에 놔두고 증가 시키자.
let speedUp = 1;

function init() {
    player = new Player(x, y, 15, 'red', userImage);
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
    speedUp = 0;
}


function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4; 
        let x;
        let y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ?  0 - radius :  canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ?  0 - radius :  canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        
        const velocity = {
            x: Math.cos(angle) * speedUp,
            y: Math.sin(angle) * speedUp
        }
        speedUp += 0.02;

        enemies.push(new Enemy(x, y, radius, color, velocity ))
    },  200)
}

let animationId
let score = 0;
function animate() {
    animationId =  requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
        
    });
    projectiles.forEach((projectile, index) => {
        projectile.update()

        if (projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
            ) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0) 
        }
    });

    enemies.forEach((enemy, index)  => {
        enemy.update() 

        const dist =  Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // 적이 사용자에 닿으면 게임 종료
        if (dist - enemy.radius - player .radius  < 1 || 
            player.x < 0 || 
            player.x > canvas.width || 
            player.y < 0 || 
            player.y > canvas.height) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist =  Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            
            // 적들 맞추면 크기가 점점 줄어듦
            if (dist - enemy.radius - projectile.radius  < 1) {
                
                // 폭발!
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            projectile.x, 
                            projectile.y, 
                            Math.random() * 2, 
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 6), 
                                y: (Math.random() - 0.5) * (Math.random() * 6)
                            }
                        )
                    )
                }

                // 만약 적의 크기가 한번 뚜까맞아도 5보다 크면 -10
                if (enemy.radius - 10 > 5) {
                    // 점수 증가시키기
                    score += 50
                    scoreEl.innerHTML = score

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0) 
                } else {
                    // 보너스 점수
                    score += 100
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0) 
                }
            }
        })
    });
};

addEventListener('click', (event) => {
    // atan2는 각도를 생성할 때 불러오는 함수 근데 재밌는 점은 y, x 순서임
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    ) 
    const velocity = {
        x: Math.cos(angle) * 8,
        y: Math.sin(angle) * 8
    }

    // 처음 두 x, y 좌표는 플레이어의 위치값과 동일 시 시킴. 그래야지 총알이 같은 방향에서 나감
    projectiles.push(new Projectile(
        player.x, player.y, 5, 'red', velocity,
    ));

});


// 게임 시작 버튼 실행 시~
startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';
})
