cd rapport
asciidoctor-pdf -a mathematical-format=svg -d book -b pdf README.adoc -o Rapport-pact52.pdf
cd ..
command -v evince && evince rapport/Rapport-pact52.pdf
