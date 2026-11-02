# Resolve git conflict blocks in the given files by keeping the HEAD ("ours") side.
import sys

for path in sys.argv[1:]:
    out, mode = [], None
    for line in open(path, encoding="utf-8").read().split("\n"):
        if line.startswith("<<<<<<< "):
            mode = "ours"
            continue
        if line.startswith("=======") and mode == "ours":
            mode = "theirs"
            continue
        if line.startswith(">>>>>>> ") and mode == "theirs":
            mode = None
            continue
        if mode != "theirs":
            out.append(line)
    open(path, "w", encoding="utf-8").write("\n".join(out))
    print("resolved", path)
