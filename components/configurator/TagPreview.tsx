import BoneTag from "./tags/BoneTag";

interface TagPreviewProps {
  shapeName: string;
  petName: string;
  color: string;
  finish: string;
}

export default function TagPreview({
  shapeName,
  petName,
  color,
  finish,
}: TagPreviewProps) {
  if (!shapeName) {
    return (
      <div className="border rounded-2xl p-10 text-center text-gray-500">
        Select a shape to start customizing.
      </div>
    );
  }

  switch (shapeName) {
    case "bone":
      return (
        <BoneTag
          petName={petName}
          color={color}
          finish={finish}
        />
      );

    default:
      return (
        <div className="border rounded-2xl p-10 text-center">
          Shape not available yet.
        </div>
      );
  }
}