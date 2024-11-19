tips for processing the audio: https://gist.github.com/pgburt/d6917b5c827f907298cc


# Transcoding OPUS for audio

`ffmpeg -i INPUT -c:a libopus -c1 -b:a BITRATE OUTPUT.ext`

Depending on recording conditions and desired output quality, 12k - 24k for bitrate should be fine.

"-c1" makes audio mono. if you keep stereo, make bitrates higher.

Output should be FILENAME.ogg for firefox and chrome

Output should be FILENAME.caf for safari/ios

Include both in talkthrough with audio and source elements.

Example: 

`ffmpeg -i talkthrough.wav -c:a libopus -b:a 24k talkthrough.ogg`

`ffmpeg -i talkthrough.wav -c:a libopus -b:a 24kk talkthrough.caf`


Audacity Macro

note: if you don't have highpassfilter and lowpassfilter in your effects, you need to enable them in your preferences. 

`Compressor:AttackTime="0.2" NoiseFloor="-25" Normalize="1" Ratio="3" ReleaseTime="1" Threshold="-24" UsePeak="1"
FilterCurve:f0="155.2759" f1="199.36535" f2="254.15227" FilterLength="8191" InterpolateLin="0" InterpolationMethod="B-spline" v0="-0.10033607" v1="6.7224083" v2="0.100334
17"
High-passFilter:frequency="30" rolloff="dB24"
Low-passFilter:frequency="10000" rolloff="dB24"
Normalize:ApplyGain="1" PeakLevel="-1" RemoveDcOffset="1" StereoIndependent="0"`