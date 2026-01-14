import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Team, Player } from '../types';

interface TeamViewerProps {
  teams: Team[];
  onClose: () => void;
  onUpdateTeams: (teams: Team[]) => void;
}

const TeamViewer: React.FC<TeamViewerProps> = ({
  teams,
  onClose,
  onUpdateTeams,
}) => {
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
  const [selectedBenchPlayer, setSelectedBenchPlayer] = useState<Player | null>(null);
  const [selectedFieldPlayer, setSelectedFieldPlayer] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingFieldIndex, setDraggingFieldIndex] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 500, height: 700 });

  const currentTeam = teams[currentTeamIdx];

  // Resize canvas responsively (keep 5:7 aspect ratio)
  useEffect(() => {
    const resize = () => {
      const container = canvasRef.current?.parentElement;
      if (!container || !canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const maxWidth = Math.min(container.clientWidth, 800);
      const viewportMaxHeight = Math.max(300, Math.floor(window.innerHeight * 0.65));
      const widthByHeight = Math.floor(viewportMaxHeight * (5 / 7));
      const clientWidth = Math.min(maxWidth, widthByHeight);
      const clientHeight = Math.round(clientWidth * (7 / 5));
      const canvas = canvasRef.current;
      canvas.style.width = clientWidth + 'px';
      canvas.style.height = clientHeight + 'px';
      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
      setCanvasSize({ width: canvas.width, height: canvas.height });
    };
    resize();
    const obs = new ResizeObserver(resize);
    if (canvasRef.current?.parentElement) obs.observe(canvasRef.current.parentElement);
    window.addEventListener('resize', resize);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Draw field + players
  useEffect(() => {
    if (!canvasRef.current || !currentTeam) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // Scale context for high DPI displays
    ctx.save();
    ctx.scale(dpr, dpr);
    
    const displayWidth = width / dpr;
    const displayHeight = height / dpr;

    // Clear
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Draw pitch background
    ctx.fillStyle = '#0b6623';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Pitch lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    // Border
    ctx.strokeRect(10, 10, displayWidth - 20, displayHeight - 20);
    // Mid line
    ctx.beginPath();
    ctx.moveTo(10, displayHeight / 2);
    ctx.lineTo(displayWidth - 10, displayHeight / 2);
    ctx.stroke();
    // Center circle
    ctx.beginPath();
    ctx.arc(displayWidth / 2, displayHeight / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Draw players
    currentTeam.lineup.field.forEach((slot, idx) => {
      if (!slot.player) return; // Não desenhar slots vazios
      
      // Use drag position if this is the dragged player
      let x, y;
      if (draggingFieldIndex === idx && dragPosition) {
        x = dragPosition.x * displayWidth;
        y = dragPosition.y * displayHeight;
      } else {
        x = slot.x * displayWidth;
        y = slot.y * displayHeight;
      }
      const radius = 18;

      // Circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#4CAF50';
      ctx.fill();
      ctx.strokeStyle = selectedFieldPlayer === idx ? '#ffd700' : '#000000';
      ctx.lineWidth = selectedFieldPlayer === idx ? 3 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const name = slot.player.short_name;
      const displayName = name.length > 10 ? name.slice(0, 10) + '…' : name;
      ctx.fillText(displayName, x, y - 2);
      ctx.font = '11px Arial';
      ctx.fillText(`${slot.player.overall}`, x, y + 12);
    });
    
    ctx.restore();
  }, [currentTeam, selectedFieldPlayer, canvasSize, draggingFieldIndex, dragPosition]);

  // Canvas events for drag/drop and placement
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  // Memoized handlers to prevent unnecessary re-renders
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentTeam) return;
    const { x, y } = getCanvasCoords(e);
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    if (selectedBenchPlayer) {
      const onFieldCount = currentTeam.lineup.field.filter(s => s.player).length;
      if (onFieldCount >= 11) {
        alert('Maximum 11 players on field!');
        return;
      }
      
      const updatedTeams = [...teams];
      const team = updatedTeams[currentTeamIdx];
      team.lineup.field.push({ 
        x: x / width, 
        y: y / height, 
        player: selectedBenchPlayer 
      });
      team.lineup.bench = team.lineup.bench.filter(p => p.player_id !== selectedBenchPlayer.player_id);
      onUpdateTeams(updatedTeams);
      setSelectedBenchPlayer(null);
      return;
    }

    // Check if clicking an existing field player
    const hitIndex = currentTeam.lineup.field.findIndex(slot => {
      if (!slot.player) return false;
      const cx = slot.x * width;
      const cy = slot.y * height;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      return dist <= 25;
    });
    
    if (hitIndex >= 0) {
      setDraggingFieldIndex(hitIndex);
      setSelectedFieldPlayer(hitIndex);
    } else {
      setSelectedFieldPlayer(null);
    }
  }, [teams, currentTeamIdx, currentTeam, selectedBenchPlayer, onUpdateTeams]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingFieldIndex === null || !canvasRef.current) return;
    
    const { x, y } = getCanvasCoords(e);
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    const nx = Math.max(0.05, Math.min(0.95, x / width));
    const ny = Math.max(0.05, Math.min(0.95, y / height));
    
    setDragPosition({ x: nx, y: ny });
  }, [draggingFieldIndex]);

  const handleCanvasMouseUp = useCallback(() => {
    if (draggingFieldIndex !== null && dragPosition) {
      const updatedTeams = [...teams];
      const team = updatedTeams[currentTeamIdx];
      const slot = team.lineup.field[draggingFieldIndex];
      slot.x = dragPosition.x;
      slot.y = dragPosition.y;
      onUpdateTeams(updatedTeams);
    }
    
    setDraggingFieldIndex(null);
    setDragPosition(null);
  }, [draggingFieldIndex, dragPosition, teams, currentTeamIdx, onUpdateTeams]);

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentTeam) return;
    const { x, y } = getCanvasCoords(e);
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const hitIndex = currentTeam.lineup.field.findIndex(slot => {
      if (!slot.player) return false;
      const cx = slot.x * width;
      const cy = slot.y * height;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      return dist <= 25;
    });

    if (hitIndex >= 0) {
      const updatedTeams = [...teams];
      const team = updatedTeams[currentTeamIdx];
      const slot = team.lineup.field[hitIndex];
      
      if (slot.player) {
        team.lineup.bench.push(slot.player);
        team.lineup.field.splice(hitIndex, 1);
        onUpdateTeams(updatedTeams);
        setSelectedFieldPlayer(null);
      }
    }
  }, [currentTeam, teams, currentTeamIdx, onUpdateTeams]);

  // Handle bench player click
  const handleBenchPlayerClick = useCallback((player: Player) => {
    setSelectedBenchPlayer(
      selectedBenchPlayer?.player_id === player.player_id ? null : player
    );
    setSelectedFieldPlayer(null);
  }, [selectedBenchPlayer]);

  if (!currentTeam) return null;

  return (
    <div className="modal">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>Team Lineups</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="team-selector">
            <label>Selecione o time:</label>
            <select
              value={currentTeamIdx}
              onChange={(e) => {
                setCurrentTeamIdx(Number(e.target.value));
                setSelectedBenchPlayer(null);
                setSelectedFieldPlayer(null);
              }}
            >
              {teams.map((team, idx) => (
                <option key={idx} value={idx}>
                  {team.name}
                </option>
              ))}
            </select>
            <button
              className="btn-secondary"
              style={{ marginLeft: 'auto' }}
              onClick={() => {
                if (!currentTeam) return;
                const updatedTeams = [...teams];
                const team = updatedTeams[currentTeamIdx];
                team.lineup.field.forEach(slot => {
                  if (slot.player) {
                    team.lineup.bench.push(slot.player);
                  }
                });
                team.lineup.field = [];
                onUpdateTeams(updatedTeams);
              }}
            >
              Clear Field
            </button>
          </div>

          <div className="lineup-container">
            <div className="field-container">
              <h4>Field (click to place/remove player)</h4>
              <canvas
                ref={canvasRef}
                width={500}
                height={700}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onDoubleClick={handleCanvasDoubleClick}
                style={{ cursor: draggingFieldIndex !== null ? 'grabbing' : 'pointer' }}
              />
            </div>

            <div className="bench-container">
              <h4>Bench</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Pos</th>
                      <th>OVR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeam.lineup.bench.map((player) => (
                      <tr
                        key={player.player_id}
                        className={
                          selectedBenchPlayer?.player_id === player.player_id
                            ? 'selected'
                            : ''
                        }
                        onClick={() => handleBenchPlayerClick(player)}
                      >
                        <td>{player.short_name}</td>
                        <td className="center">{player.player_positions}</td>
                        <td className="center">{player.overall}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamViewer;
