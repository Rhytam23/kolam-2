import os, glob, shutil
d = r"C:\Users\2020s\.gemini\antigravity\brain\4e4f1df8-25ca-4890-87fb-45a2337d2fb2"
for f in glob.glob(os.path.join(d, "media__*.png")):
    print("Copying:", os.path.basename(f))
    shutil.copy(f, r"E:\kolam-2-main\public")
print("Done")
