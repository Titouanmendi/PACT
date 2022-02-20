asciidoctor-pdf -a mathematical-format=svg -d book -b pdf rendu.adoc -o Rapport.pdf
command -v evince && evince Rapport.pdf
