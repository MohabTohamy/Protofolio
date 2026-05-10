'use client';

import * as THREE from 'three';
import { useRef, useReducer, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, MeshTransmissionMaterial, Environment, Lightformer } from '@react-three/drei';
import { CuboidCollider, BallCollider, Physics, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { easing } from 'maath';

const accents = ['#4060ff', '#20ffa0', '#ff4060', '#ffcc00'];

const shuffle = (accent = 0) => [
    { color: '#444', roughness: 0.1 },
    { color: '#444', roughness: 0.75 },
    { color: '#444', roughness: 0.75 },
    { color: 'white', roughness: 0.1 },
    { color: 'white', roughness: 0.75 },
    { color: 'white', roughness: 0.1 },
    { color: accents[accent], roughness: 0.1, accent: true },
    { color: accents[accent], roughness: 0.75, accent: true },
    { color: accents[accent], roughness: 0.1, accent: true }
];

function Scene() {
    const [accent, click] = useReducer((state) => ++state % accents.length, 0);
    const connectors = useMemo(() => shuffle(accent), [accent]);

    return (
        <Canvas
            onClick={click}
            shadows
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true }}
            camera={{ position: [0, 0, 15], fov: 17.5, near: 1, far: 20 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <ambientLight intensity={0.4} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Suspense fallback={null}>
                <Physics gravity={[0, 0, 0]}>
                    <Pointer />
                    {connectors.map((props, i) => <Connector key={i} {...props} />)}
                    <Connector position={[10, 10, 5]}>
                        <Model>
                            <MeshTransmissionMaterial
                                clearcoat={1}
                                thickness={0.1}
                                anisotropicBlur={0.1}
                                chromaticAberration={0.1}
                                samples={8}
                                resolution={512}
                            />
                        </Model>
                    </Connector>
                </Physics>
            </Suspense>
            <Environment resolution={256}>
                <group rotation={[-Math.PI / 3, 0, 1]}>
                    <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
                    <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
                    <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
                    <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
                </group>
            </Environment>
        </Canvas>
    );
}

interface ConnectorProps {
    position?: [number, number, number];
    children?: React.ReactNode;
    color?: string;
    roughness?: number;
    accent?: boolean;
}

function Connector({
    position,
    children,
    ...props
}: ConnectorProps) {
    const api = useRef<RapierRigidBody>(null);
    const vec = useMemo(() => new THREE.Vector3(), []);
    const r = THREE.MathUtils.randFloatSpread;
    const pos = useMemo(() => position || [r(10), r(10), r(10)] as [number, number, number], [position, r]);

    useFrame((_, delta) => {
        if (api.current) {
            api.current.applyImpulse(
                vec.copy(api.current.translation()).negate().multiplyScalar(0.2),
                true
            );
        }
    });

    return (
        <RigidBody
            linearDamping={4}
            angularDamping={2}
            friction={0.9}
            position={pos}
            ref={api}
            colliders={false}
        >
            <CuboidCollider args={[0.38, 1.27, 0.38]} />
            <CuboidCollider args={[1.27, 0.38, 0.38]} />
            <CuboidCollider args={[0.38, 0.38, 1.27]} />
            {children ? children : <Model {...props} />}
            {props.accent && <pointLight intensity={4} distance={2.5} color={props.color} />}
        </RigidBody>
    );
}

function Pointer() {
    const ref = useRef<RapierRigidBody>(null);
    const ndcMouse = useRef({ x: 0, y: 0 });
    const smooth = useMemo(() => new THREE.Vector3(), []);
    const target = useMemo(() => new THREE.Vector3(), []);

    // Use window-level events so pointer-events:none on the wrapper doesn't block tracking
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            ndcMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            ndcMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    useFrame(({ viewport }) => {
        if (ref.current) {
            target.set((ndcMouse.current.x * viewport.width) / 2, (ndcMouse.current.y * viewport.height) / 2, 0);
            smooth.lerp(target, 0.25);
            ref.current.setNextKinematicTranslation(smooth);
        }
    });

    return (
        <RigidBody position={[0, 0, 0]} type="kinematicPosition" colliders={false} ref={ref}>
            <BallCollider args={[0.7]} />
        </RigidBody>
    );
}

interface ModelProps {
    children?: React.ReactNode;
    color?: string;
    roughness?: number;
}

function Model({ children, color = 'white', roughness = 0 }: ModelProps) {
    const ref = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
    const gltf = useGLTF('/c-transformed.glb');
    const nodes = gltf.nodes as { connector: THREE.Mesh };
    const materials = gltf.materials as { base: THREE.MeshStandardMaterial };

    useFrame((_, delta) => {
        if (ref.current && ref.current.material) {
            easing.dampC(ref.current.material.color, color, 0.2, delta);
        }
    });

    return (
        <mesh ref={ref} castShadow receiveShadow scale={10} geometry={nodes.connector.geometry}>
            <meshStandardMaterial metalness={0.2} roughness={roughness} map={materials.base.map} />
            {children}
        </mesh>
    );
}

export default function LusionConnectors() {
    return <Scene />;
}
