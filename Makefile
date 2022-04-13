api:
	cd auto-form-app; npm install
	cd test-api; npm install
	-cd test-api; npm run test
	rm auto-form-config.json
	rm bdd.zip.enc

interface:
	make load-api &
	cd test-interface-app; npm install
	cd test-interface-app; npm test

load-api:
	cd auto-form-app; npm install
	cd auto-form-app; PORT=true npm run api

solo-api:
	cd auto-form-app; npm install
	cd auto-form-app; npm run api

cipher:
	cd test-cipher; make

app:
	cd auto-form-app; npm run start

dev:
	cd auto-form-app; npm run pages-dev

.PHONY: api cipher app dev