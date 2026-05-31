import wave
import math
import struct

def generate_tone(filename, frequency, duration, wave_type='sine', volume=0.5, fade_out=True):
    sample_rate = 44100
    num_samples = int(sample_rate * duration)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            t = float(i) / sample_rate
            
            # Fade out envelope
            env = 1.0
            if fade_out:
                env = math.exp(-3.0 * t / duration)
                
            if wave_type == 'sine':
                sample = math.sin(2.0 * math.pi * frequency * t)
            elif wave_type == 'square':
                sample = 1.0 if math.sin(2.0 * math.pi * frequency * t) > 0 else -1.0
            elif wave_type == 'triangle':
                sample = 2.0 * abs(2.0 * (t * frequency - math.floor(t * frequency + 0.5))) - 1.0
            
            # Apply volume and envelope
            val = int(sample * env * volume * 32767.0)
            
            data = struct.pack('<h', val)
            wav_file.writeframesraw(data)

# 1. Start Battle: A quick, punchy, high-pitched "ping"
generate_tone('public/sounds/start.wav', 880.0, 1.5, 'sine', volume=0.8)

# 2. 1-Minute Warning: A tense, short double-beep (we'll just do one short ping for now)
generate_tone('public/sounds/warning.wav', 600.0, 0.5, 'sine', volume=0.6)

# 3. Timer Zero Alarm: A longer, repeating digital buzz or pure tone
generate_tone('public/sounds/alarm.wav', 440.0, 2.0, 'square', volume=0.4, fade_out=False)

print("Generated WAV files successfully.")
