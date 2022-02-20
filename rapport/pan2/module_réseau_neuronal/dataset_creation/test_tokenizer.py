from tokenizer import tokenizer


# Open a file: file
file = open('data/temp.html', mode='r')

# read all lines at once
html_file = file.read()

# close the file
file.close()


print(tokenizer(html_file))
