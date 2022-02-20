def tokenizer(text):
    temp = text.split("\n")
    final = []
    for oneLine in temp:
        elements = oneLine.split(">")
        for oneWord in elements:
            if oneWord != "":
                final.append((oneWord + ">").strip())
    return final
