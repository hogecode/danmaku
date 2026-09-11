import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, Modal, ScrollView } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import type { PlayerConfig } from "../types";
import { ColorPickerComponent } from "./ColorPicker";
import { usePlayerSettingsStore } from "@/stores/player-settings-store";

interface VideoSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  config: PlayerConfig;
  playbackRates: number[];
  selectedPlaybackRate: number;
  onPlaybackRateChange: (rate: number) => void;
}

export const VideoSettingsModal: React.FC<VideoSettingsModalProps> = ({
  visible,
  onClose,
  config,
  playbackRates,
  selectedPlaybackRate,
  onPlaybackRateChange,
}) => {
  // Zustand ストアから設定を取得
  const { settings, loadSettings, setSetting } = usePlayerSettingsStore();
  const [activeTab, setActiveTab] = useState<"video" | "danmaku">("video");

  // マウント時に設定をロード
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const COMMENT_OPACITY_STEPS = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* モーダルオーバーレイ（背景の半透明レイヤー・クリック時に閉じる） */}
      <TouchableOpacity
        activeOpacity={1}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        {/* モーダルコンテナ（下部から表示） */}
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: 32,
            maxHeight: "80%",
          }}
        >
          {/* モーダルヘッダー（タイトル + クローズボタン） */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingTop: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              設定
            </Text>
            {/* クローズボタン */}
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* タブナビゲーション */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#333",
            }}
          >
            {/* 動画設定タブ */}
            <TouchableOpacity
              onPress={() => setActiveTab("video")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderBottomWidth: activeTab === "video" ? 2 : 0,
                borderBottomColor: "#E64F97",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: activeTab === "video" ? "#E64F97" : "#999",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                動画設定
              </Text>
            </TouchableOpacity>

            {/* コメント設定タブ（ダンマクが有効な場合のみ表示） */}
            {config.danmaku && (
              <TouchableOpacity
                onPress={() => setActiveTab("danmaku")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderBottomWidth: activeTab === "danmaku" ? 2 : 0,
                  borderBottomColor: "#E64F97",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: activeTab === "danmaku" ? "#E64F97" : "#999",
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  コメント設定
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* タブコンテンツ（スクロール可能）
             TODO: スクロールできない
          */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            {/* 動画設定タブのコンテンツ */}
            {activeTab === "video" && (
              <View>
                {/* 再生速度セクションタイトル */}
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 12,
                  }}
                >
                  再生速度
                </Text>

                {/* 再生速度ボタングループ */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  {playbackRates.map((rate) => (
                    <TouchableOpacity
                      key={rate}
                      onPress={() => onPlaybackRateChange(rate)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 4,
                        backgroundColor:
                          selectedPlaybackRate === rate ? "#E64F97" : "#333",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        {rate}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 自動再生セクション */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "bold",
                      marginBottom: 12,
                    }}
                  >
                    自動再生
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setSetting("autoPlay", true)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 4,
                        backgroundColor: settings.autoPlay ? "#E64F97" : "#333",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        ON
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setSetting("autoPlay", false)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 4,
                        backgroundColor: !settings.autoPlay
                          ? "#E64F97"
                          : "#333",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        OFF
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* シーク秒数セクション */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "bold",
                      marginBottom: 12,
                    }}
                  >
                    戻る秒数: {settings.backSeekSeconds}秒
                  </Text>
                  <View
                    style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                  >
                    {[5, 10, 15, 30].map((value) => (
                      <TouchableOpacity
                        key={value}
                        onPress={() => setSetting("backSeekSeconds", value)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 4,
                          backgroundColor:
                            settings.backSeekSeconds === value
                              ? "#E64F97"
                              : "#333",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          {value}秒
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 進む秒数セクション */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "bold",
                      marginBottom: 12,
                    }}
                  >
                    進む秒数: {settings.forwardSeekSeconds}秒
                  </Text>
                  <View
                    style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                  >
                    {[5, 10, 15, 30].map((value) => (
                      <TouchableOpacity
                        key={value}
                        onPress={() => setSetting("forwardSeekSeconds", value)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 4,
                          backgroundColor:
                            settings.forwardSeekSeconds === value
                              ? "#E64F97"
                              : "#333",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          {value}秒
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* コメント設定タブのコンテンツ */}
            {activeTab === "danmaku" && config.danmaku && (
              <View>
                {/* コメント色セクション */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "bold",
                      marginBottom: 12,
                    }}
                  >
                    コメント色
                  </Text>
                  <ColorPickerComponent
                    color={settings.danmakuDefaultColor}
                    onColorChange={(color) =>
                      setSetting("danmakuDefaultColor", color)
                    }
                  />
                </View>

                {/* コメント透明度セクションタイトル（現在値表示） */}
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 12,
                  }}
                >
                  コメント透明度: {Math.round(settings.danmakuOpacity * 100)}%
                </Text>

                {/* 透明度調整コントローラー */}
                <View
                  style={{
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: "#333",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 12,
                  }}
                >
                  {/* 透明度プリセットボタングループ */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {COMMENT_OPACITY_STEPS.map((value) => (
                      <TouchableOpacity
                        key={value}
                        onPress={() => setSetting("danmakuOpacity", value)}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 6,
                          borderRadius: 4,
                          backgroundColor:
                            Math.abs(settings.danmakuOpacity - value) < 0.01
                              ? "#E64F97"
                              : "#555",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: "bold",
                          }}
                        >
                          {Math.round(value * 100)}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default VideoSettingsModal;
