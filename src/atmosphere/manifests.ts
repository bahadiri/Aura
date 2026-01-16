import { ImageManifest } from './image/manifest';
import { Component as ImageComponent } from './image';

import { NoteTakerManifest } from './note-taker/manifest';
import { Component as NoteTakerComponent } from './note-taker';

import { YoutubePlayerManifest } from './youtube-player/manifest';
import { Component as YoutubePlayerComponent } from './youtube-player';

import { TasksManifest } from './tasks/manifest';
import { Component as TasksComponent } from './tasks';

import { PlotManifest } from './plot/manifest';
import { Component as PlotComponent } from './plot';

import { CharactersManifest } from './characters/manifest';
import { Component as CharactersComponent } from './characters';

export const manifests = [
    { ...ImageManifest, component: ImageComponent },
    { ...NoteTakerManifest, component: NoteTakerComponent },
    { ...YoutubePlayerManifest, component: YoutubePlayerComponent },
    { ...TasksManifest, component: TasksComponent },
    { ...PlotManifest, component: PlotComponent },
    { ...CharactersManifest, component: CharactersComponent }
];










