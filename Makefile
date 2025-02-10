.PHONY: all build-all pack-all clean
.PHONY: build-releases-backend pack-releases-backend
.PHONY: build-releases-card pack-releases-card
.PHONY: build-status-catalog-column pack-status-catalog-column
.PHONY: build-backend-module-processor pack-backend-module-processor

# Build and pack all packages
all: build-all pack-all

build-all: build-releases-backend build-releases-card build-status-catalog-column build-backend-module-processor

pack-all: pack-releases-backend pack-releases-card pack-status-catalog-column pack-backend-module-processor

# Individual package targets
build-releases-backend:
	cd packages/backstage-plugin-autogov-releases-backend && yarn build

pack-releases-backend:
	cd packages/backstage-plugin-autogov-releases-backend && yarn pack

build-releases-card:
	cd packages/backstage-plugin-autogov-releases-card && yarn build

pack-releases-card:
	cd packages/backstage-plugin-autogov-releases-card && yarn pack

build-status-catalog-column:
	cd packages/backstage-plugin-autogov-status-catalog-column && yarn build

pack-status-catalog-column:
	cd packages/backstage-plugin-autogov-status-catalog-column && yarn pack

build-backend-module-processor:
	cd packages/backstage-plugin-backend-module-autogov-processor && yarn build

pack-backend-module-processor:
	cd packages/backstage-plugin-backend-module-autogov-processor && yarn pack

# Clean target (optional)
clean:
	rm -f packages/*/dist.tgz
	rm -rf packages/*/dist