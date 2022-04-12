api:
	cd auto-form-app; npm install
	cd test-api; npm install
	cd test-api; npm run test
	rm auto-form-config.json
	rm bdd.zip.enc

cipher:
	cd test-cipher; make

app:
	cd auto-form-app; npm run start

dev:
	cd auto-form-app; npm run pages-dev

.PHONY: api cipher app dev