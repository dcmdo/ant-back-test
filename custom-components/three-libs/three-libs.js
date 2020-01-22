import Animation from './animation/animation';
import SceneUpdater from './scene/scene-updater';
import CameraController from './camera/camera-controller';
import CameraGoTarget from './camera/camera-go-target';
import CameraWrap from './camera/camera-wrap';
import CameraRaycast from './camera/camera-raycast';
import Loader from './loader/loader';
import DefaultTexture from './texture/default-texture';
import Particle from './particle/particle';
import PointParticle from './particle/point-particle';
import Dispose from './dispose/dispose';
import Drag from './drag/drag';
import Trail from './effect/trail';
import DragAvoidCameraController from './drag/drag-avoid-camera-controller';
import RippleSprite from './ripple-sprite/ripple-sprite';
import LookAtKeepUpper from './look-at-keep-upper/look-at-keep-upper';
import TextTexture from './texture/text-texture';
import CoolLine from './cool-line/cool-line';

import UVAnimMaterial from './materials/uv-anim-material';
import ParticleMaterial from './materials/particle-material';
import PointParticleMaterial from "./materials/point-particle-material";
import TrailMaterial from './materials/trail-material';

export default {
    SceneUpdater:SceneUpdater,
    CameraController:CameraController,
    CameraGoTarget:CameraGoTarget,
    CameraWrap:CameraWrap,
    CameraRaycast:CameraRaycast,
    Loader:Loader,
    Animation:Animation,
    DefaultTexture:DefaultTexture,

    Particle:Particle,
    PointParticle:PointParticle,

    Trail:Trail,

    Dispose:Dispose,
    Drag:Drag,
    DragAvoidCameraController:DragAvoidCameraController,
    RippleSprite:RippleSprite,
    LookAtKeepUpper:LookAtKeepUpper,
    TextTexture:TextTexture,

    CoolLine:CoolLine,

    UVAnimMaterial:UVAnimMaterial,
    ParticleMaterial:ParticleMaterial,
    PointParticleMaterial:PointParticleMaterial,
    TrailMaterial:TrailMaterial
}