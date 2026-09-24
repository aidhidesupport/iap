'use client';

import { useEffect, useRef, useState } from 'react';
import { publicAsset } from '@/lib/site-path';

const revision = '20260924-diagram';
export const demoVideo = publicAsset(`/media/iap-demo.mp4?v=${revision}`);
export const demoCaptions = publicAsset(`/media/iap-demo.vtt?v=${revision}`);
const chapters = [
  [0, 'IAPの定義'], [14, 'IAPの理念'], [26, 'PM・開発者・Codex'],
  [36, '目的・完成条件・対象外'], [50, '途中のずれを拾う'],
  [60, '根拠と次の一手'], [70, '修正・テスト・再照合'],
  [80, '入力と実行結果'], [94, '共有文の具体例'],
  [106, '必要な変更の判断'], [118, 'まとめ'], [126, '音楽'],
] as const;
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function DemoPlayer() {
  const film = useRef<HTMLVideoElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(132);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setEnhanced(true); }, []);

  async function togglePlayback() {
    const video = film.current;
    if (!video) return;
    if (!video.paused) { video.pause(); return; }
    try { setError(''); await video.play(); }
    catch { setError('再生できませんでした。もう一度再生するか、動画ファイルを開いてください。'); }
  }
  function seek(seconds: number) {
    const video = film.current;
    if (!video) return;
    video.currentTime = seconds;
    setPosition(seconds);
  }
  function toggleCaptions() {
    const track = film.current?.textTracks[0];
    if (!track) return;
    const enabled = track.mode !== 'showing';
    track.mode = enabled ? 'showing' : 'disabled';
    setCaptions(enabled);
  }
  const chapter = [...chapters].reverse().find(([time]) => time <= position)?.[0] ?? 0;

  return <div className="demo-player">
    <video ref={film} controls={!enhanced} preload="metadata" playsInline
      poster={publicAsset(`/media/iap-demo-poster.png?v=${revision}`)}
      aria-label="IAPの定義・理念と、Codex連携の実装例を人物図で紹介する動画"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
      onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
      onLoadedMetadata={event => {
        if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration);
      }}
      onVolumeChange={event => setMuted(event.currentTarget.muted)}
      onError={() => setError('動画を読み込めませんでした。動画ファイルを開いてください。')}>
      <source src={demoVideo} type="video/mp4"/>
      <track kind="captions" src={demoCaptions} srcLang="ja" label="説明の字幕（日本語）"/>
      お使いのブラウザは動画に対応していません。<a href={demoVideo}>動画ファイルを開く</a>
    </video>
    {enhanced && <>
      <div className="demo-playback" role="group" aria-label="動画の再生操作">
        <button type="button" onClick={togglePlayback} aria-label={playing ? '動画を一時停止' : '動画を再生'}>{playing ? '一時停止' : '再生'}</button>
        <input type="range" min="0" max={duration} step="0.1" value={position}
          aria-label="再生位置（秒）" aria-valuetext={`${formatTime(position)} / ${formatTime(duration)}`}
          onChange={event => seek(Number(event.target.value))}/>
        <output aria-label="再生時間" aria-live="off">{formatTime(position)} / {formatTime(duration)}</output>
        <button type="button" aria-pressed={muted} aria-label="動画の音声をミュート"
          onClick={() => { if (film.current) film.current.muted = !film.current.muted; }}>音声：{muted ? 'オフ' : 'オン'}</button>
      </div>
      <div className="demo-options">
        <label>場面 <select aria-label="場面を選んで移動" value={chapter} onChange={event => seek(Number(event.target.value))}>
          {chapters.map(([time, label]) => <option key={time} value={time}>{formatTime(time)} {label}</option>)}
        </select></label>
        <button type="button" aria-pressed={captions} onClick={toggleCaptions}>字幕：{captions ? 'オン' : 'オフ'}</button>
        <a href={demoVideo}>動画ファイルを開く</a>
      </div>
    </>}
    {error && <p role="alert" className="demo-error">{error} <a href={demoVideo}>動画ファイルを開く</a></p>}
  </div>;
}
