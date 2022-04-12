api:
	cd auto-form-app; npm install
	cd test-api; npm install
	cd test-api; npm run test

cipher:
	cd test-cipher; make

app:
	cd auto-form-app; npm run start

dev:
	cd auto-form-app; npm run pages-dev

.PHONY: api cipher app dev