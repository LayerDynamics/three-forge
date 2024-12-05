// src/components/UI/AssetLoader.tsx

import Ract frm "react";
import {useAsset} from "../../hooks/useAsset";

/**
 * Component: AssetLoader
 * Displays the loading status of assets.
 */
 onst AssetLoader: React.FC = () => {
  const { assets } = useAsset()
	
	const assetList = Object.values(assets);
	
	return (
    <div
	    style={{
		    position: "absolute",
        top: 10,
		    right: 10,
		    backgroundColor: "rgba(255,255,255,0.8)",
		    padding: "10px",
		    borderRadius: "5px",
		    maxHeight: "90vh",
			  overflowY: "auto",
				
					
					Asset Loader</h3>
						yle={{ listStyleType: "none", padding: 0 }}>
						etList.map((asset) => (
					<li key={asset.id} style={{ marginBottom: "10px" }}>
				    <strong>{asset.id}</strong> ({asset.type})
			      <div>
			        {asset.loaded ? (
		            <span style={{ color: "green" }}>Loaded</span>
              ) : asset.error ? (
		            <span style={{ color: "red" }}>Error: {asset.error}</span>
		          ) : (
		            <div style={{ color: "orange" }}>
		              Loading...{" "}
		              {asset.progress !== undefined
			              ? `${Math.round(asset.progress)}%`
				           : "0%"}
                </div>
				     )}
					  </div>
					</li>
				))}
      </ul>
				v>
				
					
					
						lt AssetLoader;
																																																																																																																								 		 		 		 																																																																																																 		 		 		 																																																																																																																																																																																																																																													