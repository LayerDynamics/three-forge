// src/components/UI/AssetLoader.tsx

import React from "react";
import { useAsset } from "../../hooks/useAsset";

/**
 * Component: AssetLoader
 * Displays the loading status of assets.
 */
const AssetLoader: React.FC = () => {
  const { assets } = useAsset();

  const assetList = Object.values(assets);

  return (
    <div style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,255,255,0.8)", padding: "10px", borderRadius: "5px", maxHeight: "90vh", overflowY: "auto" }}>
      <h3>Asset Loader</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {assetList.map((asset) => (
          <li key={asset.id} style={{ marginBottom: "10px" }}>
            <strong>{asset.id}</strong> ({asset.type})
            <div>
              {asset.loaded ? (
                <span style={{ color: "green" }}>Loaded</span>
              ) : asset.error ? (
                <span style={{ color: "red" }}>Error: {asset.error}</span>
              ) : (
                <span style={{ color: "orange" }}>Loading...</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssetLoader;
