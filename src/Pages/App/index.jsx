import { useCallback, useEffect, useRef, useState } from 'react';
import logo from '../../assets/logo.png';
import './SunsetGame.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const BurgerRush = () => {
  const canvasRef = useRef(null);
  const playerXRef = useRef(0.5);
  const keysRef = useRef({ left: false, right: false });
  const gameRef = useRef({ items: [], score: 0, lastSpawn: 0, lastFrame: 0 });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem('domi-burger-rush-best')) || 0);
  const [isRunning, setIsRunning] = useState(false);

  const movePlayer = useCallback((direction) => {
    keysRef.current[direction] = true;
  }, []);

  const stopPlayer = useCallback(() => {
    keysRef.current.left = false;
    keysRef.current.right = false;
  }, []);

  useEffect(() => {
    const handleKey = (event, pressed) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(event.key)) event.preventDefault();
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) keysRef.current.left = pressed;
      if (['ArrowRight', 'd', 'D'].includes(event.key)) keysRef.current.right = pressed;
    };

    const keyDown = (event) => handleKey(event, true);
    const keyUp = (event) => handleKey(event, false);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('pointerup', stopPlayer);
    window.addEventListener('pointercancel', stopPlayer);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('pointerup', stopPlayer);
      window.removeEventListener('pointercancel', stopPlayer);
    };
  }, [stopPlayer]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let animationFrame;

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    resizeCanvas();

    const drawGame = (time) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const game = gameRef.current;
      const delta = Math.min((time - (game.lastFrame || time)) / 1000, 0.04);
      game.lastFrame = time;

      if (keysRef.current.left) playerXRef.current -= delta * 0.75;
      if (keysRef.current.right) playerXRef.current += delta * 0.75;
      playerXRef.current = clamp(playerXRef.current, 0.08, 0.92);

      const spawnDelay = Math.max(380, 860 - game.score * 9);
      if (time - game.lastSpawn > spawnDelay) {
        const dangerChance = Math.min(0.35, 0.16 + game.score * 0.003);
        game.items.push({
          x: 0.08 + Math.random() * 0.84,
          y: -30,
          danger: Math.random() < dangerChance,
          speed: 105 + Math.random() * 65 + Math.min(game.score * 2.5, 120),
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 2,
        });
        game.lastSpawn = time;
      }

      context.clearRect(0, 0, width, height);
      context.fillStyle = '#fff9e9';
      context.fillRect(0, 0, width, height);
      context.strokeStyle = 'rgba(47, 47, 47, 0.08)';
      context.lineWidth = 1;
      for (let y = 24; y < height; y += 38) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      const playerX = playerXRef.current * width;
      const playerY = height - 43;
      context.fillStyle = '#303030';
      context.beginPath();
      context.roundRect(playerX - 42, playerY, 84, 20, 8);
      context.fill();
      context.fillStyle = '#ffd35a';
      context.beginPath();
      context.roundRect(playerX - 34, playerY - 8, 68, 12, 6);
      context.fill();
      context.font = '700 12px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillStyle = '#ffffff';
      context.fillText('DOMI', playerX, playerY + 14);

      game.items = game.items.filter((item) => {
        item.y += item.speed * delta;
        item.rotation += item.spin * delta;
        const itemX = item.x * width;

        context.save();
        context.translate(itemX, item.y);
        context.rotate(item.rotation);
        context.font = item.danger ? '800 21px Arial, sans-serif' : '34px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        if (item.danger) {
          context.fillStyle = '#ef3035';
          context.beginPath();
          context.roundRect(-23, -19, 46, 38, 8);
          context.fill();
          context.fillStyle = '#ffffff';
          context.fillText('404', 0, 1);
        } else {
          context.fillText('🍔', 0, 1);
        }
        context.restore();

        const caught = item.y > playerY - 24 && item.y < playerY + 20 && Math.abs(itemX - playerX) < 48;
        if (caught) {
          game.score = Math.max(0, game.score + (item.danger ? -3 : 1));
          setScore(game.score);
          setBestScore((currentBest) => {
            const nextBest = Math.max(currentBest, game.score);
            if (nextBest !== currentBest) localStorage.setItem('domi-burger-rush-best', nextBest);
            return nextBest;
          });
          return false;
        }

        return item.y < height + 40;
      });

      animationFrame = requestAnimationFrame(drawGame);
    };

    gameRef.current.lastFrame = 0;
    animationFrame = requestAnimationFrame(drawGame);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [isRunning]);

  const handlePointerMove = (event) => {
    if (!isRunning) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    playerXRef.current = clamp((event.clientX - bounds.left) / bounds.width, 0.08, 0.92);
  };

  return (
    <section className="sunset-game" aria-labelledby="game-title">
      <div className="game-heading">
        <span className="game-kicker">UN ÚLTIMO PEDIDO</span>
        <h2 id="game-title">Burger Rush</h2>
        <p>Atrapa las hamburguesas. Esquiva los errores 404.</p>
      </div>

      <div className="game-score" aria-live="polite">
        <span><b>{score}</b> puntos</span>
        <span>Récord <b>{bestScore}</b></span>
      </div>

      <div className="game-stage">
        <canvas
          ref={canvasRef}
          role="img"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            handlePointerMove(event);
          }}
          onPointerMove={handlePointerMove}
          aria-label="Juego Burger Rush. Mueve la bandeja para atrapar hamburguesas y evitar los bloques 404."
        >
          Tu navegador no soporta el juego. Puedes continuar en domiburguer.com.
        </canvas>
        {!isRunning && (
          <div className="game-overlay">
            <span className="overlay-burger" aria-hidden="true">🍔</span>
            <button type="button" onClick={() => setIsRunning(true)}>
              {score ? 'Continuar' : 'Jugar ahora'}
            </button>
            <small>Flechas, A/D o arrastra</small>
          </div>
        )}
      </div>

      <div className="game-controls" aria-label="Controles del juego">
        <button type="button" aria-label="Mover a la izquierda" onPointerDown={() => movePlayer('left')}>←</button>
        <button className="pause-button" type="button" onClick={() => setIsRunning((current) => !current)}>
          {isRunning ? 'Pausa' : 'Seguir'}
        </button>
        <button type="button" aria-label="Mover a la derecha" onPointerDown={() => movePlayer('right')}>→</button>
      </div>
    </section>
  );
};

const App = () => (
  <main className="sunset-page">
    <div className="sunset-glow sunset-glow-one" />
    <div className="sunset-glow sunset-glow-two" />

    <header className="sunset-header">
      <img src={logo} alt="Domiburguer" />
      <span>DOMIBURGUER</span>
      <div className="header-status"><i /> App anterior cerrada</div>
    </header>

    <div className="sunset-content">
      <section className="sunset-message" aria-labelledby="sunset-title">
        <div className="closed-badge"><span>●</span> SERVICIO FINALIZADO</div>
        <h1 id="sunset-title">Esta app<br /><em>cerró su cocina.</em></h1>
        <p className="sunset-lead">
          Esta página ya no está disponible. Todo el trabajo continúa en nuestra nueva plataforma.
        </p>

        <a className="sunset-cta" href="https://domiburguer.com">
          <span><small>NUEVA PLATAFORMA</small>Ir a domiburguer.com</span>
          <b aria-hidden="true">↗</b>
        </a>

        <p className="sunset-note">Guarda el nuevo enlace para tus próximos turnos.</p>
      </section>

      <BurgerRush />
    </div>

    <footer className="sunset-footer">
      <span>Gracias por haber sido parte de esta versión.</span>
      <span>Nos vemos en <a href="https://domiburguer.com">domiburguer.com</a> 🍔</span>
    </footer>
  </main>
);

export default App;
