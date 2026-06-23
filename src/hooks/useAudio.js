import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

const EQ_TYPES = [
  'lowshelf',
  'peaking', 'peaking', 'peaking', 'peaking',
  'peaking', 'peaking', 'peaking', 'peaking',
  'highshelf'
];

const DEFAULT_PRESETS = {
  Flat: { bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], name: 'Flat' },
  'Bass Boost': { bands: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0], name: 'Bass Boost' },
  Pop: { bands: [2, 3, 4, 5, 3, 2, 1, 2, 3, 2], name: 'Pop' },
  Rock: { bands: [5, 4, 3, 2, 1, 0, 1, 2, 3, 4], name: 'Rock' },
  Jazz: { bands: [3, 3, 2, 1, 2, 3, 4, 4, 5, 5], name: 'Jazz' },
  Vocal: { bands: [-2, -1, 0, 2, 4, 6, 5, 3, 1, 0], name: 'Vocal' },
  Classical: { bands: [4, 3, 2, 1, 0, 0, 1, 2, 3, 4], name: 'Classical' },
  'Hip Hop': { bands: [7, 6, 4, 2, 1, 0, 0, 0, 2, 2], name: 'Hip Hop' },
  Electronic: { bands: [5, 4, 3, 2, 1, 2, 3, 4, 5, 6], name: 'Electronic' },
};

const generateReverbIR = (ctx, duration = 2, decay = 2) => {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
};

const useAudio = (initialVolume = 0.5, onEndedCallback) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isReady, setIsReady] = useState(false);

  const [boost, setBoostState] = useState(1.0);
  const [balance, setBalanceState] = useState(0);
  const [normalization, setNormalizationState] = useState(false);
  const [crossfadeDuration, setCrossfadeDuration] = useState(0);
  const [reverbAmount, setReverbAmount] = useState(0);
  const [eqBands, setEqBands] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [eqPresetName, setEqPresetName] = useState('Flat');
  const [prevVolume, setPrevVolume] = useState(initialVolume);
  const [analyserInstance, setAnalyserInstance] = useState(null);
  const [audioGen, setAudioGen] = useState(0);

  const audioRef = useRef(new Audio());
  const ctxRef = useRef(null);
  const sourceRef = useRef(null);
  const preGainRef = useRef(null);
  const eqRefs = useRef([]);
  const splitterRef = useRef(null);
  const leftGainRef = useRef(null);
  const rightGainRef = useRef(null);
  const mergerRef = useRef(null);
  const compressorRef = useRef(null);
  const reverbGainRef = useRef(null);
  const convolverRef = useRef(null);
  const dryGainRef = useRef(null);
  const wetGainRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const currentSrc = useRef(null);

  const initAudioGraph = useCallback(() => {
    if (ctxRef.current && ctxRef.current.state !== 'closed') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    // If we already have an audio element that was used with a previous
    // MediaElementSource, we need a fresh one (createMediaElementSource
    // can only be called once per element over its lifetime)
    if (ctxRef.current?.state === 'closed' || sourceRef.current) {
      const old = audioRef.current;
      const newAudio = new Audio();
      if (old.src) newAudio.src = old.src;
      newAudio.volume = old.volume;
      newAudio.currentTime = old.currentTime;
      newAudio.crossOrigin = "anonymous";
      newAudio.playbackRate = old.playbackRate;
      audioRef.current = newAudio;
      sourceRef.current = null;
      try { old.pause(); } catch (_) {}
      try { old.removeAttribute('src'); old.load(); } catch (_) {}
      setAudioGen(g => g + 1);
    }

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const source = ctx.createMediaElementSource(audioRef.current);
    sourceRef.current = source;

    const preGain = ctx.createGain();
    preGain.gain.value = 1.0;
    preGainRef.current = preGain;

    const eqNodes = [];
    for (let i = 0; i < 10; i++) {
      const filter = ctx.createBiquadFilter();
      filter.type = EQ_TYPES[i];
      filter.frequency.value = EQ_FREQUENCIES[i];
      filter.Q.value = 0.7;
      filter.gain.value = 0;
      eqNodes.push(filter);
    }
    eqRefs.current = eqNodes;

    const splitter = ctx.createChannelSplitter(2);
    splitterRef.current = splitter;
    const leftGain = ctx.createGain();
    leftGainRef.current = leftGain;
    const rightGain = ctx.createGain();
    rightGainRef.current = rightGain;
    const merger = ctx.createChannelMerger(2);
    mergerRef.current = merger;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressorRef.current = compressor;

    const dryGain = ctx.createGain();
    dryGain.gain.value = 1;
    dryGainRef.current = dryGain;

    const convolver = ctx.createConvolver();
    const ir = generateReverbIR(ctx, 2, 2);
    convolver.buffer = ir;
    convolverRef.current = convolver;

    const wetGain = ctx.createGain();
    wetGain.gain.value = 0;
    wetGainRef.current = wetGain;

    const reverbMixGain = ctx.createGain();
    reverbGainRef.current = reverbMixGain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserNodeRef.current = analyser;
    setAnalyserInstance(analyser);

    source.connect(preGain);
    let lastNode = preGain;
    eqNodes.forEach((eq) => {
      lastNode.connect(eq);
      lastNode = eq;
    });
    lastNode.connect(splitter);
    splitter.connect(leftGain, 0);
    splitter.connect(rightGain, 1);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(compressor);
    compressor.connect(dryGain);
    dryGain.connect(analyser);
    analyser.connect(ctx.destination);

    convolver.connect(wetGain);
    wetGain.connect(analyser);

    compressor.connect(convolver);
  }, []);

  const applyEQ = useCallback((bands, name) => {
    setEqBands(bands);
    setEqPresetName(name);
    if (eqRefs.current.length === 10 && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      eqRefs.current.forEach((node, i) => {
        node.gain.setTargetAtTime(bands[i], now, 0.05);
      });
    }
  }, []);

  const setEQPreset = useCallback((presetName) => {
    const preset = DEFAULT_PRESETS[presetName];
    if (preset) {
      applyEQ(preset.bands, preset.name);
    }
  }, [applyEQ]);

  const setEQBand = useCallback((index, value) => {
    const newBands = [...eqBands];
    newBands[index] = Number(value);
    applyEQ(newBands, 'Custom');
  }, [eqBands, applyEQ]);

  const setBoost = useCallback((val) => {
    const clamped = Math.min(2.0, Math.max(0.5, val));
    setBoostState(clamped);
    if (preGainRef.current && ctxRef.current) {
      preGainRef.current.gain.setTargetAtTime(clamped, ctxRef.current.currentTime, 0.1);
    }
  }, []);

  const setBalance = useCallback((val) => {
    const clamped = Math.min(1, Math.max(-1, val));
    setBalanceState(clamped);
    if (leftGainRef.current && rightGainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      const leftVal = clamped <= 0 ? 1 : 1 - clamped;
      const rightVal = clamped >= 0 ? 1 : 1 + clamped;
      leftGainRef.current.gain.setTargetAtTime(leftVal, now, 0.05);
      rightGainRef.current.gain.setTargetAtTime(rightVal, now, 0.05);
    }
  }, []);

  const setNormalization = useCallback((on) => {
    setNormalizationState(on);
    if (compressorRef.current) {
      compressorRef.current.threshold.value = on ? -24 : 0;
    }
  }, []);

  const setReverb = useCallback((amount) => {
    const clamped = Math.min(100, Math.max(0, amount));
    setReverbAmount(clamped);
    if (dryGainRef.current && wetGainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      const mix = clamped / 100;
      dryGainRef.current.gain.setTargetAtTime(1 - mix * 0.5, now, 0.1);
      wetGainRef.current.gain.setTargetAtTime(mix * 0.7, now, 0.1);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!ctxRef.current) initAudioGraph();
    else if (ctxRef.current.state === 'suspended') ctxRef.current.resume();

    if (isPlaying) {
      audioRef.current.pause();
      setCurrentTime(audioRef.current.currentTime);
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback failed:", err);
        setIsPlaying(false);
      });
    }
  }, [isPlaying, initAudioGraph]);

  const seek = useCallback((time) => {
    if (Number.isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((val) => {
    const newVolume = Math.min(1, Math.max(0, val));
    audioRef.current.volume = newVolume;
    setVolumeState(newVolume);
  }, []);

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
    }
  }, [volume, prevVolume, setVolume]);

  const crossfadeTo = useCallback((src, autoPlay, resolve) => {
    const fadeDuration = crossfadeDuration;
    if (fadeDuration <= 0 || !autoPlay || !isPlaying) {
      audioRef.current.src = src;
      audioRef.current.load();
      if (autoPlay) {
        audioRef.current.play()
          .then(() => { setIsPlaying(true); resolve?.(); })
          .catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
      return;
    }

    const mainGain = ctxRef.current?.createGain();
    if (!mainGain || !ctxRef.current) {
      audioRef.current.src = src;
      audioRef.current.load();
      if (autoPlay) audioRef.current.play().then(() => setIsPlaying(true));
      else setIsPlaying(false);
      return;
    }

    const oldAnalyser = analyserNodeRef.current;
    if (oldAnalyser) {
      try { oldAnalyser.disconnect(); } catch (_) { /* ignore */ }
    }

    sourceRef.current?.disconnect();

    const newSrc = audioRef.current;
    newSrc.src = src;
    newSrc.load();

    const newSource = ctxRef.current.createMediaElementSource(newSrc);
    sourceRef.current = newSource;

    newSource.connect(preGainRef.current);

    const now = ctxRef.current.currentTime;
    const fadeOutEnd = now + fadeDuration;
    mainGain.gain.setValueAtTime(1, now);
    mainGain.gain.linearRampToValueAtTime(0, fadeOutEnd);

    newSrc.volume = 0;
    newSrc.play().then(() => {
      setIsPlaying(true);
      const fadeInEnd = ctxRef.current.currentTime + fadeDuration;
      mainGain.gain.setValueAtTime(0, ctxRef.current.currentTime);
      mainGain.gain.linearRampToValueAtTime(1, fadeInEnd);
      setTimeout(() => {
        newSrc.volume = volume;
        try { mainGain.disconnect(); } catch (ex) { /* ignore */ }
        if (analyserNodeRef.current) {
          try { preGainRef.current?.connect(analyserNodeRef.current); } catch (ex) { /* ignore */ }
        }
        resolve?.();
      }, fadeDuration * 1000 + 50);
    }).catch(() => setIsPlaying(false));
  }, [crossfadeDuration, isPlaying, volume]);

  const loadSong = useCallback((src, autoPlay = true) => {
    if (!src) return;
    if (currentSrc.current === src && isPlaying) return;
    currentSrc.current = src;

    initAudioGraph();
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }
    setIsReady(false);
    setCurrentTime(0);

    audioRef.current.crossOrigin = "anonymous";

    if (crossfadeDuration > 0 && isPlaying && autoPlay && ctxRef.current) {
      crossfadeTo(src, autoPlay);
    } else {
      audioRef.current.src = src;
      audioRef.current.load();
      if (autoPlay) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
    }
  }, [initAudioGraph, crossfadeDuration, isPlaying, crossfadeTo]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsReady(true);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEndedCallback) onEndedCallback();
    };
    const handleError = () => {
      setIsPlaying(false);
      setIsReady(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onEndedCallback, volume, audioGen]);

  useEffect(() => {
    return () => {
      try { audioRef.current?.pause(); } catch (_) { /* ignore */ }
      try { ctxRef.current?.close(); } catch (_) { /* ignore */ }
      ctxRef.current = null;
    };
  }, []);

  return useMemo(() => ({
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isReady,
    togglePlay,
    seek,
    setVolume,
    loadSong,
    setIsPlaying,
    toggleMute,
    setSpeed: (rate) => { audioRef.current.playbackRate = rate; },
    analyser: analyserInstance,

    eqBands,
    eqPresetName,
    eqPresets: DEFAULT_PRESETS,
    setEQPreset,
    setEQBand,
    setEQ: applyEQ,

    boost,
    setBoost,
    balance,
    setBalance,
    normalization,
    setNormalization,
    reverbAmount,
    setReverb,
    crossfadeDuration,
    setCrossfadeDuration,
  }), [
    isPlaying, currentTime, duration, volume, isReady,
    togglePlay, seek, setVolume, loadSong,
    eqBands, eqPresetName, applyEQ, setEQPreset, setEQBand,
    boost, setBoost, balance, setBalance,
    normalization, setNormalization,
    reverbAmount, setReverb,
    crossfadeDuration, setCrossfadeDuration,
  ]);
};

export default useAudio;
