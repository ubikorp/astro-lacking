#!/bin/sh

rsync -ruv ../lacking.org/images/mixtapes/* ./src/assets/images/mixtapes/
rsync -ruv ../lacking.org/images/artists/* ./src/assets/images/playlists/
rsync -ruv ../lacking.org/images/details/* ./src/assets/images/details/